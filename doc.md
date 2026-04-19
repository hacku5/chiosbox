# 📦 CHIOSBOX DİJİTAL PLATFORM: TASARIM VE GELİŞTİRME PLANI

**Proje Özeti:** Türkiye'den AB'ye e-ticaret alışverişi yapanlar için Sakız Adası (Chios) merkezli, "Aegean Light" (Ferah Ege) tasarım diline sahip, sürtünmesiz kayıt ve akıllı paket konsolidasyon yönetimi sunan PWA tabanlı müşteri paneli ve lojistik yönetim sistemi.

---
# 🎨 CHIOSBOX ARAYÜZ TASARIM VE MİMARİ PLANI

**Ana Tasarım Dili:** Aegean Light (Ferah, Premium, Düşük Bilişsel Yük)
**Renk Paleti Özeti:** * Arka Plan: Mastic White (`#F9F9F7`)
* Vurgu/Buton: Chios Purple (`#5D3FD3`)
* Metinler: Deep Sea Teal (`#004953`)
* Uyarı/Dikkat: Sunset Gold (`#FFCF7E`)

---

## 1. PAZARLAMA SİTESİ (FRONTEND) TASARIM PLANI
**Hedef:** Güven vermek, hizmeti 5 saniyede anlatmak ve kullanıcıyı kayıt olmaya yönlendirmek.

### 1.1. Header (Üst Menü) & Navigasyon
* **Tasarım:** Sayfa kaydırıldıkça arkası hafif buzlu cam (Glassmorphism) efektine bürünen yapışkan (sticky) menü.
* **Sol:** Siyah yerine Chios Moru kullanılmış minimalist marka logosu.
* **Sağ:** "Giriş Yap" (Transparan, sadece metin) ve "Hemen Adresini Al" (Chios Moru, köşeleri hafif yuvarlatılmış hap formunda CTA butonu).

### 1.2. Hero Section (Ana Karşılama Ekranı)
* **Arka Plan:** Mastic White (`#F9F9F7`). Ekranda göz yoran fotoğraf kullanılmayacak.
* **Görsel:** Sağ tarafta, Türkiye'den Sakız Adası'na doğru uçan bir kargo uçağı ve depoya giren paketleri simgeleyen, yumuşak geçişli bir Lottie animasyonu (İzometrik 3D tarzında).
* **Tipografi:** "Avrupa Teslimat Adresiniz Hazır" başlığı büyük ve Deep Sea Teal (`#004953`) renginde.

### 1.3. "Nasıl Çalışır?" Bölümü (Scrollytelling Akışı)
* **Tasarım:** Sayfa aşağı kaydırıldıkça ekranın ortasından geçen, sıvı gibi akan bir SVG çizgisi.
* **Modüller (Alt alta):**
    1. *Alışveriş:* Alışveriş sepeti ikonu (Hover durumunda sepetin içine ürün düşme animasyonu).
    2. *Depomuza Gelsin:* Barkod okutulan kutu illüstrasyonu.
    3. *Fotoğraf Onayı:* Kutunun flaş patlayarak (Pulse efekti) fotoğrafının çekilmesi.
    4. *Teslimat/Konsolidasyon:* Adaya gelen feribot veya mutlu müşteri ikonu.

### 1.4. Dinamik Fiyatlandırma ve Hesaplayıcı Modülü
* **Tasarım:** İki ana Bento Grid kutusu.
* **Sol Kutu (İnteraktif):** Kullanıcının "Paket Sayısı" ve "Depolama Süresi"ni kaydırabileceği (Slider) araç. Slider topuzu Chios Moru renginde.
* **Sağ Kutu (Sonuç):** Hesaplanan tutarın Odometer (slot makinesi) animasyonu ile döndüğü "Aylık Tahmini Maliyet" ekranı.

### 1.5. Footer (Alt Bilgi)
* **Tasarım:** Daha koyu bir kemik rengi veya çok açık gri arka plan.
* **İçerik:** İletişim, SSS, "Yunanistan IKE Şirketi" tescil logoları, SSL ve ödeme altyapısı (Stripe) güven badge'leri.

---

