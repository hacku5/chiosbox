# Tour Redesign Spec — Complete Guided Tour (v2)

## Problem
1. Translation keys show raw text (`tour.step.dashboard.title`) instead of actual translated content
2. Tour steps are incomplete — many fields/pages not covered
3. No spotlight highlighting on many steps
4. Consolidate page selection flow not demonstrated
5. Profile page fields not explained
6. Order flow modal timing wrong (should come after dashboard, not before actions)

## Translation Fix

**Root cause:** `seed-translations.ts` has all tour keys but they were never seeded to Supabase `translations` table. The `t()` function returns raw key when DB lookup fails.

**Fix:**
1. Call `POST /api/admin/translations/seed` (admin auth required) to upsert all keys from `seed-translations.ts` into the `translations` table
2. Clear localStorage cache entries `i18n_tr`, `i18n_en`, `i18n_de` (or wait 5 min TTL)
3. Alternatively: add a fallback in `i18n.tsx` that reads from `seed-translations.ts` when DB key is missing

## Tour Flow Overview

```
Dashboard (4 steps: welcome → stats → packages list → quick actions)
    ↓
Order Flow Modal ("önce sipariş vermelisiniz" — 5 SVG steps)
    ↓
Actions (5 steps: intro → tracking → carrier → form fields → submit)
    ↓  → 3. demo paket eklenir
Packages (3 steps: list (3 paket) → card click → detail + support chat)
    ↓
Consolidate (3 steps: sol panel → sağ panel/master box → fiyat değişimi)
    ↓
Checkout (2 steps: fatura inceleme → ödeme onayı)
    ↓
Profile (5 steps: kişisel bilgi → şifre → ChiosBox adres → abonelik → bildirimler)
```

**Total: 22 steps + order flow modal**

---

## Complete Tour Steps

### Dashboard — `/user` (4 steps, yukarıdan aşağıya)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 0 | `dashboard-welcome` | `tour.step.dashboardWelcome.title` | Hoşgeldiniz kartı: isim, plan badge, ChiosBox ID, "Adresimi Kopyala" butonu. Bu adresi Türk mağazalarında kullanın. |
| 1 | `stats` | `tour.step.dashboardStats.title` | İstatistik kartları: aktif paket sayısı, depodaki paketler, yoldaki paketler, kalan ücretsiz gün, bekleyen fatura. Her kart ne anlama geliyor. |
| 2 | `dashboard-packages` | `tour.step.dashboardPackages.title` | Aktif paketler listesi: son eklenen paketler durum etiketleriyle (bekleniyor, yolda, depoda). "Tümünü Gör" linki. Henüz paket yok mesajı. |
| 3 | `quick-actions` | `tour.step.dashboardActions.title` | Hızlı işlemler: "Adresimi Kopyala" (alışverişte kullan), "Şimdi Öde" (bekleyen faturaları öde). |

### Order Flow Modal (step 3'ten sonra, actions'tan önce)

Kullanıcıya "paket takibi için önce sipariş vermelisiniz" denir. 5 SVG adım:
1. Web sitesine gir (Trendyol, Hepsiburada vs.)
2. Ürünü seç, sepete ekle, satın al (ChiosBox adresini kullan)
3. Satıcı kargoya verdi
4. Kargo firması ve takip numarası belli oldu
5. Şimdi paket bildirebilirsiniz!

### Actions — `/user/actions` (5 steps, form adım adım doldurulur)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 4 | — | `tour.step.actions.title` | Sayfa tanıtımı: Online alışveriş sonrası satıcı takip numarası üretir. Buraya girin. |
| 5 | `tracking-input` | `tour.step.tracking.title` | Takip numarası alanı: Örnek TR-2026-0044. Otomatik kargo algılama. |
| 6 | `carrier-select` | `tour.step.carrier.title` | Kargo firması seçimi: Chip butonları (DHL, UPS, FedEx vs.) veya "Diğer" ile manuel giriş. |
| 7 | `package-form` | `tour.step.packageForm.title` | Paket bilgileri: İçerik açıklaması (tanımlama için), ağırlık (ücret etkisi), boyutlar (kutu seçimi), notlar. |
| 8 | `submit-btn` | `tour.step.submit.title` | Gönder butonu: Demo form doldurulur, 3. paket eklenir. "Paket Bildirildi!" sonrası. |

