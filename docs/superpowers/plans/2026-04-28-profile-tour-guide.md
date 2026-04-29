# Profile Address Editing + Tour Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make user profile address editable and add an interactive tour guide (react-joyride) to the user dashboard with page navigation and demo content.

**Architecture:** Address editing extends existing profile edit pattern. Tour guide uses react-joyride with a Zustand store for state persistence, `data-tour` attributes on target elements, and `router.push()` for cross-page navigation.

**Tech Stack:** React 19, Next.js 16 (App Router), Zustand, react-joyride, Framer Motion, Tailwind CSS 4

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/app/api/user/route.ts` | Accept `address` field in PATCH |
| Modify | `src/app/user/profile/page.tsx` | Add address editing + tour start button |
| Modify | `src/components/dashboard/sidebar.tsx` | Add `data-tour` attrs + help icon |
| Modify | `src/app/user/layout.tsx` | Mount TourGuide provider |
| Modify | `src/app/user/page.tsx` | Add `data-tour` attrs |
| Modify | `src/app/user/packages/page.tsx` | Add `data-tour` attrs |
| Modify | `src/app/user/actions/page.tsx` | Add `data-tour` attrs |
| Modify | `src/app/user/consolidate/page.tsx` | Add `data-tour` attrs |
| Modify | `src/app/user/checkout/page.tsx` | Add `data-tour` attrs |
| Modify | `src/lib/seed-translations.ts` | Add tour + address i18n keys (tr/en/de) |
| Create | `src/stores/tour-store.ts` | Zustand store for tour state |
| Create | `src/components/tour/tour-steps.ts` | Step definitions |
| Create | `src/components/tour/tour-guide.tsx` | react-joyride wrapper component |
| Modify | `package.json` | Add react-joyride dependency |

---

## Task 1: Install react-joyride

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependency**

```bash
cd C:/Users/MySir/OneDrive/Desktop/chico
npm install react-joyride
```

- [ ] **Step 2: Verify installation**

```bash
grep "react-joyride" package.json
```

Expected: `"react-joyride": "^2.x.x"` appears in dependencies.

---

## Task 2: API — Accept address field

**Files:**
- Modify: `src/app/api/user/route.ts`

- [ ] **Step 1: Add address to PATCH handler**

In `src/app/api/user/route.ts`, find the PATCH function. After the phone line (line 51), add address handling:

```typescript
// Current code at line 48-54:
  const updateData: Record<string, unknown> = {};
  const name = sanitizeRequired(body.name, 100);
  if (name) updateData.name = name;
  if (body.phone !== undefined) updateData.phone = sanitizeText(body.phone, 20) || null;
  if (body.preferred_language !== undefined && ["tr", "en", "de"].includes(body.preferred_language)) {
    updateData.preferred_language = body.preferred_language;
  }
```

Change to:

```typescript
  const updateData: Record<string, unknown> = {};
  const name = sanitizeRequired(body.name, 100);
  if (name) updateData.name = name;
  if (body.phone !== undefined) updateData.phone = sanitizeText(body.phone, 20) || null;
  if (body.address !== undefined) updateData.address = sanitizeText(body.address, 500) || null;
  if (body.preferred_language !== undefined && ["tr", "en", "de"].includes(body.preferred_language)) {
    updateData.preferred_language = body.preferred_language;
  }
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

---

## Task 3: Tour Store

**Files:**
- Create: `src/stores/tour-store.ts`

- [ ] **Step 1: Create tour store**

Create `src/stores/tour-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  isRunning: boolean;
  currentStep: number;
  completed: boolean;
  startTour: () => void;
  stopTour: () => void;
  setStep: (step: number) => void;
  completeTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      isRunning: false,
      currentStep: 0,
      completed: false,

      startTour: () => set({ isRunning: true, currentStep: 0 }),
      stopTour: () => set({ isRunning: false }),
      setStep: (step) => set({ currentStep: step }),
      completeTour: () => set({ isRunning: false, completed: true }),
      resetTour: () => set({ isRunning: false, currentStep: 0, completed: false }),
    }),
    {
      name: "chiosbox-tour",
      partialize: (state) => ({ completed: state.completed }),
    }
  )
);
```

