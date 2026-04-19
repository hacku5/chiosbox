# Görev: ChiosBox Admin & Operasyon Paneli

## Hedef
Depo personelinin hızını artırmak, hata yapmasını engellemek. Estetikten çok fonksiyonellik ve yüksek kontrast.

## Adımlar
- [ ] Adım 1: Admin Layout + Route yapısı (/admin/*)
- [ ] Adım 2: Intake (Kabul/Giriş) Modülü — Kamera + barkod + fotoğraf + raf atama
- [ ] Adım 3: Teslimat (Pickup) Modülü — QR okut, müşteri adı, imza canvas
- [ ] Adım 4: Gecikme Radarı (Demurrage Dashboard) — Renk kodlamalı liste
- [ ] Adım 5: Genel İstatistik ve Responsive doğrulama

## Tasarım Notları (doc.md)
- Geniş ikonlar, devasa butonlar, yüksek kontrast (minimum 48x48px touch target)
- Kamera üst %50, form alt %50
- Barkod okunduğunda müşterinin ismi anında belirir
- Devasa mor "FOTOĞRAF ÇEK" butonu
- Teslimat: QR okut → "BAŞARILI YEŞİLİ" → isim + raf → imza canvas
- Gecikme radarı: 1-14 gün normal, 15-29 gün Sunset Gold, 30+ gün kırmızı çerçeve
