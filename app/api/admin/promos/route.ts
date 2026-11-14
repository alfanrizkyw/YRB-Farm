import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { guard, storeError } from "@/lib/api";
import { adminUpsertPromo } from "@/lib/store";
import { promoInputSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = promoInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const promo = {
    id: randomUUID(),
    title: stripControl(parsed.data.title),
    description: stripControl(parsed.data.description),
    badge: stripControl(parsed.data.badge),
    validUntil: parsed.data.validUntil,
    active: parsed.data.active,
    createdAt: new Date().toISOString(),
  };

  const result = await adminUpsertPromo(promo);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true, promo });
}