- [ ] **Step 2: Verify no import errors**

```bash
grep -r "tour-store" src/ || echo "No imports yet - OK"
```

---

## Task 4: Tour Steps Definition

**Files:**
- Create: `src/components/tour/tour-steps.ts`

- [ ] **Step 1: Create tour steps file**

Create `src/components/tour/tour-steps.ts`:

```typescript
import type { Step } from "react-joyride";

export interface TourStepConfig {
  step: Step;
  route: string;
  demoContent?: string;
}

export function getTourSteps(t: (key: string) => string): TourStepConfig[] {
  return [
    {
      route: "/user",
      step: {
        target: '[data-tour="stats"]',
        content: t("tour.step1.content"),
        title: t("tour.step1.title"),
        placement: "bottom",
        disableBeacon: true,
      },
      demoContent: "2 paket depoda, 1 paket yolda. Bekleyen fatura: €15.50",
    },
    {
      route: "/user/packages",
      step: {
        target: '[data-tour="package-list"]',
        content: t("tour.step2.content"),
        title: t("tour.step2.title"),
        placement: "center",
        disableBeacon: true,
      },
      demoContent: "TR-2026-0042 | Kargomarket | Depoda | 2.5kg",
    },
    {
      route: "/user/actions",
      step: {
        target: '[data-tour="new-package"]',
        content: t("tour.step3.content"),
        title: t("tour.step3.title"),
        placement: "top",
        disableBeacon: true,
      },
      demoContent: "Kargo: Yurtici Kargo | Takip: YK1234567890 | Ağırlık: 1.5kg",
    },
    {
      route: "/user/consolidate",
      step: {
        target: '[data-tour="consolidate"]',
        content: t("tour.step4.content"),
        title: t("tour.step4.title"),
        placement: "center",
        disableBeacon: true,
      },
      demoContent: "3 paket birleştirildi. Tahmini tasarruf: €8.50",
    },
    {
      route: "/user/checkout",
      step: {
        target: '[data-tour="checkout"]',
        content: t("tour.step5.content"),
        title: t("tour.step5.title"),
        placement: "center",
        disableBeacon: true,
      },
      demoContent: "Fatura #INV-2026-019 | €22.00 | Durum: Bekliyor",
    },
    {
      route: "/user/profile",
      step: {
        target: '[data-tour="profile"]',
        content: t("tour.step6.content"),
        title: t("tour.step6.title"),
        placement: "bottom",
        disableBeacon: true,
      },
      demoContent: "Ad, telefon, adres düzenlenebilir. Bildirimler açılabilir.",
    },
  ];
}
```

---

## Task 5: Tour Guide Component

**Files:**
- Create: `src/components/tour/tour-guide.tsx`

- [ ] **Step 1: Create TourGuide component**

Create `src/components/tour/tour-guide.tsx`:

