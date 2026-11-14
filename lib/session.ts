import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE = "yrb_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const password = process.env.ADMIN_PASSWORD?.trim() || "";
// Rahasia terpisah untuk menandatangani sesi. Jika tidak diisi, dipakai turunan
// password (kurang ideal: password pendek bisa ditebak dari cookie yang bocor).
const sessionSecret = process.env.SESSION_SECRET?.trim() || "";

export const adminConfigured = password.length >= 6;

function sessionKey(): Buffer {
  return createHmac("sha256", sessionSecret || password)
    .update("yrb-farm/session/v1")
    .digest();
}

function sign(payload: string): string {
  return createHmac("sha256", sessionKey()).update(payload).digest("base64url");
}

export function createSession(): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${exp}.${randomBytes(8).toString("hex")}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined | null): boolean {
  if (!token || !adminConfigured) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, exp, nonce, sig] = parts;
  if (version !== "v1" || !exp || !nonce || !sig) return false;
  const expected = sign(`${version}.${exp}.${nonce}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const expires = Number(exp);
  return Number.isFinite(expires) && expires > Math.floor(Date.now() / 1000);
}

export function verifyPassword(input: string): boolean {
  if (!adminConfigured) return false;
  const a = createHmac("sha256", "yrb-farm/login/v1").update(input).digest();
  const b = createHmac("sha256", "yrb-farm/login/v1").update(password).digest();
  return timingSafeEqual(a, b);
}

export const sessionCookie = {
  name: COOKIE,
  ttl: SESSION_TTL_SECONDS,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  },
};
