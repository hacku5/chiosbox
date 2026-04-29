import { z } from "zod";

// ── Shared field schemas ──
export const trackingNo = z.string().min(5).max(100).trim();
export const chiosBoxId = z.string().regex(/^CBX-[A-Z0-9]+$/);
export const email = z.string().email().max(255).trim().toLowerCase();
export const password = z.string().min(8).max(128);
export const name = z.string().min(2).max(100).trim();
export const uuid = z.string().uuid();
export const lang = z.enum(["tr", "en", "de"]);
export const safeSlug = z.string().regex(/^[a-z0-9_-]+$/i).max(100);

// ── Route-specific schemas ──

export const registerSchema = z.object({
  name: name,
  email: email,
  password: password,
  plan: z.enum(["TEMEL", "PRO", "PREMIUM"]).default("TEMEL"),
});

export const createPackageSchema = z.object({
  trackingNo: trackingNo,
  carrier: z.string().min(1).max(50).trim(),
  content: z.string().max(500).trim().optional(),
  weightKg: z.number().positive().max(1000).optional(),
  dimensions: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
});

export const consolidateSchema = z.object({
  package_ids: z.array(uuid).min(2).max(10),
});

export const updateUserSchema = z.object({
  name: name.optional(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  preferred_language: lang.optional(),
  password: password.optional(),
});

export const invoiceStatusSchema = z.object({
  invoice_id: uuid,
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
});

export const messageSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export const adminIntakeSchema = z.object({
  trackingNo: trackingNo,
  carrier: z.string().min(1).max(50).trim(),
  content: z.string().max(500).trim().optional(),
  weightKg: z.number().positive().max(1000).optional(),
  shelfLocation: z.string().min(1).max(20).trim(),
  notes: z.string().max(1000).trim().optional(),
});

export const adminInvoiceSchema = z.object({
  user_id: uuid,
  package_ids: z.array(uuid).min(1).optional(),
  description: z.string().max(500).optional(),
});

export const adminSettingsSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.union([z.string(), z.number()]),
});

export const adminLanguageSchema = z.object({
  code: z.string().min(2).max(10).trim(),
  name: z.string().min(1).max(100).trim(),
  flag: z.string().max(10).optional(),
  is_default: z.boolean().optional(),
  is_enabled: z.boolean().optional(),
});

export const adminPolicySchema = z.object({
  slug: safeSlug,
  title: z.string().min(1).max(200).trim(),
  language: lang,
  content: z.string().min(1).max(50000),
});

export const adminUserUpdateSchema = z.object({
  is_admin: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

// ── Validation helper ──
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): {
  success: true; data: T;
} | {
  success: false; error: string;
} {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map(i =>
        `${i.path.join(".")}: ${i.message}`
      ).join("; "),
    };
  }
  return { success: true, data: result.data };
}
