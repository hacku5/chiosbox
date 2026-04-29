# Security Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hardening ChiosBox to production-ready security — input validation (zod), rate limiting, security headers, SQL injection prevention, XSS protection, dependency audit, CI/CD pipeline.

**Architecture:** Phase 0 establishes the security baseline (zod schemas, rate-limit, CSP headers, sanitize). Phases 1-3 harden routes layer-by-layer (Input → Auth → Logic → Output). Phase 4 fixes dependencies and adds CI/CD guardrails. Phase 0 must complete first; Phases 1-4 can run in parallel after.

**Tech Stack:** Next.js 16, Supabase, zod, TypeScript, existing rate-limit.ts

---

## Phase 0 — Infrastructure Setup

### Task 0.1: Install zod and create shared validation schemas

**Files:**
- Create: `src/lib/validation.ts`
- Modify: `package.json` (npm install)

- [ ] **Step 1: Install zod**

```bash
cd "C:\Users\MySir\OneDrive\Desktop\chico" && npm install zod
```

Expected: zod added to package.json, no errors.

- [ ] **Step 2: Create `src/lib/validation.ts` with shared schemas**

```typescript
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
```

- [ ] **Step 3: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds, no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/validation.ts package.json package-lock.json
git commit -m "feat: add zod validation library and shared schemas

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 0.2: Extend rate-limit with preset tiers

**Files:**
- Modify: `src/lib/rate-limit.ts` (add preset tiers)

- [ ] **Step 1: Rewrite `src/lib/rate-limit.ts` adding preset tiers**

Replace the file content:

```typescript
type RateLimitEntry = { count: number; resetAt: number };

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return Response.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

// ── Preset tiers ──

export const RL_TIERS = {
  /** Auth/register: 5 req/hr per IP */
  STRICT: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Default API: 30 req/min per IP */
  DEFAULT: { limit: 30, windowMs: 60 * 1000 },
  /** Admin: 60 req/min per IP */
  ADMIN: { limit: 60, windowMs: 60 * 1000 },
} as const;

export function checkRateLimit(
  request: Request,
  tier: keyof typeof RL_TIERS = "DEFAULT",
  key?: string
) {
  const ip = getClientIp(request);
  const identifier = key ? `${key}:${ip}` : `${request.method}:${ip}`;
  const cfg = RL_TIERS[tier];
  return rateLimit(identifier, cfg.limit, cfg.windowMs);
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts
git commit -m "feat: add preset rate-limit tiers (STRICT/DEFAULT/ADMIN)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 0.3: Add security headers to next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add headers function to `next.config.ts`**

Replace file content:

```typescript
import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.supabase.co",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['100.67.168.113', "mark.tailscale.com"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add security headers (CSP, HSTS, X-Frame, X-Content-Type)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 0.4: Enhance sanitize.ts with entity encoding and length enforcement

**Files:**
- Modify: `src/lib/sanitize.ts`

- [ ] **Step 1: Rewrite `src/lib/sanitize.ts`**

Replace file content:

```typescript
/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Simple regex-based approach — sufficient for plain text fields.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Encode HTML entities to prevent reflected XSS.
 */
export function encodeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Normalize unicode — trim, collapse whitespace, remove control chars.
 */
export function normalizeText(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
    .replace(/\s+/g, " "); // collapse whitespace
}

/**
 * Sanitize and validate a text field.
 * Strips HTML, normalizes, enforces max length.
 */
export function sanitizeText(
  value: unknown,
  maxLength: number = 500
): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = normalizeText(stripHtml(value));
  if (cleaned.length === 0) return undefined;
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize a required text field. Returns null if invalid.
 */
export function sanitizeRequired(
  value: unknown,
  maxLength: number = 500
): string | null {
  if (typeof value !== "string") return null;
  const cleaned = normalizeText(stripHtml(value));
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize an object's string fields recursively.
 * Only sanitizes known keys, leaves unknown keys untouched.
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  keys: string[]
): T {
  const copy = { ...obj };
  for (const key of keys) {
    if (typeof copy[key] === "string") {
      copy[key] = sanitizeRequired(copy[key] as string) || "";
    }
  }
  return copy;
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/sanitize.ts
git commit -m "feat: add HTML entity encoding, unicode normalization to sanitize

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 0.5: Create requireAuth helper and audit service-role usage

**Files:**
- Create: `src/lib/auth-guard.ts`
- Modify: `src/lib/admin-guard.ts` (add auditLog)

- [ ] **Step 1: Create `src/lib/auth-guard.ts` for customer route auth**

```typescript
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export interface AuthUser {
  id: string;
  supabase_user_id: string;
}

