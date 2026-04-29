# Profile Settings + Tour Guide Design

**Date**: 2026-04-28
**Scope**: User dashboard profile page enhancements + onboarding tour

---

## 1. Profile — Address Editing

### Current State
- Editable: `name`, `phone`
- Read-only: `email`, `chios_box_id`, `address`, `plan`

### Target State
- Editable: `name`, `phone`, `address`
- Read-only: `email`, `chios_box_id`, `plan`

### Changes
- **Profile page** (`src/app/user/profile/page.tsx`): Add `editAddress` state, show textarea in edit mode
- **API route** (`src/app/api/user/route.ts`): Accept `address` field in PATCH, sanitize with max 500 chars
- **Auth store** (`src/stores/auth-store.ts`): Add `address` to User interface (already present)
- **Translations**: Add `profile.addressLabel`, `profile.addressPlaceholder` keys for tr/en/de

---

## 2. Tour Guide (react-joyride)

### Library
- `react-joyride` — React-native tour library with tooltip, overlay, step navigation

### Architecture
- `src/components/tour/tour-guide.tsx` — Main wrapper component using react-joyride
- `src/components/tour/tour-steps.ts` — Step definitions with i18n keys and demo content
- `src/stores/tour-store.ts` — Zustand store with localStorage persistence for tour state

### Tour Steps (6 steps, navigates between pages)

| Step | Route | Target Selector | Title Key | Demo Content |
|------|-------|-----------------|-----------|--------------|
| 1 | `/user` | `[data-tour="stats"]` | `tour.step1.title` | Package counts, invoice summary |
| 2 | `/user/packages` | `[data-tour="package-list"]` | `tour.step2.title` | Example tracking number, status |
| 3 | `/user/actions` | `[data-tour="new-package"]` | `tour.step3.title` | Demo carrier, weight preset |
| 4 | `/user/consolidate` | `[data-tour="consolidate"]` | `tour.step4.title` | Demo savings calculation |
| 5 | `/user/checkout` | `[data-tour="checkout"]` | `tour.step5.title` | Demo invoice amount, QR |
| 6 | `/user/profile` | `[data-tour="profile"]` | `tour.step6.title` | Edit fields demo |

### Trigger Points
- **Profile page**: "Tur Rehberini Başlat" button
- **Sidebar**: Small "?" help icon (desktop + mobile)

### Navigation Behavior
- Tour uses `router.push()` to navigate between pages
- Each page checks tour active state and highlights target element
- Tour persists current step in store so page transitions resume correctly

### i18n
- All tour text uses `useTranslation()` hook
- Keys: `tour.step1.title` through `tour.step6.title`, `tour.step1.content` through `tour.step6.content`
- Plus: `tour.start`, `tour.next`, `tour.back`, `tour.finish`, `tour.skip`

---

## 3. Files to Create/Modify

### New Files
- `src/components/tour/tour-guide.tsx`
- `src/components/tour/tour-steps.ts`
- `src/stores/tour-store.ts`

### Modified Files
- `src/app/user/profile/page.tsx` — address editing + tour start button
- `src/app/api/user/route.ts` — accept address field
- `src/components/dashboard/sidebar.tsx` — tour help icon
- `src/app/user/layout.tsx` — TourGuide provider
- `src/lib/seed-translations.ts` — tour + address translation keys
- `package.json` — add react-joyride dependency
