import { z } from "zod";

export const reviewInputSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(60),
  city: z.string().trim().min(1, "Kota wajib diisi").max(60),
  rating: z.coerce.number().int().min(1).max(5),
  message: z.string().trim().min(10, "Ulasan minimal 10 karakter").max(800),
});

export const reviewAdminSchema = reviewInputSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["published", "pending", "hidden"]),
  createdAt: z.string().min(1),
});

export const promoAdminSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(300),
  badge: z.string().trim().max(24),
  validUntil: z
    .string()
    .trim()
    .regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid")
    .max(10),
  active: z.boolean(),
  createdAt: z.string().min(1),
});

export const promoInputSchema = promoAdminSchema.omit({ id: true, createdAt: true });

export const reviewCreateSchema = reviewInputSchema.extend({
  status: z.enum(["published", "pending", "hidden"]).default("published"),
});

export const settingsSchema = z.object({
  waNumber: z
    .string()
    .trim()
    .regex(/^(\+?62|0)\d{7,14}$/, "Nomor WhatsApp tidak valid"),
  phoneDisplay: z.string().trim().min(6).max(30),
  email: z.string().trim().email("Email tidak valid").max(80),
  farmAddress: z.string().trim().min(5).max(180),
  officeAddress: z.string().trim().min(5).max(180),
  announcement: z.string().trim().max(160),
});

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

export function stripControl(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