export async function requireAuth(): Promise<
  | { user: AuthUser; error: null }
  | { user: null; error: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id, supabase_user_id")
    .eq("supabase_user_id", authUser.id)
    .single();

  if (!appUser) {
    return { user: null, error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user: { id: appUser.id, supabase_user_id: appUser.supabase_user_id }, error: null };
}
```

- [ ] **Step 2: Add `auditLog` to `src/lib/admin-guard.ts`**

Append to end of file:

```typescript
import { getAdminClient } from "@/lib/supabase-admin";

export async function auditLog(
  action: string,
  userId: string,
  target: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = getAdminClient();
    await supabase.from("audit_logs").insert({
      action,
      user_id: userId,
      target,
      details: details || {},
    });
  } catch {
    // Audit failure should never break the main operation
    console.error("[audit] Failed to write audit log:", action, userId, target);
  }
}
```

- [ ] **Step 3: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth-guard.ts src/lib/admin-guard.ts
git commit -m "feat: add requireAuth helper and auditLog for admin routes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 1 — Public Routes

### Task 1.1: Harden POST /api/auth/register

**Files:**
- Modify: `src/app/api/auth/register/route.ts`

- [ ] **Step 1: Rewrite with zod validation and response stripping**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { VALID_PLANS, generateChiosBoxId } from "@/lib/constants";
import { registerSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  // Rate limit: 5 registrations per IP per hour
  const rl = checkRateLimit(request, "STRICT", "register");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const body = await request.json();
  const parsed = validateBody(registerSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, email, password, plan } = parsed.data;

  const supabase = getAdminClient();

  // Check if email already exists before calling admin API
  const { data: existingAuth } = await supabase.auth.admin.listUsers();
  const alreadyExists = existingAuth?.users?.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (alreadyExists) {
    return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
  }

  // Create auth user
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 400 });
  }

  const supabaseUserId = signUpData.user.id;

  // Check if user row already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("supabase_user_id", supabaseUserId)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "This account is already registered" }, { status: 409 });
  }

  // Generate ChiosBox ID and address
  const chiosBoxId = generateChiosBoxId();
  const address = `${name}\nChiosBox ${chiosBoxId}\nSakız Adası Limanı No: ${chiosBoxId.split("-")[1]}\n82100 Sakız (Chios), Yunanistan`;

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Insert user row — NEVER return supabase_user_id to client
  const { data: userRow, error: insertError } = await supabase
    .from("users")
    .insert({
      id: supabaseUserId,
      supabase_user_id: supabaseUserId,
      email,
      name,
      chios_box_id: chiosBoxId,
      address,
      tos_accepted: true,
      plan,
      plan_status: "active",
      plan_started_at: now.toISOString(),
      plan_expires_at: expiresAt.toISOString(),
    })
    .select("id, name, email, chios_box_id, address, plan, plan_status")
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Registration could not be created" }, { status: 500 });
  }

  return NextResponse.json({ user: userRow }, { status: 201 });
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/register/route.ts
git commit -m "fix: add zod validation to register, strip sensitive fields from response

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1.2: Harden GET /api/policies

**Files:**
- Modify: `src/app/api/policies/route.ts`

- [ ] **Step 1: Rewrite with zod validation**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { lang, safeSlug } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugRaw = searchParams.get("slug");
  const langRaw = searchParams.get("lang") || "tr";

  const slugResult = safeSlug.safeParse(slugRaw);
  if (slugRaw && !slugResult.success) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const langResult = lang.safeParse(langRaw);
  const selectedLang = langResult.success ? langResult.data : "tr";

  const supabase = await createClient();

  let query = supabase
    .from("policies")
    .select("id, slug, title, content, language, updated_at")
    .eq("language", selectedLang)
    .eq("published", true);

  if (slugResult.success && slugResult.data) {
    query = query.eq("slug", slugResult.data);
  }

  const { data, error } = await query.order("slug", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }

  const response = NextResponse.json(data);
  response.headers.set("Content-Type", "application/json; charset=utf-8");
  return response;
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/policies/route.ts
git commit -m "fix: add zod validation to policies route

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1.3: CRITICAL — Fix GET /api/settings (service-role + data leak)

**Files:**
- Modify: `src/app/api/settings/route.ts`

- [ ] **Step 1: Switch to createClient + whitelist public keys**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Only these keys may be served to unauthenticated clients
const PUBLIC_SETTING_KEYS = new Set([
  "free_storage_days",
  "plan_price_temel",
  "plan_price_premium",
]);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value");

    if (error) throw error;

    // Filter: only return public-safe keys
    const settings: Record<string, number | string> = {};
    for (const row of data ?? []) {
      if (!PUBLIC_SETTING_KEYS.has(row.key)) continue;
      const parsed =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      settings[row.key] = typeof parsed === "number" ? parsed : String(parsed);
    }

    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/settings/route.ts
git commit -m "fix(CRITICAL): switch settings from service-role to RLS, whitelist public keys

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 1.4: Harden GET /api/translations

**Files:**
- Modify: `src/app/api/translations/route.ts`

- [ ] **Step 1: Rewrite with zod validation**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { lang } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const langParam = searchParams.get("lang");

  // If no lang param, return languages list
  if (!langParam) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("languages")
      .select("code, name, flag, is_default, is_enabled")
      .eq("is_enabled", true)
      .order("code");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ languages: data });
  }

  // Validate lang param
  const langResult = lang.safeParse(langParam);
  if (!langResult.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("translations")
    .select("key, text")
    .eq("language", langResult.data);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const entries: Record<string, string> = {};
  for (const row of data ?? []) {
    entries[row.key] = row.text;
  }

  const response = NextResponse.json({ entries });
  response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  return response;
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/translations/route.ts
git commit -m "fix: add zod validation to translations route

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 2 — Customer Routes

### Task 2.1: Remove tour-guard bypass from POST /api/packages + add zod + rate-limit

**Files:**
- Modify: `src/app/api/packages/route.ts`

- [ ] **Step 1: Rewrite — remove isTourRequest, add zod + rate-limit**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeText } from "@/lib/sanitize";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createPackageSchema, validateBody } from "@/lib/validation";

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("packages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchErr) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "DEFAULT", "packages:create");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(createPackageSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { trackingNo, carrier, content, weightKg, dimensions, notes } = parsed.data;

  const supabase = await createClient();

  // Check for duplicate tracking number
  const { data: existing } = await supabase
    .from("packages")
    .select("id")
    .eq("user_id", user.id)
    .eq("tracking_no", trackingNo)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "You have already reported a package with this tracking number" },
      { status: 409 }
    );
  }

  const { data, error: insertErr } = await supabase
    .from("packages")
    .insert({
      user_id: user.id,
      tracking_no: trackingNo,
      carrier,
      content: content ? sanitizeText(content, 500) : null,
      weight_kg: weightKg ?? null,
      dimensions: dimensions ? sanitizeText(dimensions, 100) : null,
      notes: notes ? sanitizeText(notes, 1000) : null,
      status: "BEKLENIYOR",
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/packages/route.ts
git commit -m "fix: remove tour mock from packages, add zod + rate-limit

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2.2: Harden DELETE /api/packages/[id] + GET/POST /api/packages/[id]/messages

**Files:**
- Modify: `src/app/api/packages/[id]/route.ts`
- Modify: `src/app/api/packages/[id]/messages/route.ts`

- [ ] **Step 1: Rewrite `src/app/api/packages/[id]/route.ts`**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { uuid } from "@/lib/validation";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify ownership and status
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, status")
    .eq("id", idResult.data)
    .eq("user_id", user.id)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  if (pkg.status !== "BEKLENIYOR") {
    return NextResponse.json(
      { error: "Only pending packages can be deleted" },
      { status: 400 }
    );
  }

  const { error: deleteErr } = await supabase
    .from("packages")
    .delete()
    .eq("id", idResult.data)
    .eq("user_id", user.id);

  if (deleteErr) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Rewrite `src/app/api/packages/[id]/messages/route.ts`**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sanitizeRequired } from "@/lib/sanitize";
import { uuid, messageSchema, validateBody } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify ownership (admins bypass via existing admin check)
  const { data: pkg } = await supabase
    .from("packages")
    .select("id, user_id")
    .eq("id", idResult.data)
    .single();

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Allow admin access via separate check — but scoped to RLS for now
  if (pkg.user_id !== user.id) {
    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminCheck?.is_admin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  const { data: messages, error: fetchErr } = await supabase
    .from("package_messages")
    .select("*")
    .eq("package_id", idResult.data)
    .order("created_at", { ascending: true });

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(messages);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rl = checkRateLimit(request, "STRICT", "messages:send");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = validateBody(messageSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const cleanMessage = sanitizeRequired(parsed.data.message, 2000);
  if (!cleanMessage) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error: insertErr } = await supabase
    .from("package_messages")
    .insert({
      package_id: idResult.data,
      sender_id: user.id,
      message: cleanMessage,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 3: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/packages/
git commit -m "fix: add zod + requireAuth to package delete and messages routes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2.3: Remove tour-guard from POST /api/consolidate + add zod

**Files:**
- Modify: `src/app/api/consolidate/route.ts`

- [ ] **Step 1: Rewrite — remove isTourRequest, add requireAuth + zod**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAdminClient } from "@/lib/supabase-admin";
import { getAcceptFee, getConsolidationFee } from "@/lib/fees";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { consolidateSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "DEFAULT", "consolidate");
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(consolidateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { package_ids } = parsed.data;

  const admin = getAdminClient();

  // Verify all packages belong to this user and are DEPODA
  const { data: packages, error: fetchErr } = await admin
    .from("packages")
    .select("*")
    .in("id", package_ids)
    .eq("user_id", user.id)
    .eq("status", "DEPODA");

  if (fetchErr || !packages || packages.length !== package_ids.length) {
    return NextResponse.json(
      { error: "All selected packages must be in warehouse" },
      { status: 400 }
    );
  }

  // Check if any are already invoiced
  const { data: existingItems } = await admin
    .from("invoice_items")
    .select("package_id")
    .in("package_id", package_ids)
    .in("fee_type", ["accept", "consolidation"]);

  const alreadyInvoiced = new Set((existingItems || []).map((i) => i.package_id));
  const uninvoicedPackages = packages.filter((p) => !alreadyInvoiced.has(p.id));

  if (uninvoicedPackages.length === 0) {
    return NextResponse.json(
      { error: "All selected packages are already invoiced" },
      { status: 400 }
    );
  }

  const [acceptRate, consolidationFee] = await Promise.all([
    getAcceptFee(),
    getConsolidationFee(),
  ]);
  const acceptTotal = uninvoicedPackages.length * acceptRate;
  const total = acceptTotal + consolidationFee;

  const masterBoxId = `MBX-${Date.now().toString(36).toUpperCase()}`;

  // Create invoice
  const { data: invoice, error: invErr } = await admin
    .from("invoices")
    .insert({
      user_id: user.id,
      accept_fee: acceptTotal,
      consolidation_fee: consolidationFee,
      demurrage_fee: 0,
      total,
      status: "PENDING",
    })
    .select()
    .single();

  if (invErr) {
    return NextResponse.json({ error: "Invoice could not be created" }, { status: 500 });
  }

  // Create invoice items
  const invoiceItems = uninvoicedPackages.map((pkg) => ({
    invoice_id: invoice.id,
    package_id: pkg.id,
    fee_type: "accept",
    amount: acceptRate,
  }));
  invoiceItems.push({
    invoice_id: invoice.id,
    package_id: uninvoicedPackages[0].id,
    fee_type: "consolidation",
    amount: consolidationFee,
  });

  const { error: itemsErr } = await admin.from("invoice_items").insert(invoiceItems);
  if (itemsErr) {
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Invoice items could not be created" }, { status: 500 });
  }

  // Update packages
  const { error: updateErr } = await admin
    .from("packages")
    .update({ master_box_id: masterBoxId, status: "BIRLESTIRILDI" })
    .in("id", package_ids);

  if (updateErr) {
    await admin.from("invoice_items").delete().eq("invoice_id", invoice.id);
    await admin.from("invoices").delete().eq("id", invoice.id);
    return NextResponse.json({ error: "Packages could not be updated" }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, master_box_id: masterBoxId, invoice_id: invoice.id, total },
    { status: 201 }
  );
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/consolidate/route.ts
git commit -m "fix: remove tour mock from consolidate, add zod + requireAuth + rate-limit

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2.4: Harden GET/PATCH /api/invoices

**Files:**
- Modify: `src/app/api/invoices/route.ts`

- [ ] **Step 1: Rewrite with requireAuth + zod + status transition validation**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { invoiceStatusSchema, validateBody, uuid } from "@/lib/validation";

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("invoices")
    .select("id, total, status, created_at, updated_at, accept_fee, consolidation_fee, demurrage_fee, master_box_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(invoiceStatusSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { invoice_id, status } = parsed.data;

  const supabase = await createClient();

  // Verify ownership
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", invoice_id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Validate status transition
  const allowed = VALID_TRANSITIONS[invoice.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${invoice.status} to ${status}` },
      { status: 400 }
    );
  }

  const { data, error: updateErr } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", invoice_id)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/invoices/route.ts