### Packages — `/user/packages` (3 steps)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 9 | `package-list` | `tour.step.packages.title` | Paket listesi: Artık 3 paket görünür (2 demo + form ile eklenen 3.). Arama, filtre sekmeleri (Tümü, Depoda, Yolda, Ödeme Bekliyor, Birleştirilmiş, Teslim). |
| 10 | `package-card` | `tour.step.packageCard.title` | Paket kartı: Durum etiketi, kargo firması, takip no, içerik özeti. Tıkla → detay. |
| 11 | `package-detail` | `tour.step.packageDetail.title` | Detay modal: Varış tarihi, kalan ücretsiz gün, raf konumu, depo fotoğrafı, master box bilgisi, **destek chat** (kullanıcı etkileşimi), silme butonu, durum takipçi (Bildirildi → Depoda → Birleştirildi → Teslim). Ödeme öncesi kontrol. |

### Consolidate — `/user/consolidate` (3 steps)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 12 | `consolidate-left` | `tour.step.consolidateLeft.title` | Sol panel: Depodaki paketler. Konsolidasyona uygun paketler listelenir. Seçmek için tıkla. |
| 13 | `consolidate-right` | `tour.step.consolidateRight.title` | Sağ panel: Master box. Seçilen paketler buraya transfer olur. Paket birleştirildiğinde fiyat değişimi gösterilir (konsolidasyon ücreti, kargo tasarrufu). |
| 14 | `consolidate-confirm` | `tour.step.consolidateConfirm.title` | Onay butonu: Birleştirme talebini gönder. Bu adım opsiyoneldir — tek tek de gönderebilirsiniz. |

### Checkout — `/user/checkout` (2 steps)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 15 | `checkout` | `tour.step.checkout.title` | Fatura inceleme: Kalem kalem ücretler (kabul, konsolidasyon, depo fazlası), paket bazlı döküm, toplam. Ödeme öncesi kontrol. |
| 16 | `checkout-pay` | `tour.step.checkoutPay.title` | Ödeme onayı: Ödeme butonu. Sonrası QR kod oluşur, teslim noktasında gösterin. |

### Profile — `/user/profile` (5 steps)

| Step | Highlight | Title Key | Content |
|------|-----------|-----------|---------|
| 17 | `profile-info` | `tour.step.profileInfo.title` | Kişisel bilgiler: Ad, email, telefon, ChiosBox ID. Düzenle butonu ile güncelleme. |
| 18 | `profile-password` | `tour.step.profilePassword.title` | Şifre değiştirme: Güvenlik için şifrenizi güncelleyebilirsiniz. (NOT: Bu alan henüz mevcut değil, profile eklenmeli) |
| 19 | `profile-address` | `tour.step.profileAddress.title` | ChiosBox teslimat adresi: Bu adresi Türk online mağazalarında kullanın. "Adresi Kopyala" butonu. Sakız Adası'ndaki depo adresiniz. |
| 20 | `profile-subscription` | `tour.step.profileSubscription.title` | Üyelik bilgisi: Plan adı (Basic Plan), durum (Aktif). Abonelik detayları. |
| 21 | `profile-extras` | `tour.step.profileExtras.title` | Bildirimler: Push bildirim açma/kapama. Tur yeniden başlat butonu. Çıkış butonu. |

---

## data-tour Attributes to Add/Update

