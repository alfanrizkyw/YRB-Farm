import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { guard, storeError } from "@/lib/api";
import { adminSaveSettings } from "@/lib/store";
import { settingsSchema, stripControl } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const settings = {
    waNumber: parsed.data.waNumber.replace(/[^\d]/g, ""),
    phoneDisplay: stripControl(parsed.data.phoneDisplay),
    email: stripControl(parsed.data.email),
    farmAddress: stripControl(parsed.data.farmAddress),
    officeAddress: stripControl(parsed.data.officeAddress),
    announcement: stripControl(parsed.data.announcement),
  };

  const result = await adminSaveSettings(settings);
  if (!result.ok) return storeError(result.error);

  revalidatePath("/", "layout");
  revalidatePath("/en");
  return NextResponse.json({ ok: true });
}
