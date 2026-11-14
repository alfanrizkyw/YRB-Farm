import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookie, verifySession } from "@/lib/session";

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySession(jar.get(sessionCookie.name)?.value);
}

export async function guard(req: Request): Promise<NextResponse | null> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (req.method !== "GET" && req.headers.get("x-yrb-admin") !== "1") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

export function storeError(error?: string) {
  const status = error === "DATABASE_NOT_CONFIGURED" ? 503 : 502;
  const message =
    error === "DATABASE_NOT_CONFIGURED"
      ? "Database belum terhubung. Hubungkan Google Sheets lewat Apps Script."
      : "Gagal menyimpan ke database. Coba lagi.";
  return NextResponse.json({ error: message }, { status });
}
