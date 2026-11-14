import { NextResponse } from "next/server";
import { adminConfigured, createSession, sessionCookie, verifyPassword } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`login:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "too_many" },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  if (!adminConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  // constant-ish delay to slow guessing
  await new Promise((resolve) => setTimeout(resolve, 320));

  if (!parsed.success || !verifyPassword(parsed.data.password)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, createSession(), sessionCookie.options);
  return res;
}