| Page | Element | `data-tour` Value | Status |
|------|---------|-------------------|--------|
| **Dashboard** | Welcome card (ChiosBox ID + copy) | `dashboard-welcome` | **ADD** |
| **Dashboard** | Stats grid wrapper | `stats` | EXISTS |
| **Dashboard** | Active packages list | `dashboard-packages` | **ADD** |
| **Dashboard** | Quick actions (copy + pay) | `quick-actions` | **ADD** |
| **Actions** | Tracking input | `tracking-input` | EXISTS |
| **Actions** | Carrier select | `carrier-select` | EXISTS |
| **Actions** | Content + weight + dims + notes | `package-form` | **ADD** |
| **Actions** | Submit button | `submit-btn` | EXISTS |
| **Packages** | List wrapper | `package-list` | EXISTS |
| **Packages** | Individual card (new card) | `package-card` | **ADD** |
| **Packages** | Detail modal inner | `package-detail` | EXISTS |
| **Consolidate** | Left panel | `consolidate-left` | **ADD** |
| **Consolidate** | Right panel (master box) | `consolidate-right` | **ADD** |
| **Consolidate** | Confirm button | `consolidate-confirm` | **ADD** |
| **Checkout** | Invoice review | `checkout` | EXISTS |
| **Checkout** | Pay button | `checkout-pay` | **ADD** |
| **Profile** | Personal info card | `profile-info` | **ADD** |
| **Profile** | Password section | `profile-password` | **ADD** (requires UI addition) |
| **Profile** | Address card | `profile-address` | **ADD** |
| **Profile** | Subscription card | `profile-subscription` | **ADD** |
| **Profile** | Notifications + tour restart | `profile-extras` | **ADD** |

---

## Tour Store Changes

### TOUR_STEPS array (22 steps)

```typescript
export const TOUR_STEPS: TourStep[] = [
  // Dashboard (0-3)
  { route: "/user", titleKey: "tour.step.dashboardWelcome.title", contentKey: "tour.step.dashboardWelcome.content", highlight: "dashboard-welcome" },
  { route: "/user", titleKey: "tour.step.dashboardStats.title", contentKey: "tour.step.dashboardStats.content", highlight: "stats" },
  { route: "/user", titleKey: "tour.step.dashboardPackages.title", contentKey: "tour.step.dashboardPackages.content", highlight: "dashboard-packages" },
  { route: "/user", titleKey: "tour.step.dashboardActions.title", contentKey: "tour.step.dashboardActions.content", highlight: "quick-actions" },

  // Actions (4-8)
  { route: "/user/actions", titleKey: "tour.step.actions.title", contentKey: "tour.step.actions.content" },
  { route: "/user/actions", titleKey: "tour.step.tracking.title", contentKey: "tour.step.tracking.content", highlight: "tracking-input" },
  { route: "/user/actions", titleKey: "tour.step.carrier.title", contentKey: "tour.step.carrier.content", highlight: "carrier-select" },
  { route: "/user/actions", titleKey: "tour.step.packageForm.title", contentKey: "tour.step.packageForm.content", highlight: "package-form" },
  { route: "/user/actions", titleKey: "tour.step.submit.title", contentKey: "tour.step.submit.content", highlight: "submit-btn" },

  // Packages (9-11)
  { route: "/user/packages", titleKey: "tour.step.packages.title", contentKey: "tour.step.packages.content", highlight: "package-list" },
  { route: "/user/packages", titleKey: "tour.step.packageCard.title", contentKey: "tour.step.packageCard.content", highlight: "package-card" },
  { route: "/user/packages", titleKey: "tour.step.packageDetail.title", contentKey: "tour.step.packageDetail.content", highlight: "package-detail" },

  // Consolidate (12-14)
  { route: "/user/consolidate", titleKey: "tour.step.consolidateLeft.title", contentKey: "tour.step.consolidateLeft.content", highlight: "consolidate-left" },
  { route: "/user/consolidate", titleKey: "tour.step.consolidateRight.title", contentKey: "tour.step.consolidateRight.content", highlight: "consolidate-right" },
  { route: "/user/consolidate", titleKey: "tour.step.consolidateConfirm.title", contentKey: "tour.step.consolidateConfirm.content", highlight: "consolidate-confirm" },

  // Checkout (15-16)
  { route: "/user/checkout", titleKey: "tour.step.checkout.title", contentKey: "tour.step.checkout.content", highlight: "checkout" },
  { route: "/user/checkout", titleKey: "tour.step.checkoutPay.title", contentKey: "tour.step.checkoutPay.content", highlight: "checkout-pay" },

  // Profile (17-21)
  { route: "/user/profile", titleKey: "tour.step.profileInfo.title", contentKey: "tour.step.profileInfo.content", highlight: "profile-info" },
  { route: "/user/profile", titleKey: "tour.step.profilePassword.title", contentKey: "tour.step.profilePassword.content", highlight: "profile-password" },
  { route: "/user/profile", titleKey: "tour.step.profileAddress.title", contentKey: "tour.step.profileAddress.content", highlight: "profile-address" },
  { route: "/user/profile", titleKey: "tour.step.profileSubscription.title", contentKey: "tour.step.profileSubscription.content", highlight: "profile-subscription" },
  { route: "/user/profile", titleKey: "tour.step.profileExtras.title", contentKey: "tour.step.profileExtras.content", highlight: "profile-extras" },
];
```

