# nfcqrkartim

NFC ve dinamik QR'lı pleksi standların (Google yorum standı, Instagram takip standı, ikili set) e-ticaret sitesi.
Demo: https://nfcqrkartimcom.ahmcloud.com

## Yığın
Next.js 16 (App Router) · React 19 · Tailwind 4 · TypeScript · Zod · SQLite (`node:sqlite`, ek paket yok) ·
Phosphor ikonları. Yazı tipleri: Bricolage Grotesque, Geist, Geist Mono.

## Geliştirme
```bash
npm install
cp .env.example .env.local   # YONETICI_SIFRE yazın
npm run dev -- --port 3100
```
Veritabanı ilk istekte `./veri/magaza.sqlite` olarak kurulur (40 Google + 40 Instagram stok).

## Klasörler
- `src/app/(magaza)` mağaza sayfaları · `src/app/yonetim` yönetim paneli
- `src/magaza` katalog, ayarlar, para/tarih yardımcıları · `src/sunucu` veritabanı, sipariş, stok, oturum
- `src/bilesenler` arayüz parçaları · `src/gorseller` ürün ve sahne görselleri · `src/icerik` SSS ve yasal metinler
- `docs/` marka dili, açık kararlar, yayına alma · `scripts/` ekran görüntüsü, paylaşım görseli, ürün render'ı