```typescript
"use client";

import { useEffect, useCallback, useMemo } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS, type CallBackProps } from "react-joyride";
import { useRouter, usePathname } from "next/navigation";
import { useTourStore } from "@/stores/tour-store";
import { getTourSteps } from "./tour-steps";
import { useTranslation } from "@/hooks/use-translation";

export function TourGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isRunning, currentStep, setStep, stopTour, completeTour } = useTourStore();

  const tourSteps = useMemo(() => getTourSteps(t), [t]);

  const stepsForCurrentPage = useMemo(() => {
    return tourSteps
      .map((config, index) => ({ ...config.step, originalIndex: index }))
      .filter((_, index) => tourSteps[index].route === pathname);
  }, [tourSteps, pathname]);

  const currentStepConfig = tourSteps[currentStep];

  useEffect(() => {
    if (!isRunning || !currentStepConfig) return;
    if (currentStepConfig.route !== pathname) {
      router.push(currentStepConfig.route);
    }
  }, [isRunning, currentStep, currentStepConfig, pathname, router]);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, index, status, type } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        completeTour();
        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        const nextStep = action === ACTIONS.NEXT ? currentStep + 1 : currentStep - 1;
        if (nextStep >= 0 && nextStep < tourSteps.length) {
          setStep(nextStep);
        } else {
          completeTour();
        }
      }
    },
    [currentStep, tourSteps.length, setStep, completeTour]
  );

  if (!isRunning) return null;

  const joyrideSteps = stepsForCurrentPage.map((s) => ({
    target: s.target,
    content: (
      <div>
        <p className="text-sm text-deep-sea-teal/70 mb-2">{s.content as string}</p>
        {tourSteps[s.originalIndex]?.demoContent && (
          <div className="mt-2 p-2 bg-chios-purple/5 rounded-lg text-xs font-mono text-chios-purple">
            {tourSteps[s.originalIndex].demoContent}
          </div>
        )}
      </div>
    ),
    title: s.title,
    placement: s.placement as "bottom" | "center" | "top",
    disableBeacon: s.disableBeacon,
  }));

  return (
    <Joyride
      steps={joyrideSteps}
      run={isRunning && joyrideSteps.length > 0}
      stepIndex={stepsForCurrentPage.findIndex(
        (s) => s.originalIndex === currentStep
      )}
      callback={handleJoyrideCallback}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      styles={{
        options: {
          primaryColor: "#5D3FD3",
          textColor: "#1A3A4A",
          backgroundColor: "#FFFFFF",
          arrowColor: "#FFFFFF",
          overlayColor: "rgba(26, 58, 74, 0.3)",
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 4px 24px rgba(93, 63, 211, 0.15)",
        },
        tooltipTitle: {
          fontFamily: "var(--font-rubik), sans-serif",
          fontWeight: "600",
          fontSize: "16px",
          marginBottom: "8px",
        },
        buttonNext: {
          backgroundColor: "#5D3FD3",
          borderRadius: "12px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "600",
        },
        buttonBack: {
          color: "#1A3A4A",
          marginRight: "8px",
          fontSize: "14px",
          fontWeight: "500",
        },
        buttonSkip: {
          color: "#1A3A4A80",
          fontSize: "13px",
        },
      }}
      locale={{
        back: t("tour.back"),
        close: t("tour.close"),
        last: t("tour.finish"),
        next: t("tour.next"),
        skip: t("tour.skip"),
      }}
    />
  );
}
```

---

## Task 6: Translation Keys

**Files:**
- Modify: `src/lib/seed-translations.ts`

- [ ] **Step 1: Add Turkish tour keys**

In `src/lib/seed-translations.ts`, inside the `tr` object, add after the existing `profile.*` keys:

```typescript
    // Tour Guide
    "tour.start": "Tur Rehberini Başlat",
    "tour.next": "İleri",
    "tour.back": "Geri",
    "tour.finish": "Bitir",
    "tour.skip": "Atla",
    "tour.close": "Kapat",
    "tour.helpTooltip": "Tur Rehberi",
    "tour.step1.title": "Dashboard",
    "tour.step1.content": "Tüm paketlerinizin durumunu, bekleyen faturalarınızı ve hızlı işlem seçeneklerini burada görebilirsiniz.",
    "tour.step2.title": "Paketlerim",
    "tour.step2.content": "Gelen tüm paketlerinizi burada listeleyebilir, durumlarını filtreleyebilir ve detaylarını görebilirsiniz.",
    "tour.step3.title": "Yeni Paket Bildir",
    "tour.step3.content": "Yeni bir paket geleceğini buradan bildirin. Kargo firmasını seçin ve takip numarasını girin.",
    "tour.step4.title": "Paket Birleştir",
    "tour.step4.content": "Birden fazla paketi tek bir kutuda birleştirerek kargo maliyetinden tasarruf edin.",
    "tour.step5.title": "Ödeme",
    "tour.step5.content": "Bekleyen faturalarınızı görüntüleyin ve QR kod ile ödeme yapın.",
    "tour.step6.title": "Profil & Ayarlar",
    "tour.step6.content": "Kişisel bilgilerinizi, adresinizi düzenleyin ve bildirim tercihlerinizi yönetin.",
    // Profile - Address
    "profile.addressLabel": "Adres",
    "profile.addressPlaceholder": "Adresinizi girin",
```