### Order flow trigger

`ORDER_FLOW_BEFORE = 4` — triggers after step 3 (dashboard quick actions), before step 4 (actions page).

### Mock data changes

- Initial mock packages: 2 (existing)
- After step 8 (submit): 3rd demo package added to `mockPackages`
- When tour navigates to packages page, user sees 3 packages

---

## Profile Page: Password Section

Profile page currently has NO password change section. Need to add:
- New card with `data-tour="profile-password"`
- Current password + new password + confirm fields
- Save button
- Calls `supabase.auth.updateUser({ password })` via API

---

## Translation Keys (tr/en/de)

### New Keys

| Key | TR | EN | DE |
|-----|----|----|-----|
| `tour.step.dashboardWelcome.title` | "Hoşgeldiniz" | "Welcome" | "Willkommen" |
| `tour.step.dashboardWelcome.content` | "ChiosBox'a hoşgeldiniz! Bu sizin kontrol paneliniz. Üstte ChiosBox ID'niz ve teslimat adresiniz görünür. 'Adresimi Kopyala' butonu ile adresinizi kopyalayın ve Türk online mağazalarında alışveriş yaparken kullanın." | "Welcome to ChiosBox! This is your dashboard. Your ChiosBox ID and delivery address appear at the top. Use the 'Copy My Address' button to copy your address for use in Turkish online stores." | "Willkommen bei ChiosBox! Dies ist Ihr Dashboard. Oben sehen Sie Ihre ChiosBox-ID und Lieferadresse. Verwenden Sie 'Adresse kopieren', um Ihre Adresse für türkische Online-Shops zu kopieren." |
| `tour.step.dashboardStats.title` | "İstatistik Kartları" | "Statistics Cards" | "Statistik-Karten" |
| `tour.step.dashboardStats.content` | "Aktif paket sayınızı, depodaki ve yoldaki paketlerinizi, kalan ücretsiz saklama sürenizi ve bekleyen fatura sayınızı burada görebilirsiniz. Her kart sizi bilgilendirir." | "See your active package count, warehouse and in-transit packages, remaining free storage days, and pending invoice count. Each card keeps you informed." | "Sehen Sie Ihre aktive Paketanzahl, Lager- und Transportpakete, verbleibende kostenlose Lagertage und ausstehende Rechnungen. Jede Karte informiert Sie." |
| `tour.step.dashboardPackages.title` | "Aktif Paketler" | "Active Packages" | "Aktive Pakete" |
| `tour.step.dashboardPackages.content` | "Son eklenen paketleriniz durum etiketleriyle burada listelenir. Henüz paket bildirmediyseniz boş durum mesajı görünür. Tüm paketlerinizi görmek için 'Tümünü Gör' bağlantısına tıklayın." | "Your recently added packages are listed here with status badges. If you haven't reported any packages yet, an empty state message appears. Click 'View All' to see all your packages." | "Ihre zuletzt hinzugefügten Pakete werden hier mit Statusanzeigen aufgelistet. Wenn Sie noch keine Pakete gemeldet haben, erscheint eine leere Statusmeldung. Klicken Sie auf 'Alle anzeigen'." |
| `tour.step.dashboardActions.title` | "Hızlı İşlemler" | "Quick Actions" | "Schnellaktionen" |
| `tour.step.dashboardActions.content` | "Sık kullanılan işlemlere hızlı erişim. 'Adresimi Kopyala' ile ChiosBox adresinizi kopyalayın — bunu online alışverişlerde teslimat adresi olarak kullanacaksınız. 'Şimdi Öde' ile bekleyen faturalarınızı ödeyebilirsiniz." | "Quick access to frequent actions. 'Copy My Address' copies your ChiosBox address — use it as your delivery address when shopping online. 'Pay Now' lets you pay pending invoices." | "Schnellzugriff auf häufige Aktionen. 'Adresse kopieren' kopiert Ihre ChiosBox-Adresse — verwenden Sie sie als Lieferadresse beim Online-Shopping. 'Jetzt zahlen' für ausstehende Rechnungen." |
| `tour.step.packageForm.title` | "Paket Bilgileri" | "Package Details" | "Paketdetails" |
| `tour.step.packageForm.content` | "Paketinizin detaylarını girin: İçerik açıklaması (ne olduğunu tanımlar), ağırlık (ücretlendirmeyi etkiler), boyutlar (kutu seçimi için önemli) ve özel notlar. Bu bilgiler paketinizin işlenmesini hızlandırır." | "Enter your package details: content description (identifies what's inside), weight (affects pricing), dimensions (important for box selection), and special notes. This information speeds up package processing." | "Geben Sie Ihre Paketdetails ein: Inhaltsbeschreibung (identifiziert den Inhalt), Gewicht (beeinflusst den Preis), Abmessungen (wichtig für die Boxauswahl) und besondere Hinweise. Diese Informationen beschleunigen die Paketbearbeitung." |
| `tour.step.packageCard.title` | "Paket Kartı" | "Package Card" | "Paketkarte" |
| `tour.step.packageCard.content` | "Her paket kartında durum etiketi (bekleniyor, yolda, depoda, teslim edildi), kargo firması, takip numarası ve içerik özeti görünür. Detayları görmek için karta tıklayın." | "Each package card shows a status badge (awaiting, in transit, in warehouse, delivered), carrier, tracking number, and content summary. Click the card for details." | "Jede Paketkarte zeigt eine Statusanzeige (erwartet, unterwegs, im Lager, geliefert), Versanddienst, Sendungsnummer und Inhaltszusammenfassung. Klicken Sie auf die Karte für Details." |
| `tour.step.consolidateLeft.title` | "Depo Paketleri" | "Warehouse Packages" | "Lagerpakete" |
| `tour.step.consolidateLeft.content` | "Sol panelde depoda bekleyen paketleriniz listelenir. Konsolidasyon kutusuna eklemek istediğiniz paketleri seçin. Birden fazla paketi tek kutuda birleştirerek uluslararası kargo maliyetlerinden tasarruf edin." | "Your warehouse packages are listed in the left panel. Select packages to add to the consolidation box. Combine multiple packages into one box to save on international shipping costs." | "Ihre Lagerpakete werden im linken Panel aufgelistet. Wählen Sie Pakete für die Konsolidierungsbox aus. Kombinieren Sie mehrere Pakete in einer Box und sparen Sie bei internationalen Versandkosten." |
| `tour.step.consolidateRight.title` | "Konsolidasyon Kutusu" | "Consolidation Box" | "Konsolidierungsbox" |
| `tour.step.consolidateRight.content` | "Seçtiğiniz paketler master box'a transfer olur. Paket birleştirildiğinde konsolidasyon ücreti eklenir ama ayrı ayrı göndermekten çok daha ucuzdur. Farkı fiyat karşılaştırmasında görebilirsiniz." | "Your selected packages transfer to the master box. A consolidation fee is added when combining, but it's much cheaper than shipping separately. You can see the difference in the price comparison." | "Ihre ausgewählten Pakete werden in die Master-Box übertragen. Beim Kombinieren wird eine Konsolidierungsgebühr hinzugefügt, aber es ist viel günstiger als einzelne Sendungen. Den Unterschied sehen Sie im Preisvergleich." |
| `tour.step.consolidateConfirm.title` | "Konsolidasyon Onayı" | "Consolidation Confirmation" | "Konsolidierungsbestätigung" |
| `tour.step.consolidateConfirm.content` | "Paketlerinizi seçtikten sonra bu butona tıklayarak konsolidasyon talebinizi gönderin. Bu adım opsiyoneldir — paketleri tek tek de gönderebilirsiniz." | "After selecting your packages, click this button to submit your consolidation request. This step is optional — you can also ship packages individually." | "Nach der Auswahl Ihrer Pakete klicken Sie auf diese Schaltfläche, um Ihre Konsolidierungsanfrage zu senden. Dieser Schritt ist optional — Sie können Pakete auch einzeln versenden." |
| `tour.step.checkoutPay.title` | "Ödeme ve QR Kod" | "Payment & QR Code" | "Zahlung & QR-Code" |
| `tour.step.checkoutPay.content` | "Ödeme onayladıktan sonra teslim QR kodunuz oluşturulur. Bu QR kodu ChiosBox teslimat noktasında göstererek paketlerinizi alabilirsiniz." | "After confirming payment, your delivery QR code is generated. Show this QR code at the ChiosBox pickup point to collect your packages." | "Nach der Zahlungsbestätigung wird Ihr Lieferungs-QR-Code generiert. Zeigen Sie diesen QR-Code an der ChiosBox-Abholstelle, um Ihre Pakete abzuholen." |
| `tour.step.profileInfo.title` | "Kişisel Bilgiler" | "Personal Information" | "Persönliche Informationen" |
| `tour.step.profileInfo.content` | "Adınız, e-posta adresiniz, telefon numaranız ve ChiosBox ID'niz burada görünür. Düzenle butonu ile bilgilerinizi güncelleyebilir, kaydet butonu ile değişiklikleri kaydedebilirsiniz." | "Your name, email, phone number, and ChiosBox ID appear here. Use the Edit button to update your information and the Save button to save changes." | "Ihr Name, Ihre E-Mail, Telefonnummer und ChiosBox-ID werden hier angezeigt. Verwenden Sie die Schaltfläche 'Bearbeiten', um Ihre Informationen zu aktualisieren." |
| `tour.step.profilePassword.title` | "Şifre Değiştirme" | "Change Password" | "Passwort ändern" |
| `tour.step.profilePassword.content` | "Güvenliğiniz için şifrenizi buradan değiştirebilirsiniz. Mevcut şifrenizi girin, yeni şifrenizi belirleyin ve onaylayın." | "You can change your password here for security. Enter your current password, set a new one, and confirm." | "Sie können Ihr Passwort hier aus Sicherheitsgründen ändern. Geben Sie Ihr aktuelles Passwort ein, setzen Sie ein neues und bestätigen Sie." |
| `tour.step.profileAddress.title` | "ChiosBox Teslimat Adresi" | "ChiosBox Delivery Address" | "ChiosBox-Lieferadresse" |
| `tour.step.profileAddress.content` | "Bu adres Sakız Adası'ndaki depomuzun adresidir. Türk online mağazalarından alışveriş yaparken teslimat adresi olarak bu adresi kullanın. 'Adresi Kopyala' butonu ile hızlıca kopyalayabilirsiniz." | "This is the address of our warehouse on Chios Island. Use this address as your delivery address when shopping from Turkish online stores. The 'Copy Address' button copies it to your clipboard instantly." | "Dies ist die Adresse unseres Lagers auf der Insel Chios. Verwenden Sie diese Adresse als Lieferadresse bei türkischen Online-Shops. Die Schaltfläche 'Adresse kopieren' kopiert sie sofort in die Zwischenablage." |
| `tour.step.profileSubscription.title` | "Üyelik Bilgisi" | "Subscription Info" | "Abonnement-Info" |
| `tour.step.profileSubscription.content` | "Mevcut planınız ve abonelik durumunuz burada görünür. Plan adı (Basic Plan) ve durum (Aktif/Pasif) bilgilerini kontrol edebilirsiniz." | "Your current plan and subscription status appear here. You can check the plan name (Basic Plan) and status (Active/Inactive)." | "Ihr aktueller Plan und Abonnementstatus werden hier angezeigt. Sie können den Plannamen (Basic-Plan) und den Status (Aktiv/Inaktiv) überprüfen." |
| `tour.step.profileExtras.title` | "Ayarlar ve Bildirimler" | "Settings & Notifications" | "Einstellungen & Benachrichtigungen" |
| `tour.step.profileExtras.content` | "Bildirimleri açarak paket güncellemelerini anında alın. Turu yeniden başlatmak için '?' butonunu kullanabilirsiniz. Çıkış yapmak için alttaki butona tıklayın." | "Enable notifications to receive instant package updates. Use the '?' button to restart the tour. Click the logout button at the bottom to sign out." | "Aktivieren Sie Benachrichtigungen, um sofortige Paketupdates zu erhalten. Verwenden Sie die '?'-Schaltfläche, um die Tour neu zu starten. Klicken Sie auf die Abmelde-Schaltfläche unten." |

