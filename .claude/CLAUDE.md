# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChiosBox — PWA platform for Turkey-to-EU e-commerce package consolidation, based on Chios island. Turkish-first with English and German support.

## Commands

```bash
npm run dev        # Start dev server (Next.js)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript 6)
- **Supabase** — Auth + PostgreSQL (direct client, no Prisma/ORM)
- **Tailwind CSS 4** + Radix UI (headless components)
- **Zustand** — 3 stores: `auth-store`, `package-store`, `admin-store` (in `src/stores/`)
- **React Query** — server state / data fetching
- **Framer Motion** + **Lottie-React** — animations
- **PWA** via `@ducanh2912/next-pwa`
- **web-push** — push notifications (VAPID keys in env)

## Architecture

### Three App Areas

1. **Landing** (`/`) — public marketing page with pricing calculator
2. **Customer Dashboard** (`/dashboard/*`) — authenticated customer area (packages, checkout, consolidate, invoices, profile, actions)
3. **Admin Panel** (`/admin/*`) — admin-only area (packages, customers, intake, pickup, invoices, demurrage, users, translations, languages)

### Authentication (Layout-Level, No Middleware)

Auth is enforced in **layout files**, not middleware:
- `src/app/dashboard/layout.tsx` — checks `supabase.auth.getUser()`, redirects non-auth to `/login`, redirects admins to `/admin`
- `src/app/admin/layout.tsx` — checks auth + `is_admin` flag, redirects non-admins to `/dashboard`
- `/admin/login` is exempt from auth check via `x-pathname` header

Supabase has **4 client variants** in `src/lib/`:
- `supabase.ts` — base/shared config
- `supabase-browser.ts` — client-side (uses `@supabase/ssr`)
- `supabase-server.ts` — server components/layouts (uses `cookies()`)
- `supabase-admin.ts` — service role key for privileged API routes

### API Routes (`src/app/api/`)

Two groups:
- **Customer APIs** (`/api/packages/*`, `/api/invoices`, `/api/consolidate`, `/api/user`, `/api/notifications/*`, `/api/auth/*`, `/api/translations`)
- **Admin APIs** (`/api/admin/*`) — guarded by `src/lib/admin-guard.ts`

### i18n System

Cookie-based language switching (`lang` cookie, default `tr`). Supported: `tr`, `en`, `de`. Translations stored in Supabase `translations` table, seeded from `seed-{tr,en,de}.sql` files. Translation helper in `src/lib/i18n.tsx`. Admin can manage via `/admin/translations`.

### Key Lib Files (`src/lib/`)

| File | Purpose |
|------|---------|
| `admin-guard.ts` | Admin auth check for API routes |
| `permissions.ts` | Granular permission system |
| `fees.ts` | Fee/demurrage calculations |
| `rate-limit.ts` | API rate limiting |
| `sanitize.ts` | Input sanitization |
| `send-notification.ts` | Web push notification sender |
| `i18n.tsx` | Translation hook/provider |
| `utils.ts` | General utilities (cn helper, etc.) |

### Database

PostgreSQL on Supabase. No ORM — direct Supabase client queries. Key tables (from code): `users`, `packages`, `invoices`, `translations`, `push_subscriptions`. Users table has `supabase_user_id`, `is_admin`, and `permissions` columns. Seed SQL files at root for multilingual translation data.

### Design System

"Aegean Light" theme. Fonts: **Rubik** (headings, `--font-rubik`) + **Nunito Sans** (body, `--font-nunito`). Color scheme uses mastic-white background, purple primary (`#5D3FD3`). Components use `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge pattern).

## Windows-Specific Notes

This project runs on Windows. Use forward slashes in paths. `taskkill //F //IM node.exe` to kill hung Node processes.
