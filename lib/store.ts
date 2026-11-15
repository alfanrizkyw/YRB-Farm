import { get, put } from "@vercel/blob";
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

async function readRemote(): Promise<Db | null> {
  if (!storageConfigured) return null;
  try {
    const result = await get(DB_PATH, {
      access: "private",
      token: BLOB_TOKEN,
      useCache: false,
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return normalizeDb(JSON.parse(raw) as Partial<Db>);
  } catch (err) {
    console.error("[store] read failed:", (err as Error).message);
    return null;
  }
}

async function writeRemote(db: Db): Promise<boolean> {
  try {
    await put(DB_PATH, JSON.stringify(db), {
      access: "private",
      token: BLOB_TOKEN,
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    return true;
  } catch (err) {
    console.error("[store] write failed:", (err as Error).message);
    return false;
  }
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
  return (await readRemote()) ?? (await readLocal()) ?? emptyDb();
}

async function saveDb(db: Db): Promise<{ ok: boolean; error?: string }> {
  if (storageConfigured) {
    const ok = await writeRemote(db);
    return ok ? { ok: true } : { ok: false, error: "UPSTREAM_ERROR" };
  }
  if (DEV) {
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
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
  const db = await loadDb();
  db.reviews.unshift(review);
  return saveDb(db);
}

export async function adminUpsertReview(
  review: Review,
): Promise<{ ok: boolean; error?: string }> {
  const db = await loadDb();
  const index = db.reviews.findIndex((r) => r.id === review.id);
  if (index >= 0) db.reviews[index] = review;
  else db.reviews.unshift(review);
  return saveDb(db);
}

export async function adminDeleteReview(id: string) {
  const db = await loadDb();
  db.reviews = db.reviews.filter((r) => r.id !== id);
  return saveDb(db);
}

export async function adminUpsertPromo(
  promo: Promo,
): Promise<{ ok: boolean; error?: string }> {
  const db = await loadDb();
  const index = db.promos.findIndex((p) => p.id === promo.id);
  if (index >= 0) db.promos[index] = promo;
  else db.promos.unshift(promo);
  return saveDb(db);
}

export async function adminDeletePromo(id: string) {
  const db = await loadDb();
  db.promos = db.promos.filter((p) => p.id !== id);
  return saveDb(db);
}

export async function adminSaveSettings(settings: SiteSettings) {
  const db = await loadDb();
  db.settings = normalizeSettings(settings);
  return saveDb(db);
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
  const db = await loadDb();
  const entry = db.login[key];
  const now = Date.now();
  db.login[key] =
    entry && entry.resetAt > now
      ? { fails: entry.fails + 1, resetAt: entry.resetAt }
      : { fails: 1, resetAt: now + LOGIN_WINDOW_MS };

  for (const [k, v] of Object.entries(db.login)) {
    if (v.resetAt <= now) delete db.login[k];
  }
  await saveDb(db);
}

export async function loginSucceeded(key: string): Promise<void> {
  if (!storageConfigured && !DEV) return;
  const db = await loadDb();
  if (!db.login[key]) return;
  delete db.login[key];
  await saveDb(db);
}