### Updated Keys

| Key | TR | EN | DE |
|-----|----|----|-----|
| `tour.step.packages.title` | "Paketlerim — Liste" | "My Packages — List" | "Meine Pakete — Liste" |
| `tour.step.packages.content` | "Tüm bildirdiğiniz paketler burada listelenir. Arama ve filtreleme ile paketlerinizi hızlıca bulun. Her paket kartında durum etiketi, kargo firması, takip numarası ve içerik bilgisi görünür. Artık 3 demo paketiniz var!" | "All your reported packages are listed here. Use search and filters to find packages quickly. Each card shows status, carrier, tracking number, and contents. You now have 3 demo packages!" | "Alle Ihre gemeldeten Pakete werden hier aufgelistet. Verwenden Sie Suche und Filter, um Pakete schnell zu finden. Jede Karte zeigt Status, Versanddienst, Sendungsnummer und Inhalt. Sie haben jetzt 3 Demo-Pakete!" |
| `tour.step.checkout.title` | "Fatura İnceleme" | "Invoice Review" | "Rechnungsprüfung" |
| `tour.step.checkout.content` | "Ödeme yapmadan önce faturalarınızı inceleyin. Kabul ücreti, konsolidasyon ücreti, depo fazlası ücreti gibi kalemleri ve paket bazlı dökümü görebilirsiniz. Toplam tutarı kontrol edin. İsterseniz paketlerinize geri dönüp düzenlemeler yapabilirsiniz." | "Review your invoices before paying. See line items like acceptance fee, consolidation fee, and demurrage charges with per-package breakdown. Check the total. You can go back to your packages to make edits." | "Überprüfen Sie Ihre Rechnungen vor der Zahlung. Sehen Sie Positionen wie Annahmegebühr, Konsolidierungsgebühr und Lagergebühren mit Paketaufschlüsselung. Prüfen Sie den Gesamtbetrag. Sie können zu Ihren Paketen zurückkehren." |