- [ ] **Step 2: Add English tour keys**

Inside the `en` object:

```typescript
    // Tour Guide
    "tour.start": "Start Tour Guide",
    "tour.next": "Next",
    "tour.back": "Back",
    "tour.finish": "Finish",
    "tour.skip": "Skip",
    "tour.close": "Close",
    "tour.helpTooltip": "Tour Guide",
    "tour.step1.title": "Dashboard",
    "tour.step1.content": "View all your package statuses, pending invoices, and quick action options here.",
    "tour.step2.title": "My Packages",
    "tour.step2.content": "List all your incoming packages here, filter by status, and view details.",
    "tour.step3.title": "Report New Package",
    "tour.step3.content": "Notify us about an incoming package. Select the carrier and enter the tracking number.",
    "tour.step4.title": "Consolidate Packages",
    "tour.step4.content": "Combine multiple packages into one box to save on shipping costs.",
    "tour.step5.title": "Payment",
    "tour.step5.content": "View your pending invoices and pay with QR code.",
    "tour.step6.title": "Profile & Settings",
    "tour.step6.content": "Edit your personal info, address, and manage notification preferences.",
    // Profile - Address
    "profile.addressLabel": "Address",
    "profile.addressPlaceholder": "Enter your address",
```

- [ ] **Step 3: Add German tour keys**

Inside the `de` object:

```typescript
    // Tour Guide
    "tour.start": "Tour starten",
    "tour.next": "Weiter",
    "tour.back": "Zurück",
    "tour.finish": "Fertig",
    "tour.skip": "Überspringen",
    "tour.close": "Schließen",
    "tour.helpTooltip": "Tourenführer",
    "tour.step1.title": "Dashboard",
    "tour.step1.content": "Hier sehen Sie den Status aller Pakete, ausstehende Rechnungen und Schnellaktionen.",
    "tour.step2.title": "Meine Pakete",
    "tour.step2.content": "Alle eingehenden Pakete auflisten, nach Status filtern und Details anzeigen.",
    "tour.step3.title": "Neues Paket melden",
    "tour.step3.content": "Melden Sie ein neues Paket. Wählen Sie den Versanddienst und geben Sie die Sendungsnummer ein.",
    "tour.step4.title": "Pakete bündeln",
    "tour.step4.content": "Kombinieren Sie mehrere Pakete in einer Box und sparen Sie Versandkosten.",
    "tour.step5.title": "Zahlung",
    "tour.step5.content": "Ausstehende Rechnungen anzeigen und per QR-Code bezahlen.",
    "tour.step6.title": "Profil & Einstellungen",
    "tour.step6.content": "Bearbeiten Sie Ihre persönlichen Daten, Adresse und Benachrichtigungseinstellungen.",
    // Profile - Address
    "profile.addressLabel": "Adresse",
    "profile.addressPlaceholder": "Adresse eingeben",
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```

---

## Task 7: Profile Page — Address Editing + Tour Button

**Files:**
- Modify: `src/app/user/profile/page.tsx`

- [ ] **Step 1: Add address state and update edit functions**

In `src/app/user/profile/page.tsx`, add `editAddress` state after `editPhone` (around line 29):

```typescript
  const [editAddress, setEditAddress] = useState("");
```

