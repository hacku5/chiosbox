# Mobile Tour Design — Bottom Sheet Approach

## Decision
Desktop: spotlight overlay + bottom guide bar (mevcut)
Mobile (<640px): bottom sheet, spotlight YOK, sadece highlight ring

## Mobile Bottom Sheet
- Sayfanın altından yukarı kayar
- 20px border-radius üstte, handle çizgisi
- Progress dots + adım sayacı (örn: 3/26)
- İkon (adım tipine göre), başlık (13px bold), açıklama (11px)
- Geri / İleri butonları
- "Atla" linki üstte
- Swipe-down veya X ile kapatma
- Hedef elementte: sadece 2px outline + numaralı badge, karanlık overlay YOK
- scrollIntoView ile hedefi ortala

## Desktop (Değişiklik yok)
- Mevcut tour-overlay.tsx + tour-guide-bar.tsx aynen kalacak

## Files
- **NEW:** `src/components/tour/tour-mobile-sheet.tsx` — mobil bottom sheet
- **MODIFY:** `src/components/tour/tour-guide-bar.tsx` — ekran boyutuna göre mobil/desktop seç
- **No change:** `tour-overlay.tsx`, `tour-store.ts`, `order-flow-modal.tsx`

## Mobile Sheet States
1. Highlight mode: hedef elemente ince ring, bottom sheet açık
2. Info-only mode: hedef yoksa sadece bottom sheet (sayfa tanıtımı adımları)
3. Order flow modal: mobilde de aynı modal (zaten responsive)