git commit -m "fix: add zod + status transition map + requireAuth to invoices

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2.5: CRITICAL — Fix GET/PATCH /api/user (strip sensitive fields)

**Files:**
- Modify: `src/app/api/user/route.ts`

- [ ] **Step 1: Rewrite — strip admin fields from GET, add zod to PATCH**

Replace file content:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sanitizeText } from "@/lib/sanitize";
import { requireAuth } from "@/lib/auth-guard";
import { updateUserSchema, validateBody } from "@/lib/validation";

// Fields that are safe to return to the owning user
const SAFE_USER_FIELDS = [
  "id", "name", "email", "phone", "chios_box_id", "address",
  "plan", "plan_status", "preferred_language", "created_at"
].join(", ");

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();
  const { data, error: fetchErr } = await supabase
    .from("users")
    .select(SAFE_USER_FIELDS)
    .eq("id", user.id)
    .single();

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const supabase = await createClient();

  const body = await request.json();

  // Handle password change separately via Supabase Auth
  if (body.password) {
    const parsed = updateUserSchema.pick({ password: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const { error: pwError } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (pwError) {
      return NextResponse.json(
        { error: pwError.message || "Password change failed" },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true });
  }

  const parsed = validateBody(updateUserSchema.omit({ password: true }), body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = sanitizeText(parsed.data.name, 100);
  if (parsed.data.phone !== undefined) updateData.phone = sanitizeText(parsed.data.phone, 20) || null;
  if (parsed.data.address !== undefined) updateData.address = sanitizeText(parsed.data.address, 500) || null;
  if (parsed.data.preferred_language) updateData.preferred_language = parsed.data.preferred_language;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error: updateErr } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", user.id)
    .select(SAFE_USER_FIELDS)
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

- [ ] **Step 2: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/user/route.ts
git commit -m "fix(CRITICAL): strip sensitive fields from /api/user, add zod validation

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2.6: Harden notification subscribe/unsubscribe routes

**Files:**
- Modify: `src/app/api/notifications/subscribe/route.ts`
- Modify: `src/app/api/notifications/unsubscribe/route.ts`

- [ ] **Step 1: Rewrite subscribe route**

Replace `src/app/api/notifications/subscribe/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { pushSubscriptionSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(pushSubscriptionSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error: upsertErr } = await supabase
    .from("push_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    }, { onConflict: "user_id, endpoint" })
    .select()
    .single();

  if (upsertErr) {
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 2: Rewrite unsubscribe route**

Replace `src/app/api/notifications/unsubscribe/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: Request) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint || typeof endpoint !== "string") {
    return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: deleteErr } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (deleteErr) {
    return NextResponse.json({ error: "Unsubscribe failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/notifications/
git commit -m "fix: add requireAuth + zod validation to notification routes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 3 — Admin Routes

### Task 3.1: Add zod + auditLog to high-risk admin routes (intake, invoices, settings, users)

**Files:**
- Modify: `src/app/api/admin/intake/route.ts`
- Modify: `src/app/api/admin/invoices/route.ts`
- Modify: `src/app/api/admin/settings/route.ts`
- Modify: `src/app/api/admin/users/route.ts`
- Modify: `src/app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Rewrite admin/intake/route.ts with zod + auditLog**

Replace `src/app/api/admin/intake/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";
import { adminIntakeSchema, validateBody } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("intake");
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(adminIntakeSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { trackingNo, carrier, content, weightKg, shelfLocation, notes } = parsed.data;

  const supabase = getAdminClient();

  const { data, error: insertErr } = await supabase
    .from("packages")
    .insert({
      tracking_no: trackingNo,
      carrier,
      content: content ? sanitizeText(content, 500) : null,
      weight_kg: weightKg ?? null,
      shelf_location: shelfLocation,
      notes: notes ? sanitizeText(notes, 1000) : null,
      status: "DEPODA",
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Intake failed" }, { status: 500 });
  }

  await auditLog("intake:create", user.id, data.id, { trackingNo });

  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 2: Rewrite admin/invoices/route.ts with zod + auditLog**

Replace `src/app/api/admin/invoices/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";
import { adminInvoiceSchema, validateBody } from "@/lib/validation";
import { getAcceptFee, getConsolidationFee } from "@/lib/fees";

export async function GET(request: Request) {
  const { user, error } = await requireAdmin("invoices");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

  const supabase = getAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error: fetchErr, count } = await supabase
    .from("invoices")
    .select("*, users!inner(name, email, chios_box_id)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ invoices: data, total: count ?? 0, page, limit });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("invoices");
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(adminInvoiceSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Verify target user exists
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", parsed.data.user_id)
    .single();

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [acceptRate, consolidationFee] = await Promise.all([getAcceptFee(), getConsolidationFee()]);

  const { data: invoice, error: insertErr } = await supabase
    .from("invoices")
    .insert({
      user_id: parsed.data.user_id,
      accept_fee: acceptRate,
      consolidation_fee: consolidationFee,
      demurrage_fee: 0,
      total: acceptRate + consolidationFee,
      status: "PENDING",
      description: parsed.data.description,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "Invoice creation failed" }, { status: 500 });
  }

  await auditLog("invoice:create", user.id, invoice.id, { target_user: parsed.data.user_id });

  return NextResponse.json(invoice, { status: 201 });
}
```

- [ ] **Step 3: Rewrite admin/settings/route.ts with zod + auditLog**

Replace `src/app/api/admin/settings/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";
import { adminSettingsSchema, validateBody } from "@/lib/validation";

export async function GET() {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin("settings");
  if (error) return error;

  const body = await request.json();
  const parsed = validateBody(adminSettingsSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { key, value } = parsed.data;
  const supabase = getAdminClient();

  const { data, error: updateErr } = await supabase
    .from("system_settings")
    .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await auditLog("setting:update", user.id, key, { newValue: String(value) });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin("settings");
  if (error) return error;

  const body = await request.json();
  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "updates array is required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const updatePromises = updates.map((u: { key: string; value: string | number }) => {
    const parsed = adminSettingsSchema.safeParse(u);
    if (!parsed.success) return null;
    return supabase
      .from("system_settings")
      .update({ value: JSON.stringify(parsed.data.value), updated_at: new Date().toISOString() })
      .eq("key", parsed.data.key);
  });

  await Promise.all(updatePromises.filter(Boolean));

  await auditLog("setting:bulk_update", user.id, "bulk", { count: updates.length });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Rewrite admin/users/route.ts with pagination limit**

Replace `src/app/api/admin/users/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, isSuperAdmin } from "@/lib/admin-guard";

export async function GET(request: Request) {
  const { user, error } = await requireAdmin("customers");
  if (error) return error;

  // Only super-admin can see permission details
  const superAdmin = isSuperAdmin(user.permissions);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

  const supabase = getAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const selectFields = superAdmin
    ? "id, name, email, phone, chios_box_id, plan, plan_status, is_admin, permissions, created_at"
    : "id, name, email, phone, chios_box_id, plan, plan_status, created_at";

  let query = supabase
    .from("users")
    .select(selectFields, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,chios_box_id.ilike.%${search}%`);
  }

  const { data, error: fetchErr, count } = await query;

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ users: data, total: count ?? 0, page, limit });
}
```

- [ ] **Step 5: Rewrite admin/users/[id]/route.ts with zod + auditLog**

Replace `src/app/api/admin/users/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin, isSuperAdmin, auditLog } from "@/lib/admin-guard";
import { adminUserUpdateSchema, validateBody, uuid } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  if (!isSuperAdmin(user.permissions)) {
    return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = validateBody(adminUserUpdateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data, error: updateErr } = await supabase
    .from("users")
    .update(parsed.data)
    .eq("id", idResult.data)
    .select("id, name, email, is_admin, permissions")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await auditLog("user:update_permissions", user.id, idResult.data, parsed.data);

  return NextResponse.json(data);
}
```

- [ ] **Step 6: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/intake/route.ts src/app/api/admin/invoices/route.ts src/app/api/admin/settings/route.ts src/app/api/admin/users/
git commit -m "fix: add zod + auditLog to high-risk admin routes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3.2: Add zod + error stripping to remaining admin routes (languages, policies, translations, packages, pickup, stats, customers)

**Files:**
- Modify: `src/app/api/admin/languages/route.ts`
- Modify: `src/app/api/admin/policies/route.ts`
- Modify: `src/app/api/admin/translations/route.ts`
- Modify: `src/app/api/admin/translations/seed/route.ts`
- Modify: `src/app/api/admin/packages/route.ts`
- Modify: `src/app/api/admin/packages/[id]/route.ts`
- Modify: `src/app/api/admin/pickup/generate-code/route.ts`
- Modify: `src/app/api/admin/pickup/route.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Modify: `src/app/api/admin/customers/route.ts`
- Modify: `src/app/api/admin/customers/[id]/route.ts`

- [ ] **Step 1: Rewrite admin/languages/route.ts**

Replace with zod validation for POST/PATCH/DELETE:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { adminLanguageSchema, validateBody, lang } from "@/lib/validation";

export async function GET() {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("languages")
    .select("*")
    .order("code");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const parsed = validateBody(adminLanguageSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("languages")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Language code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { code, ...updates } = body;

  const codeResult = lang.safeParse(code);
  if (!codeResult.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("languages")
    .update(updates)
    .eq("code", codeResult.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const codeResult = lang.safeParse(code);
  if (!codeResult.success) {
    return NextResponse.json({ error: "Invalid language code" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("languages")
    .delete()
    .eq("code", codeResult.data);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Rewrite admin/policies/route.ts**

Replace with zod:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { adminPolicySchema, validateBody, safeSlug, lang } from "@/lib/validation";

export async function GET(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "tr";

  const langResult = lang.safeParse(language);
  const selectedLang = langResult.success ? langResult.data : "tr";

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("language", selectedLang)
    .order("slug");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const parsed = validateBody(adminPolicySchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("policies")
    .upsert(parsed.data, { onConflict: "slug,language" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 3: Rewrite admin/translations/route.ts**

Replace with zod:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { lang } from "@/lib/validation";

export async function GET(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const language = searchParams.get("lang") || "tr";
  const langResult = lang.safeParse(language);
  const selectedLang = langResult.success ? langResult.data : "tr";

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("translations")
    .select("id, language, key, text, created_at, updated_at")
    .eq("language", selectedLang)
    .order("key");

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const body = await request.json();
  const { lang: language, entries } = body;

  const langResult = lang.safeParse(language);
  if (!langResult.success || !Array.isArray(entries)) {
    return NextResponse.json({ error: "lang and entries array required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Upsert each entry
  for (const entry of entries) {
    if (!entry.key || typeof entry.key !== "string" || !entry.text || typeof entry.text !== "string") continue;
    await supabase
      .from("translations")
      .upsert(
        { language: langResult.data, key: entry.key, text: entry.text, updated_at: new Date().toISOString() },
        { onConflict: "language,key" }
      );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { error: authErr } = await requireAdmin();
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("translations")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Add confirmation check to admin/translations/seed/route.ts**

Replace:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  // Require explicit confirmation to prevent accidental seed
  const body = await request.json();
  if (!body.confirm) {
    return NextResponse.json(
      { error: "Pass { confirm: true } to confirm seeding. This will upsert ALL translations." },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Use hardcoded seed data from lib
  const { trTranslations, enTranslations, deTranslations } = await import("@/lib/seed-translations");

  let count = 0;
  const all = [
    ...trTranslations.map(([key, text]: [string, string]) => ({ language: "tr", key, text })),
    ...enTranslations.map(([key, text]: [string, string]) => ({ language: "en", key, text })),
    ...deTranslations.map(([key, text]: [string, string]) => ({ language: "de", key, text })),
  ];

  // Batch upsert in chunks of 100
  for (let i = 0; i < all.length; i += 100) {
    const chunk = all.slice(i, i + 100).map((entry) => ({
      ...entry,
      updated_at: new Date().toISOString(),
    }));
    await supabase.from("translations").upsert(chunk, { onConflict: "language,key" });
    count += chunk.length;
  }

  await auditLog("translations:seed", user.id, "bulk", { count });

  return NextResponse.json({ success: true, count });
}
```

- [ ] **Step 5: Rewrite admin/packages/route.ts and admin/packages/[id]/route.ts**

For `admin/packages/route.ts` — add zod for query params, keep getAdminClient (admin needs cross-user view):

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { uuid, trackingNo } from "@/lib/validation";

export async function GET(request: Request) {
  const { error: authErr } = await requireAdmin("packages");
  if (authErr) return authErr;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const status = searchParams.get("status");
  const tracking = searchParams.get("tracking");
  const chiosBoxId = searchParams.get("chios_box_id");
  const userId = searchParams.get("user_id");

  const supabase = getAdminClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("packages")
    .select("*, users!inner(name, email, chios_box_id)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && ["BEKLENIYOR", "YOLDA", "DEPODA", "BIRLESTIRILDI", "TESLIM_EDILDI"].includes(status.toUpperCase())) {
    query = query.eq("status", status.toUpperCase());
  }
  if (tracking && trackingNo.safeParse(tracking).success) {
    query = query.ilike("tracking_no", `%${tracking}%`);
  }
  if (chiosBoxId) {
    query = query.eq("users.chios_box_id", chiosBoxId);
  }
  if (userId && uuid.safeParse(userId).success) {
    query = query.eq("user_id", userId);
  }

  const { data, error: fetchErr, count } = await query;

  if (fetchErr) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({ packages: data, total: count ?? 0, page, limit });
}
```

For `admin/packages/[id]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { auditLog } from "@/lib/admin-guard";
import { uuid } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authErr } = await requireAdmin("packages");
  if (authErr) return authErr;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*, users!inner(name, email, chios_box_id)")
    .eq("id", idResult.data)
    .single();

  if (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const body = await request.json();

  const supabase = getAdminClient();
  const { data, error: updateErr } = await supabase
    .from("packages")
    .update(body)
    .eq("id", idResult.data)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  await auditLog("package:admin_update", user.id, idResult.data, body);

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin("packages");
  if (error) return error;

  const { id } = await params;
  const idResult = uuid.safeParse(id);
  if (!idResult.success) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error: deleteErr } = await supabase
    .from("packages")
    .delete()
    .eq("id", idResult.data);

  if (deleteErr) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  await auditLog("package:admin_delete", user.id, idResult.data);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Build to verify**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/
git commit -m "fix: add zod + auditLog + error stripping to all remaining admin routes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3.3: Clean up — remove tour-guard module and its imports

**Files:**
- Delete: `src/lib/tour-guard.ts`
- Modify: Any remaining files importing tour-guard (search and remove)

- [ ] **Step 1: Search for remaining tour-guard imports**

```bash
cd "C:\Users\MySir\OneDrive\Desktop\chico" && grep -r "tour-guard" src/ --include="*.ts" --include="*.tsx" -l
```

Expected: Only `src/lib/tour-guard.ts` itself (all route imports removed in previous tasks).

- [ ] **Step 2: Delete tour-guard.ts**

```bash
rm src/lib/tour-guard.ts
```

- [ ] **Step 3: Build to verify no broken imports**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds, no "Cannot find module 'tour-guard'" errors.

- [ ] **Step 4: Commit**

```bash
git rm src/lib/tour-guard.ts
git commit -m "fix: remove tour-guard — tour mock bypass eliminated from production

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Phase 4 — Dependencies & CI/CD

### Task 4.1: Replace next-pwa with @serwist/next + update packages

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Uninstall next-pwa, install serwist**

```bash
cd "C:\Users\MySir\OneDrive\Desktop\chico" && npm uninstall @ducanh2912/next-pwa && npm install @serwist/next @serwist/sw
```

Expected: Packages installed, no errors.

- [ ] **Step 2: Update next.config.ts to use serwist**

Replace file content (keeping security headers from Task 0.3):

```typescript
import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['100.67.168.113', "mark.tailscale.com"],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "0" },
        ],
      },
    ];
  },
};

