@AGENTS.md

# nfcqrkartim — proje bağlamı

İşletmelerin kasasına konan NFC + dinamik QR'lı pleksi standların (Google yorum standı, Instagram takip standı,
ikili set) e-ticaret sitesi. Sahibi Yusuf (GitHub ymert-yrdkl). Demo adresi: https://nfcqrkartimcom.ahmcloud.com
(Ahmet'in Coolify sunucusu). Alan adı nfcqrkartim.com ileride alınabilir. Stok: ~80 pano.

QR'lar ve NFC `https://ahmcloud.com/q/<KOD>` adresine gider; yönlendirme ve kurulum paneli
(`https://ahmcloud.com/kart`) Ahmet'in ayrı sistemidir. Bu site yalnız satış yapar, yönlendirmeye dokunmaz.

## Çalışma kuralları
1. Dil: arayüz, metin, kod adları Türkçe (Urun, Siparis, Sepet); teknik terimler İngilizce kalabilir. Yusuf
   TypeScript öğreniyor: sade, az soyutlamalı kod, "sihir" yok.
2. Marka dili tek kaynak: `docs/marka.md`. Renk yalnız `src/app/globals.css` token'larıyla (Tailwind'in hazır
   paleti kapalı: `bg-kagit`, `text-murekkep`, `bg-sinyal`...). Uzun çizgi (—) yok, şişirme sözcük yok.
3. Ticari ayarlar tek yer: `src/magaza/ayarlar.ts` ("ONAY BEKLİYOR" yazanlar Yusuf'un kararı). Ürünler:
   `src/magaza/urunler.ts`. Fiyat kuruş (tam sayı); sunucu siparişte fiyatı her zaman katalogdan okur.
4. Görseller: `src/gorseller/index.ts` tek dağıtım noktası. `urun/` stüdyo render'ları gerçek geometri ve gerçek
   baskıyla (`scripts/gorsel/urun_render.py`). `sahne/` sosyal medya ajansının sahneleri (ortam yapay zekâ, ürün
   yüzü gerçek baskı); yanlarında YZ notu gösterilir. Ürün yapay zekâyla yeniden çizilmez.
5. Okuma Server Component, yazma Server Function; her yönetim sayfası/eylemi ilk satırda `yonetimGerekli()`.
   Formlarda `<form action>` yerine `onSubmit` + `startTransition` (React 19 hata sonrası formu sıfırlamasın).
6. Veritabanı: Node'un yerleşik `node:sqlite` (ek paket yok), `src/sunucu/db.ts`. Şema değişikliği = `GOCLER`
   dizisine YENİ adım; eski adım değiştirilmez.
7. Sunucu (Coolify) Ahmet'in; dağıtım ve DNS değişikliği Yusuf/Ahmet onayıyla. Commit mesajları Türkçe.

## Komutlar
- `npm run dev -- --port 3100` · `npm run build` · `npm run lint` · `npx tsc --noEmit`
- Ekran görüntüsü (sistem Chrome'u): `node scripts/ekran.mjs .ekran / /urun/ikili-set@390` (Git Bash'te
  `MSYS_NO_PATHCONV=1`). Paylaşım görseli ve ikonlar: `node scripts/paylasim-gorselleri.mjs` (dev açıkken).
- Kartla ödeme (iyzico): `src/sunucu/iyzico.ts` (IYZWSv2 imzalı istemci), `src/sunucu/kart-odeme.ts` (başlat /
  sonuçlandır), `/api/odeme/iyzico` (dönüş), `/api/odeme/iyzico/bildirim` (webhook). IYZICO_* ortam değişkenleri
  yoksa kart seçeneği gizli. Yerel deneme: `node scripts/iyzico-sahte.mjs` + dev'i IYZICO_ADRES=http://localhost:3999
  ile aç → `node scripts/kart-odeme-deneme.mjs` (14 denetim).
- Uçtan uca deneme: `node scripts/uctan-uca.mjs` (dev açıkken; sipariş → yönetim → sorgulama → stok çakışması).
- Videolar: `public/video/` (720×1280, sessiz, H.264). Kaynak: sosyal medya klasörü `06-medya/hazir/videolar/site/`. Sıkıştırma: `ffmpeg -i kaynak.mp4 -an -vf scale=720:1280,fps=24 -c:v libx264 -crf 27 -preset slow -movflags +faststart cikti.mp4` (bu makinede ffmpeg yok; `Projeler/flow/node_modules/ffmpeg-static/ffmpeg.exe` kullanıldı). Kayıt: `src/gorseller/index.ts` → `VIDEO`.
- Ürün render'ları: `python scripts/gorsel/urun_render.py` (numpy, Pillow, OpenCV).
- Yerel yönetim paneli: `.env.local` içinde `YONETICI_SIFRE`, adres `/yonetim`.
- Önizleme aracı (preview_start) bu projenin launch.json'unu görmüyor; dev sunucusu Bash arka planda çalıştırıldı.

## Durum (2 Ekim 2026)
- YAYINDA: https://nfcqrkartimcom.ahmcloud.com (Coolify projesi `nfcqrkartim`, açık depo ymert-yrdkl/nfcqrkartim, kalıcı birim /veri). Push sonrası Coolify'da elle Deploy. `YONETICI_SIFRE` Coolify'a Yusuf tarafından eklenecek. Ayrıntı `docs/yayina-alma.md`.
- Site tamam: ana sayfa, mağaza, 3 ürün sayfası, sepet (çekmece + sayfa), ödeme (havale/EFT), sipariş onay ve
  takip, sipariş sorgulama, nasıl çalışır, SSS, iletişim (mesaj formu), 7 yasal metin (taslak), 404,
  site haritası, robots (demo'da kapalı), paylaşım görseli; yönetim paneli (siparişler, durum, kargo takip,
  stok, mesajlar). Uçtan uca denendi (sipariş → yönetim → kargoda → müşteri sorgusu).
- Bağımsız inceleme (2 Eki) 16 bulgu verdi, hepsi düzeltildi: hız sınırı yalnız geçerli denemeyi sayar; stok kaydı iyimser kilitli; sipariş başına en çok 12 pano; ödeme süresi + 1 gün geçen sipariş kendiliğinden iptal (stok serbest); kargoya verilmiş sipariş iptal edilemez, iptal geri alınabilir; sorguyla açılan sipariş sayfası maskeli; çerezler süreli ve türlü; yönetim oturumu şifreye bağlı; hata sınırı sayfaları; Docker'da SITE_ADRESI derleme argümanı.
- Açık kararlar: `docs/acik-kararlar.md`. Yayına alma: `docs/yayina-alma.md`.
