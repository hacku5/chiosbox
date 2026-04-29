# Manuel Test Planı

## Test Kullanıcıları

| Email | Şifre | Rol | ChiosBox ID |
|-------|-------|-----|-------------|
| cust@test.com | 123456 | Standart müşteri | CB-CUST |
| admin@test.com | 123456 | Super admin (tüm yetkiler) | CB-ADMIN |
| editor@test.com | 123456 | Editör (kısmi admin) | CB-EDITOR |

---

## 1. Anonim Erişim Testleri (Giriş Yapmadan)

### 1.1 Ana Sayfa
- [ ] `/` adresine git → Landing page yüklenmeli
- [ ] Navbar'da "Giriş Yap" ve "Adresini Al" butonları görünmeli

### 1.2 Auth Korumalı Sayfalar
- [ ] `/user` adresine git → `/login`'e yönlendirilmeli
- [ ] `/user/packages` adresine git → `/login`'e yönlendirilmeli
- [ ] `/user/checkout` adresine git → `/login`'e yönlendirilmeli
- [ ] `/user/actions` adresine git → `/login`'e yönlendirilmeli
- [ ] `/user/consolidate` adresine git → `/login`'e yönlendirilmeli
- [ ] `/user/profile` adresine git → `/login`'e yönlendirilmeli
- [ ] `/admin` adresine git → `/admin/login`'e yönlendirilmeli
- [ ] `/admin/packages` adresine git → `/admin/login`'e yönlendirilmeli

### 1.3 Login Sayfaları
- [ ] `/login` adresine git → Login formu görünmeli
- [ ] `/register` adresine git → Kayıt formu görünmeli
- [ ] `/admin/login` adresine git → Admin login formu görünmeli

### 1.4 Public Sayfalar
- [ ] `/policies/terms` → Kullanıcı sözleşmesi sayfası yüklenmeli
- [ ] `/policies/privacy` → Gizlilik politikası sayfası yüklenmeli
- [ ] `/policies/kvkk` → KVKK sayfası yüklenmeli

---

## 2. Standart Kullanıcı Testleri (cust@test.com)

### 2.1 Login
- [ ] `/login`'e git, `cust@test.com` / `123456` ile giriş yap
- [ ] Giriş başarılı → `/user` dashboard'a yönlendirilmeli
- [ ] Navbar'da kullanıcı adı ("Test") görünmeli
- [ ] Sidebar'da "CB-CUST" ID'si görünmeli

### 2.2 Dashboard
- [ ] Hoşgeldin kartı görünmeli
- [ ] Depodaki paket sayısı, yoldaki paket sayısı gösterilmeli
- [ ] Hızlı erişim butonları çalışmalı (Paketler, Konsolidasyon, Ödeme, Ayarlar)

### 2.3 Paketler
- [ ] `/user/packages` → Paket listesi sayfası yüklenmeli
- [ ] Filtreleme sekmeleri çalışmalı (Tümü, Depoda, Yolda, vb.)
- [ ] Arama kutusu çalışmalı

### 2.4 Aksiyonlar (Paket Bildirimi)
- [ ] `/user/actions` → Form yüklenmeli
- [ ] Takip numarası, kargo firması, içerik alanları doldurulabilmeli
- [ ] Ağırlık ve boyut preset'leri seçilebilmeli
- [ ] Form gönderilebilmeli (API çağrısı çalışmalı)

### 2.5 Konsolidasyon
- [ ] `/user/consolidate` → Konsolidasyon sayfası yüklenmeli
- [ ] Depodaki paketler listelenmeli
- [ ] Paketler kutuya eklenebilmeli/çıkarılabilmeli

### 2.6 Ödeme
- [ ] `/user/checkout` → Fatura listesi yüklenmeli
- [ ] Bekleyen faturalar gösterilmeli

### 2.7 Profil
- [ ] `/user/profile` → Profil sayfası yüklenmeli
- [ ] Kullanıcı bilgileri düzenlenebilmeli

### 2.8 Admin Erişimi (ENGELLENMELİ)
- [ ] `/admin` adresine git → `/login`'e yönlendirilmeli VEYA erişim reddedilmeli
- [ ] `/admin/packages` adresine git → erişim reddedilmeli
- [ ] `/admin/customers` adresine git → erişim reddedilmeli
- [ ] `/admin/invoices` adresine git → erişim reddedilmeli
- [ ] `/api/admin/packages` → 401/403 dönmeli
- [ ] `/api/admin/customers` → 401/403 dönmeli

### 2.9 Logout
- [ ] Logout butonuna tıkla → `/login`'e yönlendirilmeli
- [ ] Logout sonrası `/user` adresine git → tekrar `/login`'e yönlendirilmeli

---

## 3. Admin Testleri (admin@test.com)