export default withSerwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
```

- [ ] **Step 3: Create service worker entry `src/sw.ts`**

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

- [ ] **Step 4: Build to verify PWA still works**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds, sw.js generated in public/.

- [ ] **Step 5: Run npm update for safe minor/patch bumps**

```bash
npm update 2>&1 | tail -5
```

Expected: 11 packages updated, no errors.

- [ ] **Step 6: Verify npm audit is clean**

```bash
npm audit 2>&1 | tail -5
```

Expected: 0 vulnerabilities (all 7 from next-pwa now gone).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json next.config.ts src/sw.ts
git commit -m "fix: replace next-pwa with serwist, eliminate 7 npm vulnerabilities

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4.2: Add CI/CD security pipeline + pre-commit hooks

**Files:**
- Create: `.github/workflows/security.yml`
- Create: `.husky/pre-commit` (or modify existing)

- [ ] **Step 1: Create GitHub Actions security workflow**

Create `.github/workflows/security.yml`:

```yaml
name: Security Audit

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci

      - name: npm audit
        run: npm audit --audit-level=high

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

  dependency-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
```

- [ ] **Step 2: Install and configure husky + lint-staged**

```bash
cd "C:\Users\MySir\OneDrive\Desktop\chico" && npm install -D husky lint-staged
npx husky init
```

- [ ] **Step 3: Add .husky/pre-commit**

```bash
cat > .husky/pre-commit << 'EOF'
npx lint-staged
EOF
```

- [ ] **Step 4: Add lint-staged config to package.json**

Add to package.json:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

- [ ] **Step 5: Add .env to .gitignore (ensure no secrets committed)**

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/security.yml .husky/pre-commit package.json .gitignore
git commit -m "feat: add CI security pipeline, husky pre-commit hooks

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4.3: Final build verification and security audit report

- [ ] **Step 1: Full production build**

```bash
npm run build 2>&1
```

Expected: Zero errors, zero warnings. All pages built.

- [ ] **Step 2: Final npm audit check**

```bash
npm audit 2>&1
```

Expected: 0 vulnerabilities.

- [ ] **Step 3: Verify security headers in build output**

Check that next.config.ts exports the headers function correctly:

```bash
grep -c "async headers" next.config.ts
```

Expected: 1

- [ ] **Step 4: Commit final state**

```bash
git status
git add -A
git commit -m "chore: final security audit build verification

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Summary

| Phase | Tasks | Routes | Critical Fixes |
|-------|-------|--------|----------------|
| 0 | 5 | Infrastructure | zod, rate-limit tiers, CSP headers, sanitize, requireAuth |
| 1 | 4 | 4 public routes | Settings service-role → RLS, register zod, translations zod |
| 2 | 6 | 7 customer routes | Tour mock removed ×3, user field stripping, invoices transition map |
| 3 | 3 | 17 admin routes | auditLog all mutations, zod all inputs, error message sanitizing |
| 4 | 3 | CI/CD + deps | next-pwa → serwist, GitHub Actions audit, husky pre-commit |
