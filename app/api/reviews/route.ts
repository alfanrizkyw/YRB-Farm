import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { submitReview } from "@/lib/store";
import { reviewInputSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  const limit = rateLimit(`review:${ip}`, 4, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "too_many" },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (typeof raw.website === "string" && raw.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = reviewInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const result = await submitReview({
    name: stripControl(parsed.data.name),
    city: stripControl(parsed.data.city),
    rating: parsed.data.rating,
    message: stripControl(parsed.data.message),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "failed" },
      { status: result.error === "DATABASE_NOT_CONFIGURED" ? 503 : 502 },
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true });
}
