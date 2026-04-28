# Security Audit Spec — ChiosBox

**Date:** 2026-04-29
**Scope:** Full codebase, production-ready hardening
**Method:** Sequential deep-dive — 4 phases, 4 layers per route

## Phase 0 — Infrastructure Setup

Before touching any route, establish the security baseline.

### 0.1 Validation Library
Install **zod** — all manual validation replaced with typed schemas.
- Centralized at `src/lib/validation.ts`
- Shared schemas: `TrackingNo`, `ChiosBoxId`, `Email`, `Password`
- Route-specific schemas in same file, exported

### 0.2 Rate Limiting
Extend `src/lib/rate-limit.ts` to all non-GET endpoints.
- Default: 30 req/min per IP for auth'd routes
- Strict: 5 req/min per IP for auth, register, password reset
- Admin: 60 req/min per IP (higher ceiling)
- Use existing in-memory Map implementation, add `windowMs` config

### 0.3 Security Headers
Add to `next.config.ts`:
- CSP: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co`
- HSTS: `max-age=31536000; includeSubDomains; preload`
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: `camera=(), microphone=(), geolocation=()`

### 0.4 Input Sanitization
Enhance `src/lib/sanitize.ts`:
- HTML entity encoding for all string outputs
- Trim + normalize unicode for inputs
- Max length enforcement per field type

### 0.5 Service Role Audit Principle
- `getAdminClient()` must only be used in routes that genuinely need it
- All other routes switch to `createClient()` with RLS
- Document which routes need service-role and why

---

## Phase 1 — Public Routes (5 routes, no auth)

### 1.1 POST `/api/auth/register`
**Current auth:** None (public) | **Rate limit:** 5/hr per IP

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | Manual checks, no schema | Zod schema: name(2-100), email(email format), password(8+ chars), plan(VALID_PLANS) |
| Auth | Open to mass registration | Keep 5/hr limit, add email verification flow check |
| Logic | Uses service-role `auth.admin.createUser` — only path in Supabase | Keep, but validate email doesn't already exist before call |
| Output | Returns user data including id | Strip sensitive fields, never return supabase_user_id |

### 1.2 GET `/api/policies`
**Current auth:** None | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | `slug` + `lang` query params, no sanitize | Zod schema: slug(regex safe), lang(enum tr/en/de) |
| Auth | None needed (public content) | OK |
| Logic | Direct DB query | OK, RLS allows public read |
| Output | Returns raw DB content | No HTML injection risk (policies are markdown), but set Content-Type header |

### 1.3 GET `/api/settings`
**Current auth:** None | **Rate limit:** None | **Uses:** getAdminClient()

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | No params | OK |
| Auth | Public, but uses service-role client | **CRITICAL:** Switch to createClient() with RLS. Only return public settings (filter by `is_public` column or hardcode allowed keys) |
| Logic | Returns ALL system settings | **CRITICAL:** Must filter — never expose fee amounts, API keys, internal config. Whitelist: `["free_storage_days", "plan_price_temel", "plan_price_premium"]` |
| Output | Raw JSON | OK after filtering |

### 1.4 GET `/api/translations`
**Current auth:** None | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | `lang` param | Zod: lang(enum tr/en/de), default "tr" |
| Auth | Public | OK |
| Logic | Cached 5min | OK, no injection risk with `.eq("lang", lang)` |
| Output | Returns all translations for a language | OK, intended behavior |

---

## Phase 2 — Customer Routes (7 routes, authenticated)

### 2.1 GET/POST `/api/packages`
**Current auth:** `supabase.auth.getUser()` check | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input (POST) | Manual: tracking_no, carrier, content, weight, value | Zod schema: tracking_no(min 5, max 100), carrier(allowlist), content(sanitized string max 500), weight(0-1000 number), value(number min 0) |
| Input (GET) | No params needed (user-scoped) | OK |
| Auth | Manual auth check | Centralize into `requireAuth()` helper, reuse across Phase 2 |
| Logic | **isTourRequest bypass** — returns mock data if tour header present | **HIGH:** Remove tour mock from production code. Tour mock should only exist in dev/storybook, not in API route |
| Output | Package list | Response time leaks business logic? OK for now |

### 2.2 DELETE `/api/packages/[id]`
**Current auth:** Manual check | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | `id` from URL param | Zod: id(uuid) |
| Auth | Ownership check | OK — uses `user_id` match |
| Logic | Only allows BEKLIYOR status delete | OK — good business rule |
| Output | Success/error | OK |

### 2.3 GET/POST `/api/packages/[id]/messages`
**Current auth:** Manual | **Rate limit:** POST 5/5min per IP

| Layer | Finding | Fix |
|-------|---------|-----|
| Input (POST) | `message` text only | Zod: message(min 1, max 2000, sanitized) |
| Auth | Ownership + admin bypass | OK |
| Logic | Chat messages | Prevent HTML/script injection via sanitization |
| Output | Message list | OK |

### 2.4 POST `/api/consolidate`
**Current auth:** Manual | **Rate limit:** None | **Uses:** Both clients

| Layer | Finding | Fix |
|-------|---------|-----|
| Input | `package_ids` array | Zod: package_ids(array of uuid, min 2, max 10) |
| Auth | Manual check | `requireAuth()` |
| Logic | **isTourRequest bypass** + uses getAdminClient for invoice creation | **HIGH:** Remove tour mock, verify admin client usage is valid (needed to create invoices) |
| Output | Created invoice | OK |

### 2.5 GET/PATCH `/api/invoices`
**Current auth:** Manual | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input (PATCH) | `invoice_id`, `status` | Zod: status(enum PENDING/PAID/CANCELLED) |
| Auth | Ownership check | OK |
| Logic | Status transition validation | Add transition map: PENDING→PAID, PENDING→CANCELLED, no other transitions |
| Output | Invoice data | Strip internal fields |

### 2.6 GET/PATCH `/api/user`
**Current auth:** Manual | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input (PATCH) | name, address, preferred_language, password | Zod: name(2-100), address(string max 500), language(tr/en/de), password(8+, optional) |
| Auth | Manual check | `requireAuth()` |
| Logic | Password change uses Supabase auth API | OK, but add current password confirmation for password change |
| Output | User object | **CRITICAL:** Never return `supabase_user_id`, `permissions`, `is_admin` to client. Strip sensitive fields. |

### 2.7 POST `/api/notifications/subscribe` & `/api/notifications/unsubscribe`
**Current auth:** Manual | **Rate limit:** None

| Layer | Finding | Fix |
|-------|---------|-----|
| Input (subscribe) | endpoint, keys.p256dh, keys.auth | Zod schema for Web Push subscription object |
| Input (unsubscribe) | endpoint string | Zod: endpoint(url format) |
| Auth | Manual check | `requireAuth()` |
| Logic | Push subscription management | OK, scoped to user_id |
| Output | Status | OK |

---

## Phase 3 — Admin Routes (17 routes, service-role)

### 3.1 All Admin Routes — Common Issues

| Issue | Fix |
|-------|-----|
| All use `getAdminClient()` | Acceptable — admin needs service-role for cross-user operations |
| Permission checks vary | Standardize: every route must call `requireAdmin(permission)` |
| No audit logging | Add `auditLog(action, userId, target, details)` to all POST/PATCH/DELETE admin routes |
| Error messages leak DB info | Catch all errors, return generic messages, log details server-side |

### 3.2 High-Risk Admin Routes

**GET `/api/admin/users`** — Returns user list with `is_admin`, `permissions` fields
- Fix: Super-admin only (already done), add pagination max limit (100)

**PATCH `/api/admin/users/[id]`** — Can modify permissions, is_admin flag
- Fix: Zod schema for body, super-admin only, audit log must record who changed what

**POST `/api/admin/translations/seed`** — Bulk upsert from hardcoded data
- Fix: Add confirmation flag, idempotency check, audit log

**GET `/api/admin/stats`** — Aggregate queries
- Fix: Add rate limit (60/min), validate query has no injection

### 3.3 Admin Route Count

| Sub-path | Routes | Methods | Risk |
|----------|--------|---------|------|
| `/customers` | 2 | GET | Medium |
| `/intake` | 1 | POST | High |
| `/invoices` | 2 | GET, POST, PATCH | High |
| `/languages` | 1 | GET, POST, PATCH, DELETE | Medium |
| `/packages` | 2 | GET, PATCH, DELETE | High |
| `/pickup` | 2 | POST | High |
| `/policies` | 1 | GET, POST | Low |
| `/settings` | 1 | GET, PATCH, POST | Critical |
| `/stats` | 1 | GET | Low |
| `/translations` | 2 | GET, POST, DELETE | Medium |
| `/users` | 2 | GET, PATCH | Critical |

---

## Phase 4 — Dependencies & CI/CD

### 4.1 Package Vulnerabilities
- **7 vulnerabilities** all from `@ducanh2912/next-pwa` → `serialize-javascript`
- Options:
  - **A**: Upgrade next-pwa to latest, hope fixes exist
  - **B**: Replace with `@serwist/next` (modern alternative, active maintenance)
  - **C**: Remove PWA plugin, implement service worker manually
- Recommendation: **B** — `@serwist/next` is the successor, maintained, no known CVEs

### 4.2 Outdated Packages
- 11 packages outdated, all minor/patch except eslint (major 9→10)
- Run `npm update` for safe bumps, handle eslint separately

### 4.3 CI/CD Security Pipeline
Add to `.github/workflows/` (or create if none):
- `npm audit` on every PR (fail on high/critical)
- Dependency review on PR
- Secret scanning (detect leaked keys)
- Lint security rules added to `.eslintrc`

### 4.4 Pre-Commit Hook
- `lint-staged` + husky: run lint + type-check before commit
- Prevent committing `.env` files, keys, tokens

---

## Risk Summary Matrix

| Risk Level | Count | Examples |
|-----------|-------|---------|
| Critical | 3 | `/api/settings` exposes all config via service-role, `/api/user` leaks admin fields, admin settings write |
| High | 5 | Tour guard bypass in 3 routes, consolidate service-role misuse, missing rate limits on auth routes |
| Medium | 12 | Missing zod validation on all routes, no CSP headers, error message leaking |
| Low | 7 | npm vulnerabilities (build-time only), outdated patches, missing audit logs |

---

## Implementation Order

1. **Phase 0** — Infrastructure (zod, rate-limit, headers, sanitize) — enables all other fixes
2. **Phase 1** — Public routes (highest attack surface)
3. **Phase 2** — Customer routes (data ownership critical)
4. **Phase 3** — Admin routes (privilege escalation risk)
5. **Phase 4** — Dependencies & CI/CD (prevent regression)
