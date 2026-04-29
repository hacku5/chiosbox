# Tour System v3 — Driver.js Rewrite

## Decision
Replace custom spotlight/overlay/popover with **Driver.js** library.
Tüm custom tour UI kodları silinir: `tour-overlay.tsx`, `tour-guide-bar.tsx`, `tour-mobile-sheet.tsx`.

## Architecture
```
TourStore (Zustand) — isRunning, completed, showOrderFlow
       ↓
TourDriver (NEW) — Driver.js instance lifecycle, step tanımları
       ↓
Driver.js motoru — spotlight, overlay, popover, progress, animasyon
       +
OrderFlowModal (KEEP) — 5 adımlı alışveriş SVG akışı
```

## Files

| Action | File |
|--------|------|
| **NEW** | `src/components/tour/tour-driver.tsx` |
| **KEEP** | `src/components/tour/order-flow-modal.tsx` |
| **MODIFY** | `src/stores/tour-store.ts` — basitleşir |
| **MODIFY** | `src/app/user/layout.tsx` — TourDriver import |
| **DELETE** | `src/components/tour/tour-overlay.tsx` |
| **DELETE** | `src/components/tour/tour-guide-bar.tsx` |
| **DELETE** | `src/components/tour/tour-mobile-sheet.tsx` |
| **INSTALL** | `npm install driver.js` |

## TourDriver Component

- `isRunning` true olunca Driver.js instance oluştur, `drive()` çağır
- `isRunning` false olunca `destroy()` çağır
- Route değişimini dinle, DOM elementleri render olduktan sonra `drive(currentStep)` ile devam et
- OrderFlow adımında: `onNextClick` → Driver.js destroy (geçici) → openOrderFlow()
- OrderFlow kapandıktan sonra: yeni Driver.js instance + drive(nextStep)
- Mobil: ekstra kod yok, Driver.js popover'ı otomatik reposition eder

## TOUR_STEPS (Driver.js formatında)
26 adım, her biri: `element` (data-tour selector), `popover` (title, description, side)
Order flow tetikleme: `onNextClick` callback ile

## Theming
Custom CSS: `.driver-popover` için Aegean font/renkler
Overlay: `rgba(26, 39, 68, 0.5)` (deep-sea-teal)
Stage: 8px padding, 12px radius
Highlight: chios-purple outline

## Tour Store (Basitleşmiş)
```typescript
interface TourState {
  isRunning: boolean;
  completed: boolean;
  showOrderFlow: boolean;
  orderFlowStep: number;
  
  startTour: () => void;
  stopTour: () => void;
  completeTour: () => void;
  openOrderFlow: () => void;
  closeOrderFlow: () => void;
  nextOrderFlowStep: () => void;
}
```

Mock veriler API rotalarında kalır (tour-guard ile), store'dan kalkar.

## Mobile
Driver.js built-in responsive: popover viewport sınırına gelince otomatik reposition.
CSS override: mobilde popover max-width, font-size ayarlanır.
Ekstra mobil komponent GEREKMEZ.