### 3.1 Admin Login
- [ ] `/admin/login`'e git, `admin@test.com` / `123456` ile giriş yap
- [ ] Giriş başarılı → `/admin` dashboard'a yönlendirilmeli
- [ ] Admin sidebar'da tüm menü öğeleri görünmeli

### 3.2 Admin Dashboard
- [ ] `/admin` → İstatistikler gösterilmeli
- [ ] Müşteri sayısı, paket sayısı, fatura sayısı görünmeli

### 3.3 Admin Modülleri
- [ ] `/admin/packages` → Paket yönetimi yüklenmeli
- [ ] `/admin/customers` → Müşteri listesi yüklenmeli
- [ ] `/admin/invoices` → Fatura yönetimi yüklenmeli
- [ ] `/admin/intake` → Paket kabul sayfası yüklenmeli
- [ ] `/admin/pickup` → Teslim alma sayfası yüklenmeli
- [ ] `/admin/users` → Kullanıcı yönetimi yüklenmeli
- [ ] `/admin/policies` → Politika yönetimi yüklenmeli
- [ ] `/admin/translations` → Çeviri yönetimi yüklenmeli

### 3.4 Admin API Erişimi
- [ ] `/api/admin/packages` → 200 dönmeli (veri listelenmeli)
- [ ] `/api/admin/customers` → 200 dönmeli
- [ ] `/api/admin/invoices` → 200 dönmeli
- [ ] `/api/admin/stats` → 200 dönmeli

### 3.5 Admin → User Erişimi
- [ ] Admin girişliyken `/user` adresine git → `/admin`'e yönlendirilmeli
  (Admin kullanıcılar müşteri paneline girememeli)

---

## 4. Editor Testleri (editor@test.com)

### 4.1 Editor Login
- [ ] `/admin/login`'e git, `editor@test.com` / `123456` ile giriş yap
- [ ] Giriş başarılı → `/admin` dashboard'a yönlendirilmeli

### 4.2 Yetkili Modüller (Erişilmeli)
- [ ] `/admin/packages` → Paket yönetimi yüklenmeli
- [ ] `/admin/intake` → Paket kabul sayfası yüklenmeli
- [ ] `/admin/pickup` → Teslim alma sayfası yüklenmeli

### 4.3 Yetkisiz Modüller (Erişilmemeli)
- [ ] `/admin/customers` → erişim reddedilmeli veya menüde görünmemeli
- [ ] `/admin/invoices` → erişim reddedilmeli
- [ ] `/admin/users` → erişim reddedilmeli
- [ ] `/admin/policies` → erişim reddedilmeli
- [ ] `/admin/translations` → erişim reddedilmeli

### 4.4 Editor API Erişimi
- [ ] `/api/admin/packages` → 200 dönmeli
- [ ] `/api/admin/intake` → 200/400 dönmeli (erişim var)
- [ ] `/api/admin/customers` → 403 dönmeli (erişim yok)
- [ ] `/api/admin/invoices` → 403 dönmeli
- [ ] `/api/admin/users` → 403 dönmeli

---

## 5. Dil Değişikliği Testleri

- [ ] Ana sayfada dil değiştirici → TR/EN/DE bayrakları görünmeli
- [ ] TR seç → sayfa Türkçe yüklenmeli
- [ ] EN seç → sayfa İngilizce yüklenmeli
- [ ] DE seç → sayfa Almanca yüklenmeli
- [ ] Login sayfasında dil değiştirici çalışmalı
- [ ] Dashboard'da dil değiştirici çalışmalı
- [ ] Admin panelinde dil değiştirici çalışmalı

---

## 6. Çapraz Erişim Testleri

- [ ] cust@test.com girişliyken `/admin/login`'e git → admin login formu görünmeli (zaten giriş yapmış ama admin değil)
- [ ] admin@test.com girişliyken `/login`'e git → normal login formu görünmeli
- [ ] Aynı tarayıcıda farklı kullanıcılarla oturum açma (gizli sekme ile)

---

## 7. Güvenlik Testleri

- [ ] `/api/admin/packages` POST without auth → 401
- [ ] `/api/admin/customers` GET with cust@test.com token → 403
- [ ] `/api/packages` GET with no auth → 401
- [ ] `/api/user` GET with no auth → 401
- [ ] Rate limiting: hızlıca 10+ login denemesi → rate limit uyarısı
- [ ] XSS: Paket içeriğine `<script>alert(1)</script>` gir → script çalışmamalı

---

## Notlar

- Tüm testler tarayıcı (Chrome/Firefox) ile yapılmalı
- F12 Network sekmesi açıkken API çağrıları gözlemlenebilir
- F12 Console sekmesinde hata olmamalı
- Gerekirse gizli sekme (incognito) kullanılmalı