Update `startEditing` function (around line 55) to include address:

```typescript
  const startEditing = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditAddress(user?.address || "");
    setSaveError("");
    setEditing(true);
  };
```

- [ ] **Step 2: Update handleSave to include address**

Update the `handleSave` function (around line 76) to send address:

```typescript
  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError(t("profile.nameRequired"));
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
        }),
      });
```

(Rest of handleSave unchanged)

- [ ] **Step 3: Add address field to edit form**

Find the address card section (around line 292-321). Replace the read-only address card with an editable version:

```tsx
          {/* Address card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5" data-tour="profile-address">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-4">
              {t("profile.addressTitle")}
            </h3>
            {editing ? (
              <textarea
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder={t("profile.addressPlaceholder")}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-chios-purple/30 bg-white text-sm text-deep-sea-teal placeholder:text-deep-sea-teal/20 focus:outline-none focus:border-chios-purple transition-colors resize-none font-mono"
              />
            ) : (
              <div className="p-4 bg-deep-sea-teal/[0.03] rounded-xl font-mono text-sm text-deep-sea-teal/80 whitespace-pre-line leading-relaxed">
                {user?.address || "—"}
              </div>
            )}
            {!editing && (
              <button
                onClick={copyAddress}
                className="mt-4 w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors duration-200 cursor-pointer"
              >
                {copied ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t("profile.addressCopied")}
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {t("profile.copyAddress")}
                  </>
                )}
              </button>
            )}
          </div>
```

- [ ] **Step 4: Add tour start button**

Import the tour store at the top of the file (after the existing imports):

```typescript
import { useTourStore } from "@/stores/tour-store";
```

Inside the component, add the store hook (after `const { t } = useTranslation();`):

```typescript
  const startTour = useTourStore((s) => s.startTour);
```

Add a tour start button after the subscription card (before the notifications card). Find the closing `</div>` of the subscription section and add:

```tsx
          {/* Tour Guide */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
            <h3 className="font-display text-lg font-semibold text-deep-sea-teal mb-2">
              {t("tour.helpTooltip")}
            </h3>
            <p className="text-sm text-deep-sea-teal/50 mb-4">
              {t("profile.description")}
            </p>
            <button
              onClick={startTour}
              className="w-full py-3 inline-flex items-center justify-center gap-2 bg-chios-purple text-white font-semibold rounded-xl hover:bg-chios-purple-dark transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {t("tour.start")}
            </button>
          </div>
```

- [ ] **Step 5: Verify build**

```bash
npm run build 2>&1 | tail -5
```

---

## Task 8: Add data-tour Attributes to Dashboard Pages

**Files:**
- Modify: `src/app/user/page.tsx`
- Modify: `src/app/user/packages/page.tsx`
- Modify: `src/app/user/actions/page.tsx`
- Modify: `src/app/user/consolidate/page.tsx`
- Modify: `src/app/user/checkout/page.tsx`

- [ ] **Step 1: Dashboard home page — add data-tour to stats section**

In `src/app/user/page.tsx`, find the stats cards container (the div with package counts, invoice info). Add `data-tour="stats"` attribute:

Find the outer wrapper div of the stats/content area (after the loading check, the main motion.div). Add the attribute:

```tsx
// Find the main content wrapper and add data-tour="stats"
// Look for something like: <motion.div variants={container}...>
// Add data-tour="stats" to the stats section wrapper
```

The exact element depends on the page structure. Target the container that holds the stat cards (packages in transit, packages in warehouse, pending invoices).

- [ ] **Step 2: Packages page — add data-tour**

In `src/app/user/packages/page.tsx`, find the package list container and add `data-tour="package-list"`:

```tsx
// Find the main packages list/grid container
// Add data-tour="package-list" to it
```

- [ ] **Step 3: Actions page — add data-tour**

In `src/app/user/actions/page.tsx`, find the new package form and add `data-tour="new-package"`:

