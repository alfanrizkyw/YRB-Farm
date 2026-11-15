import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import {
  AdminContent,
  Promo,
  PublicContent,
  Review,
  SiteSettings,
  defaultSettings,
} from "@/lib/types";

const DB_PATH = "yrb-farm/db.json";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
const DEV = process.env.NODE_ENV === "development";

export const storageConfigured = Boolean(BLOB_TOKEN);

const LOGIN_MAX_FAILS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

type LoginEntry = { fails: number; resetAt: number };

type Db = {
  reviews: Review[];
  promos: Promo[];
  settings: SiteSettings;
  login: Record<string, LoginEntry>;
};

const emptyDb = (): Db => ({
  reviews: [],
  promos: [],
  settings: defaultSettings,
  login: {},
});

const emptyContent: PublicContent = {
  reviews: [],
  promos: [],
  settings: defaultSettings,
};

function normalizeSettings(input: Partial<SiteSettings> | undefined): SiteSettings {
  return {
    waNumber: (input?.waNumber || defaultSettings.waNumber).replace(/[^\d]/g, ""),
    phoneDisplay: input?.phoneDisplay?.trim() || defaultSettings.phoneDisplay,
    email: input?.email?.trim() || defaultSettings.email,
    farmAddress: input?.farmAddress?.trim() || defaultSettings.farmAddress,
    officeAddress: input?.officeAddress?.trim() || defaultSettings.officeAddress,
    announcement: input?.announcement?.trim() || "",
  };
}

function normalizeDb(input: Partial<Db> | undefined): Db {
  return {
    reviews: Array.isArray(input?.reviews) ? input.reviews : [],
    promos: Array.isArray(input?.promos) ? input.promos : [],
    settings: normalizeSettings(input?.settings),
    login: input?.login && typeof input.login === "object" ? input.login : {},
  };
}

/* ---------------- remote store (Vercel Blob) ---------------- */

async function readRemote(): Promise<{ db: Db; etag: string } | null> {
  if (!storageConfigured) return null;
  try {
    const result = await get(DB_PATH, {
      access: "private",
      token: BLOB_TOKEN,
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return { db: normalizeDb(JSON.parse(raw) as Partial<Db>), etag: result.blob.etag };
  } catch (err) {
    console.error("[store] read failed:", (err as Error).message);
    return null;
  }
}

async function writeRemote(db: Db, etag?: string): Promise<void> {
  await put(DB_PATH, JSON.stringify(db), {
    access: "private",
    token: BLOB_TOKEN,
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ifMatch: etag,
  });
}

/* ---------------- local development store ---------------- */

const localFile = ".data/db.json";

async function readLocal(): Promise<Db | null> {
  if (!DEV) return null;
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(process.cwd() + "/" + localFile, "utf8");
    return normalizeDb(JSON.parse(raw) as Partial<Db>);
  } catch {
    return null;
  }
}

async function writeLocal(db: Db): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = process.cwd() + "/" + localFile;
  await mkdir(process.cwd() + "/.data", { recursive: true });
  await writeFile(path, JSON.stringify(db, null, 2), "utf8");
}

async function loadDb(): Promise<Db> {
  return (await readRemote())?.db ?? (await readLocal()) ?? emptyDb();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function mutate(apply: (db: Db) => void): Promise<{ ok: boolean; error?: string }> {
  if (!storageConfigured) {
    if (!DEV) return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
    const db = (await readLocal()) ?? emptyDb();
    apply(db);
    await writeLocal(db);
    return { ok: true };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const current = await readRemote();
    const db = current?.db ?? emptyDb();
    apply(db);
    try {
      await writeRemote(db, current?.etag);
      return { ok: true };
    } catch (err) {
      if (!(err instanceof BlobPreconditionFailedError)) {
        console.error("[store] write failed:", (err as Error).message);
        return { ok: false, error: "UPSTREAM_ERROR" };
      }
      await sleep(120 * (attempt + 1));
    }
  }
  console.error("[store] write conflicted repeatedly");
  return { ok: false, error: "UPSTREAM_ERROR" };
}

/* ---------------- public reads ---------------- */

export async function getPublicContent(): Promise<PublicContent> {
  const db = await loadDb();
  return {
    reviews: db.reviews
      .filter((r) => r.status === "published")
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 30),
    promos: db.promos
      .filter((p) => p.active)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    settings: normalizeSettings(db.settings),
  };
}

/* ---------------- admin ---------------- */

export async function getAdminContent(): Promise<AdminContent> {
  const db = await loadDb();
  return {
    reviews: db.reviews,
    promos: db.promos,
    settings: normalizeSettings(db.settings),
    connected: storageConfigured || Boolean(await readLocal()),
  };
}

/* ---------------- writes ---------------- */

export async function submitReview(
  input: Omit<Review, "id" | "status" | "createdAt">,
): Promise<{ ok: boolean; error?: string }> {
  const review: Review = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  return mutate((db) => {
    db.reviews.unshift(review);
  });
}

export async function adminUpsertReview(
  review: Review,
): Promise<{ ok: boolean; error?: string }> {
  return mutate((db) => {
    const index = db.reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) db.reviews[index] = review;
    else db.reviews.unshift(review);
  });
}

export async function adminDeleteReview(id: string) {
  return mutate((db) => {
    db.reviews = db.reviews.filter((r) => r.id !== id);
  });
}

export async function adminUpsertPromo(
  promo: Promo,
): Promise<{ ok: boolean; error?: string }> {
  return mutate((db) => {
    const index = db.promos.findIndex((p) => p.id === promo.id);
    if (index >= 0) db.promos[index] = promo;
    else db.promos.unshift(promo);
  });
}

export async function adminDeletePromo(id: string) {
  return mutate((db) => {
    db.promos = db.promos.filter((p) => p.id !== id);
  });
}

export async function adminSaveSettings(settings: SiteSettings) {
  return mutate((db) => {
    db.settings = normalizeSettings(settings);
  });
}

/* ---------------- persistent login throttle ---------------- */

async function loginEntry(db: Db, key: string): Promise<LoginEntry | null> {
  const entry = db.login[key];
  if (!entry || typeof entry.fails !== "number") return null;
  if (entry.resetAt <= Date.now()) return null;
  return entry;
}

export async function loginLocked(key: string): Promise<boolean> {
  if (!storageConfigured && !DEV) return false;
  const db = await loadDb();
  const entry = await loginEntry(db, key);
  return Boolean(entry && entry.fails >= LOGIN_MAX_FAILS);
}

export async function loginFailed(key: string): Promise<void> {
  if (!storageConfigured && !DEV) return;
  await mutate((db) => {
    const entry = db.login[key];
    const now = Date.now();
    db.login[key] =
      entry && entry.resetAt > now
        ? { fails: entry.fails + 1, resetAt: entry.resetAt }
        : { fails: 1, resetAt: now + LOGIN_WINDOW_MS };

    for (const [k, v] of Object.entries(db.login)) {
      if (v.resetAt <= now) delete db.login[k];
    }
  });
}

export async function loginSucceeded(key: string): Promise<void> {
  if (!storageConfigured && !DEV) return;
  await mutate((db) => {
    delete db.login[key];
  });
}
