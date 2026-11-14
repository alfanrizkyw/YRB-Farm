import {
  AdminContent,
  Promo,
  PublicContent,
  Review,
  SiteSettings,
  defaultSettings,
} from "@/lib/types";

const API_URL = process.env.SHEET_API_URL?.trim() || "";
const API_TOKEN = process.env.SHEET_API_TOKEN?.trim() || "";
const DEV = process.env.NODE_ENV === "development";

export const storageConfigured = Boolean(API_URL && API_TOKEN);

type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

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

async function readApi<T>(action: string, fresh = false): Promise<T | null> {
  if (!storageConfigured) return null;
  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", action);
    url.searchParams.set("token", API_TOKEN);
    const res = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(9000),
      ...(fresh
        ? { cache: "no-store" as RequestCache }
        : { next: { revalidate: 20, tags: ["content"] } }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<T>;
    return json.ok && json.data ? json.data : null;
  } catch (err) {
    console.error("[store] read failed:", (err as Error).message);
    return null;
  }
}

async function writeApi<T>(
  action: string,
  payload: unknown,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  if (!storageConfigured) return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, token: API_TOKEN, payload }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { ok: false, error: "UPSTREAM_ERROR" };
    return (await res.json()) as ApiResponse<T>;
  } catch (err) {
    console.error("[store] write failed:", (err as Error).message);
    return { ok: false, error: "UPSTREAM_ERROR" };
  }
}

/* ---------------- local development store ---------------- */

type LocalDb = { reviews: Review[]; promos: Promo[]; settings: SiteSettings };

const localFile = ".data/db.json";

async function readLocal(): Promise<LocalDb | null> {
  if (!DEV) return null;
  try {
    const { readFile } = await import("node:fs/promises");
    const raw = await readFile(process.cwd() + "/" + localFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    return {
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
      promos: Array.isArray(parsed.promos) ? parsed.promos : [],
      settings: normalizeSettings(parsed.settings),
    };
  } catch {
    return null;
  }
}

async function writeLocal(db: LocalDb): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = process.cwd() + "/" + localFile;
  await mkdir(process.cwd() + "/.data", { recursive: true });
  await writeFile(path, JSON.stringify(db, null, 2), "utf8");
}

async function ensureLocal(): Promise<LocalDb> {
  const db = await readLocal();
  if (db) return db;
  const fresh: LocalDb = { reviews: [], promos: [], settings: defaultSettings };
  await writeLocal(fresh);
  return fresh;
}

/* ---------------- public reads ---------------- */

export async function getPublicContent(): Promise<PublicContent> {
  const remote = await readApi<PublicContent>("public.get");
  if (remote) {
    return {
      reviews: Array.isArray(remote.reviews) ? remote.reviews : [],
      promos: Array.isArray(remote.promos) ? remote.promos : [],
      settings: normalizeSettings(remote.settings),
    };
  }
  const local = await readLocal();
  if (local) {
    return {
      reviews: local.reviews.filter((r) => r.status === "published").slice(0, 30),
      promos: local.promos.filter((p) => p.active),
      settings: local.settings,
    };
  }
  return emptyContent;
}

/* ---------------- admin ---------------- */

export async function getAdminContent(): Promise<AdminContent> {
  const remote = await readApi<AdminContent>("admin.list", true);
  if (remote) {
    return {
      reviews: Array.isArray(remote.reviews) ? remote.reviews : [],
      promos: Array.isArray(remote.promos) ? remote.promos : [],
      settings: normalizeSettings(remote.settings),
      connected: true,
    };
  }
  const local = await readLocal();
  if (local) {
    return {
      reviews: local.reviews,
      promos: local.promos,
      settings: local.settings,
      connected: DEV,
    };
  }
  return {
    reviews: [],
    promos: [],
    settings: defaultSettings,
    connected: DEV,
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

  if (storageConfigured) {
    const res = await writeApi("review.create", review);
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    db.reviews.unshift(review);
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

export async function adminUpsertReview(
  review: Review,
): Promise<{ ok: boolean; error?: string }> {
  if (storageConfigured) {
    const res = await writeApi("review.upsert", review);
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    const index = db.reviews.findIndex((r) => r.id === review.id);
    if (index >= 0) db.reviews[index] = review;
    else db.reviews.unshift(review);
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

export async function adminDeleteReview(id: string) {
  if (storageConfigured) {
    const res = await writeApi("review.delete", { id });
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    db.reviews = db.reviews.filter((r) => r.id !== id);
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

export async function adminUpsertPromo(
  promo: Promo,
): Promise<{ ok: boolean; error?: string }> {
  if (storageConfigured) {
    const res = await writeApi("promo.upsert", promo);
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    const index = db.promos.findIndex((p) => p.id === promo.id);
    if (index >= 0) db.promos[index] = promo;
    else db.promos.unshift(promo);
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

export async function adminDeletePromo(id: string) {
  if (storageConfigured) {
    const res = await writeApi("promo.delete", { id });
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    db.promos = db.promos.filter((p) => p.id !== id);
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

export async function adminSaveSettings(settings: SiteSettings) {
  const clean = normalizeSettings(settings);
  if (storageConfigured) {
    const res = await writeApi("settings.save", clean);
    return { ok: res.ok, error: res.error };
  }
  if (DEV) {
    const db = await ensureLocal();
    db.settings = clean;
    await writeLocal(db);
    return { ok: true };
  }
  return { ok: false, error: "DATABASE_NOT_CONFIGURED" };
}

/* ---------------- persistent login throttle ---------------- */

// Dipakai agar percobaan login salah dihitung lintas instance serverless.
// Jika storage tidak terhubung atau gagal, fungsi ini "fail open" dan
// pembatas di memori (lib/rate-limit.ts) tetap berlaku.
export async function loginLocked(key: string): Promise<boolean> {
  if (!storageConfigured) return false;
  const res = await writeApi<{ locked: boolean }>("login.check", { key });
  return Boolean(res.ok && res.data?.locked);
}

export async function loginFailed(key: string): Promise<void> {
  if (!storageConfigured) return;
  await writeApi("login.fail", { key });
}

export async function loginSucceeded(key: string): Promise<void> {
  if (!storageConfigured) return;
  await writeApi("login.ok", { key });
}
