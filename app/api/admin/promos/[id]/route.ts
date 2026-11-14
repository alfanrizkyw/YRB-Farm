import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guard, storeError } from "@/lib/api";
import { adminDeletePromo, adminUpsertPromo } from "@/lib/store";
import { promoAdminSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = promoAdminSchema.safeParse({ ...(body as object), id });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const promo = {
    ...parsed.data,
    title: stripControl(parsed.data.title),
    description: stripControl(parsed.data.description),
    badge: stripControl(parsed.data.badge),
  };

  const result = await adminUpsertPromo(promo);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true, promo });
}

export async function DELETE(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;

  const { id } = await params;
  const result = await adminDeletePromo(id);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true });
}
