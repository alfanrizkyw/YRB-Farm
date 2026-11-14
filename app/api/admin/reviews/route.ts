import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { guard, storeError } from "@/lib/api";
import { adminUpsertReview } from "@/lib/store";
import { reviewCreateSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = reviewCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const review = {
    id: randomUUID(),
    name: stripControl(parsed.data.name),
    city: stripControl(parsed.data.city),
    rating: parsed.data.rating,
    message: stripControl(parsed.data.message),
    status: parsed.data.status,
    createdAt: new Date().toISOString(),
  };

  const result = await adminUpsertReview(review);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true, review });
}