## 2. MÜŞTERİ PANELİ (PWA DASHBOARD) TASARIM PLANI
**Hedef:** Kullanıcıya lojistik operasyonunu bir mobil oyun kolaylığında yönetme hissi vermek. Sıfır kargaşa.

### 2.1. Navigasyon ve Uygulama Çerçevesi (App Shell)
* **Mobil Çerçeve:** Alt navigasyon barı (Bottom Nav) - *Ana Sayfa, Paketlerim, İşlemler, Profil.* Menü ikonları seçildiğinde Chios Moru'na boyanır ve hafifçe zıplar.
* **Masaüstü Çerçeve:** Sol tarafta ikon tabanlı ince bir Sidebar.

### 2.2. Dashboard (Ana Ekran) - Bento Grid Düzeni
Ekranda birbirini tamamlayan, hafif gölgeli (Soft shadow) beyaz kartlar:
* **Üst Kart (Hoş Geldin & ID):** "Merhaba Dany, ChiosBox ID: **CBX-1045**". Sağında tıklanabilir "Adresimi Kopyala" butonu (Tıklanınca "Kopyalandı" SVG tiki çıkar).
* **Merkez Kart (Aktif Paketler Radarı):** Depoda olan paketlerin listesi. Her paketin solunda depo görevlisinin çektiği gerçek fotoğrafın minik hali (Thumbnail).
* **Sağ Üst Widget (Süre Sayacı):** Dairesel SVG grafik. Ücretsiz depolama süresi azalırken (Örn: son 3 gün) çember Sunset Gold (`#FFCF7E`) rengine döner ve hafifçe nabız gibi (pulse) atar.

### 2.3. Paket Bildirim (Pre-alert) Modülü
* **Tasarım:** Temiz bir form. Kullanıcı "Kargo Firması" alanına takip numarasını girdiğinde, logo (Örn: Amazon veya UPS) giriş kutusunun içine pürüzsüzce kayarak (Fade-in) yerleşir.

### 2.4. Konsolidasyon (Birleştirme) Arabirimi
* **Tasarım:** Ekran ikiye bölünür.
* **Sol Taraf:** Birleştirilmeye uygun paketler (Sürüklenebilir kartlar).
* **Sağ Taraf:** Büyük, boş bir "Master Box" alanı (Kesik çizgili).
* **Animasyon:** Kullanıcı soldaki kartı sağdaki kutunun içine sürükleyip bıraktığında (Drag & Drop), Master Box kartı "yutuyor" gibi hafifçe büyür ve alt kısımdaki "Tahmini Tasarruf: +€12" yazısı yeşil renkte parlar.

### 2.5. Ödeme ve Teslimat QR Kodu Ekranı
* **Tasarım:** Fatura ödeme tamamlandığında ekran Chios Moru'ndan Mastic White'a yumuşak bir geçiş yapar.
* **Odak Noktası:** Ekranın tam ortasında kocaman, net bir QR kod belirir. Etrafında "Teslimata Hazır" yazan dönen ince bir yeşil/mor çerçeve (Border animation) bulunur.

---

## 3. ADMİN VE OPERASYON PANELİ TASARIM PLANI
**Hedef:** Depo personelinin hızını artırmak, hata yapmasını engellemek. Estetikten çok "Fonsiyonalite ve Kontrast" odaklıdır.

### 3.1. Genel Düzen (Layout)
* **Tasarım:** Geniş ikonlar, devasa butonlar ve yüksek kontrast. Depo personeli tableti eldivenle bile kullansa yanlış yere basmamalıdır. (Touch-target size minimum 48x48px).

### 3.2. "Kabul / Giriş" (Intake) Modülü - Kamera Odaklı
* **Tasarım:** Ekranın üst %50'si her zaman aktif cihaz kamerasıdır (Barkod okumak için).
* **Alt %50 (Form):** Barkod okunduğunda anında müşterinin ismi belirir. Ekranı kaplayan devasa, mor bir **"FOTOĞRAF ÇEK"** butonu ortaya çıkar.
* **Raf Atama:** Fotoğraf çekildikten sonra, sistem "Önerilen Raf: A-Blok 3. Raf" bilgisini Deep Sea Teal rengi büyük fontlarla gösterir.