### Removed Keys

- `tour.step.profile.title` — replaced by profileInfo, profilePassword, profileAddress, profileSubscription, profileExtras
- `tour.step.profile.content` — same
- `tour.step.actions.content` (old version) — replaced by updated version
- `tour.step.consolidate.title` — replaced by consolidateLeft, consolidateRight, consolidateConfirm
- `tour.step.consolidate.content` — same

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/stores/tour-store.ts` | Update TOUR_STEPS to 22 steps, ORDER_FLOW_BEFORE=4, add 3rd mock package logic |
| `src/components/tour/tour-guide-bar.tsx` | Update ORDER_FLOW_BEFORE to 4 |
| `src/lib/seed-translations.ts` | Add all new keys (tr/en/de), update existing, remove old |
| `src/app/user/page.tsx` | Add `data-tour="dashboard-welcome"`, `dashboard-packages`, `quick-actions` |
| `src/app/user/actions/page.tsx` | Add `data-tour="package-form"`, keep `submit-btn` |
| `src/app/user/packages/page.tsx` | Add `data-tour="package-card"` to first card |
| `src/app/user/consolidate/page.tsx` | Add `data-tour="consolidate-left"`, `consolidate-right`, `consolidate-confirm` |
| `src/app/user/checkout/page.tsx` | Add `data-tour="checkout-pay"` |
| `src/app/user/profile/page.tsx` | Replace `profile` with `profile-info`, add `profile-password`, `profile-address`, `profile-subscription`, `profile-extras` |
| `src/app/api/user/route.ts` | Add password change endpoint (if not exists) |

---

## Verification

1. `npm run build` passes
2. Seed translations via `POST /api/admin/translations/seed`
3. Start tour from sidebar "?" button
4. Dashboard: 4 steps — welcome card → stats → active packages → quick actions
5. Order flow modal: 5 SVG steps explaining the shopping → shipping → tracking flow
6. Actions: 5 steps — form fills step by step, 3rd package added
7. Packages: 3 steps — list shows 3 packages, click card, detail modal with support chat
8. Consolidate: 3 steps — select packages, transfer to master box, see price changes
9. Checkout: 2 steps — review invoice line items, payment confirmation
10. Profile: 5 steps — personal info, password, address, subscription, notifications
11. All translation keys resolve to actual text (no raw keys)
