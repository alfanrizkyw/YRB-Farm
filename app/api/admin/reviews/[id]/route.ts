import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guard, storeError } from "@/lib/api";
import { adminDeleteReview, adminUpsertReview } from "@/lib/store";
import { reviewAdminSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = reviewAdminSchema.safeParse({ ...(body as object), id });
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const review = {
    ...parsed.data,
    name: stripControl(parsed.data.name),
    city: stripControl(parsed.data.city),
    message: stripControl(parsed.data.message),
  };

  const result = await adminUpsertReview(review);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(req: Request, { params }: Context) {
  const denied = await guard(req);
  if (denied) return denied;

  const { id } = await params;
  const result = await adminDeleteReview(id);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true });
}