### 3.3. Teslimat (Pickup) Modülü
* **Tasarım:** Ana sayfada tek bir arama kutusu ve "QR Oku" butonu.
* **Eylem:** Müşteri PWA'sından QR kodu okuttuğunda;
    * Ekran bir saniyeliğine tamamen "Başarılı Yeşili" rengine döner.
    * Ekrana kocaman şu yazı gelir: **"DANY - PAKET RAF NO: A-3. TESLİM ET."**
    * Alt kısımda personelin veya müşterinin parmağıyla imza atabileceği beyaz bir Canvas (Çizim alanı) açılır.

### 3.4. Risk & Gecikme Radarı (Demurrage Dashboard)
* **Tasarım:** Finans yöneticisinin (Admin) göreceği liste.
* **Renk Kodlaması:** * 1-14 Gün: Standart metin.
    * 15-29 Gün: Arka planı açık Sunset Gold (Gecikme ücreti işliyor).
    * 30+ Gün: Kırmızı çerçeveli kartlar ("Terk Edildi / Abandoned" onayı bekleyenler). Yanında "Tasfiye Et" (Discard) butonu.

# BÖLÜM 2: DİJİTAL GELİŞTİRME VE İŞ AKIŞI PLANI (LOGIC)
*Bu bölüm, Backend/Frontend geliştiricilerinin sistemi nasıl kodlayacağını, veritabanı mantığını ve kullanıcı akışlarını tanımlar.*

## 2.1. Sürtünmesiz Kayıt (Lite-Onboarding) Logiği
Kullanıcıyı kaybetmemek için ağır belge yükleme (KYC) adımları dijitalde iptal edilmiştir.

* **Adım 1 - Hızlı Üyelik:** Google SSO, Apple Sign-in veya Email/Şifre ile sisteme anında giriş.
* **Adım 2 - Profil Oluşturma:** Yalnızca Ad-Soyad (Pasaporttaki ile aynı olmak zorunda) ve SMS onayı için Telefon Numarası istenir.
* **Adım 3 - Yasal Taahhüt (TOS & Checkbox):** Sistem kullanıcıya *"Paketimi teslim alırken ofiste kimliğimi/pasaportumu fiziksel olarak ibraz edeceğimi kabul ediyorum"* şeklinde zorunlu bir onay kutucuğu sunar.
* **Sonuç (Output):** Onay verildiği an sistem kullanıcıya özel **"ChiosBox ID" (Örn: CBX-1045)** üretir ve "Yunanistan Teslimat Adresini" paneline kopyalanabilir formatta yansıtır.

## 2.2. Sipariş Ön Bildirim ve Depo Kabul Logiği
* **Pre-Alert (Ön Bildirim):** Müşteri alışveriş yaptığında panele girer -> `Takip No (Tracking ID)` ve `Paket İçeriği` bilgisini girer.
* **Taşıyıcı Algılama:** Sistem, girilen takip numarasının Regex yapısından kargo firmasını (UPS, DHL, FedEx, Yunan Postası) otomatik tanır ve logosunu çeker. Paket "Yolda/Bekleniyor" statüsüne alınır.
* **Depo Kabul Tetikleyicisi:** Depo personeli paketi fiziksel olarak teslim alıp barkodu okuttuğunda/fotoğraf yüklediğinde, API üzerinden müşterinin paneline anlık veri basılır (WebSocket/Push Notification). Statü "Depoda" olur ve **Depolama Sayacı** (Cron Job) sıfırdan başlar.

## 2.3. Konsolidasyon (Paket Birleştirme) Logiği
Müşterinin "Aktif Paketlerim" ekranında tetikleyebileceği maliyet düşürme aracı.

* **Seçim İşlemi:** Kullanıcı, listeden birleştirmek istediği paketleri "Checkbox" ile işaretler.
* **Kural Motoru (Rules Engine):** Sadece "Depoda" statüsündeki paketler birleştirilebilir. Yolda olanlar seçilemez. Not: Kutular açılmayacak, dış paketleme yapılacaktır.
* **Maliyet Hesaplama Logiği:**
  1. Sistem, seçilen tüm paketlerin "Kabul/Teslim Alma" sabit ücretlerini toplar (Örn: 3 paket x €4 = €12).
  2. Birleştirme hizmet bedelini (Konsolidasyon Fee: €8) bu toplama ekler (Toplam: €20).
  3. Müşteriye "Tahmini Tasarruf" oranını (tek tek göndermeye kıyasla) gösterir.