```tsx
// Find the form container for reporting a new package
// Add data-tour="new-package" to it
```

- [ ] **Step 4: Consolidate page — add data-tour**

In `src/app/user/consolidate/page.tsx`, find the consolidation area and add `data-tour="consolidate"`:

```tsx
// Find the main consolidation container
// Add data-tour="consolidate" to it
```

- [ ] **Step 5: Checkout page — add data-tour**

In `src/app/user/checkout/page.tsx`, find the invoices/payment area and add `data-tour="checkout"`:

```tsx
// Find the main checkout/invoice container
// Add data-tour="checkout" to it
```

- [ ] **Step 6: Add data-tour to profile section**

In `src/app/user/profile/page.tsx`, add `data-tour="profile"` to the user info card (the first white card with name/email/phone):

```tsx
// Find: <div className="bg-white rounded-2xl p-6 shadow-sm border border-deep-sea-teal/5">
// Add data-tour="profile" to it
```

- [ ] **Step 7: Verify build**

```bash
npm run build 2>&1 | tail -5
```

---

## Task 9: Sidebar — Tour Help Icon

**Files:**
- Modify: `src/components/dashboard/sidebar.tsx`

- [ ] **Step 1: Import tour store**

Add import at the top of `src/components/dashboard/sidebar.tsx`:

```typescript
import { useTourStore } from "@/stores/tour-store";
```

- [ ] **Step 2: Add help icon to desktop sidebar**

Inside the desktop sidebar, after the `LanguageSwitcher` and before the closing `</div>` of the user info section (around line 189), add a help/tour button:

```tsx
            <button
              onClick={() => useTourStore.getState().startTour()}
              className="mt-2 w-full flex items-center gap-2 px-4 py-2.5 text-sm text-deep-sea-teal/50 hover:text-chios-purple hover:bg-chios-purple/5 rounded-xl transition-all duration-200 cursor-pointer"
              title={t("tour.helpTooltip")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {t("tour.helpTooltip")}
            </button>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

---

## Task 10: Mount TourGuide in Layout

**Files:**
- Modify: `src/app/user/layout.tsx`

- [ ] **Step 1: Add TourGuide to user layout**

In `src/app/user/layout.tsx`, import and mount the TourGuide component. Since the layout is a server component, we need to create a thin client wrapper or use dynamic import.

Add the TourGuide inside the layout's return JSX, after `{children}`:

```tsx
import { TourGuide } from "@/components/tour/tour-guide";
```

Add `<TourGuide />` right after `{children}` inside `<main>`:

```tsx
  return (
    <div className="min-h-screen bg-mastic-white">
      <Sidebar />
      <main className="lg:ml-64 pb-20 lg:pb-0">
        {children}
        <TourGuide />
      </main>
    </div>
  );
```

**Note:** Since `TourGuide` is a client component (`"use client"`) and the layout is a server component, Next.js handles this correctly — client components can be rendered inside server components.

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build completes successfully.

- [ ] **Step 2: Run dev server and test manually**

```bash
npm run dev
```

Test checklist:
- [ ] Profile page: edit mode shows address textarea
- [ ] Profile page: saving with new address works
- [ ] Profile page: "Tur Rehberini Başlat" button visible
- [ ] Sidebar: "?" help icon visible
- [ ] Clicking tour button starts the tour on dashboard
- [ ] Tour navigates between pages
- [ ] Tour shows demo content in tooltips
- [ ] Tour can be skipped/finished
- [ ] Language switching works (tr/en/de)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add editable address in profile + interactive tour guide

- Profile: address field now editable via textarea in edit mode
- API: PATCH /api/user accepts address field (max 500 chars)
- Tour: react-joyride based 6-step tour with page navigation
- Tour: demo content shown in each step tooltip
- Tour: manual start from profile page and sidebar help icon
- Tour: Zustand store with localStorage persistence
- i18n: tour + address keys for tr/en/de"
```