* **Aksiyon:** "Birleştir" komutu verildiğinde eski barkodlar sistemde "Arşiv/Birleştirildi" durumuna düşer, Admin paneline tek bir "Master Box" oluşturulması için iş emri (Work Order) düşer.

## 2.4. Fatura, Mock Ödeme (Checkout) ve Teslimat Logiği
*Sistem şu an gerçek bir Sanal POS'a bağlanmayacak, ancak üretim ortamına hazır bir mantıkla çalışacaktır.*

* **Fatura (Invoice) Oluşumu:** Müşterinin sepeti şu kalemlerden oluşur:
    * *Base Fee (Kabul Ücreti):* Paket başı tahakkuk eden ücret.
    * *Demurrage (Gecikme/Depolama):* Ücretsiz süre aşıldığında sistemin her gece 00:00'da hesaba eklediği +€1/+€2 gecikme bedeli.
    * *Service Fee:* Varsa konsolidasyon bedeli.
* **Checkout Akışı:**
    1. Kullanıcı "Hesabı Kapat / Teslimata Hazırla" butonuna basar.
    2. Detaylı özet ekranı çıkar.
    3. Kullanıcı "Kartla Öde" (Mock Button) tıklar.
* **Mock Sonuç Tetikleyicisi:** Butona tıklandığında 1.5 saniyelik bir yükleme simülasyonu çalışır. İşlem `status: success` döner.
* **QR Kod Üretimi:** Ödeme başarılı olduğu an sistem bir UUID üretir ve bunu bir QR Koda dönüştürür. Panelin ortasında **"Teslimat QR Kodunuz"** belirir. Müşteri adaya gidip bu QR kodu ve kimliğini göstererek paketini alır.

## 2.5. Admin Paneli & Operasyon Arayüzü Logiği (Özet)
*Müşteri panelinin arka plandaki aynası.*
* **Intake (Giriş) Ekranı:** Sadece büyük bir kamera/barkod okuyucu alanı. Okut, fotoğraf çek, raf numarasını gir (A-3 gibi), "Kaydet"e bas. Sıfır tıkla işlem felsefesi.
* **Gecikme Radarı:** Ücretsiz süresini doldurmuş paketlerin kırmızı bir listesi. 30 günü geçen paketler için otomatik "Terk Edildi (Abandoned)" uyarısı.
* **Teslimat Modu:** Müşterinin gösterdiği QR kodu okutup, statüyü saniyeler içinde "Teslim Edildi" yapma ve paketi envanterden düşme işlemi.

---

# BÖLÜM 3: TEKNİK YIĞIN (TECH STACK)

* **Frontend (Müşteri & Admin Paneli):** Next.js (React) - PWA desteği, hızlı render ve SEO için.
* **State Management & Data Fetching:** Zustand (Hafif global state) ve React Query (Paket durumlarını gerçek zamanlı senkronize etmek için).
* **Styling & UI Framework:** Tailwind CSS (Aegean Light renk kodları `tailwind.config.js` içine gömülecek) + Radix UI (Erişilebilir, stilize edilebilir headless komponentler).
* **Animasyonlar:** Framer Motion (Bento grid geçişleri ve sıvı hover efektleri) + Lottie-React (Karmaşık illüstrasyonlar).
* **Backend & API:** Node.js (Express veya NestJS).
* **Database:** PostgreSQL (Mali kayıtlar ve sipariş ilişkileri için) + Prisma ORM.
* **Görev Zamanlayıcı (Cron Jobs):** Gecikme ücretlerini (demurrage) her gece hesaplamak ve otomatik e-posta bildirimleri atmak için Node-Cron.

---
*Not: Bu belge, hem UI/UX ekibinin Figma'da ekranları çizerken kullanacağı bir "Design System" rehberi hem de Backend ekibinin veritabanı şemasını kurarken (Kullanıcı, Paketler, İşlemler, Faturalar tabloları) referans alacağı ana plandır.*