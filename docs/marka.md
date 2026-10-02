# nfcqrkartim marka dili

Bu dosya markanın tek kaynağıdır. Site (`src/app/globals.css`) ve sosyal medya içerikleri buradan okur.
Değişiklik önce buraya yazılır. Son güncelleme: 2 Ekim 2026.

## Ürün (tek cümle)
İşletmenin kasasına ya da masasına konan, telefon yaklaştırılınca (NFC) ya da QR okutulunca müşteriyi
işletmenin Google yorum sayfasına veya Instagram profiline götüren pleksi stand. QR dinamiktir:
yönlendirdiği adres sonradan, yeniden baskı gerekmeden değiştirilir.

## Ad ve slogan
- Ad: **nfcqrkartim** (her zaman küçük harf, tek kelime). Alan adı: nfcqrkartim.com (alınacak);
  demo: nfcqrkartimcom.ahmcloud.com.
- Slogan: **Telefonu yaklaştırın, gerisi kendiliğinden.**

## Renkler
Marka nötrdür; ürünün kendi Google ve Instagram renkleri öne çıksın diye tek bir vurgu rengi kullanılır.
Vurgu (sinyal yeşili) bir ekranın en çok %5'i kadardır: birincil düğme, vurgulanan kelimenin altı, odak halkası.

| Ad | Hex | OKLCH | Kullanım |
|---|---|---|---|
| Kâğıt | #F4F4EE | 0.965 0.008 100 | Sayfa zemini |
| Kâğıt 2 | #FCFBF8 | 0.988 0.004 100 | Yükseltilmiş yüzey (kart, çekmece) |
| Kâğıt 3 | #EBEAE2 | 0.935 0.011 100 | Gömük yüzey, ürün sahnesi zemini |
| Çizgi | #D7D6CD | 0.875 0.012 100 | İnce ayırıcı çizgi |
| Mürekkep | #151511 | 0.195 0.008 110 | Metin, koyu düğme |
| Soluk | #5E5E56 | 0.48 0.012 105 | İkincil metin (kâğıtta 5.9:1) |
| Sinyal | #C5F94E | 0.915 0.2 125 | Tek vurgu. Üstüne yalnız mürekkep yazılır (14.8:1). Açık zeminde METİN rengi olarak kullanılmaz. |
| Gece | #11110D | 0.175 0.008 110 | Koyu bant zemini (sayfada en çok bir kez) |
| Gece soluk | #ABABA4 | 0.74 0.01 105 | Koyu bantta ikincil metin |

Saf siyah (#000) ve saf beyaz (#FFF) zemin olarak kullanılmaz (ürünün kendisi beyazdır, ondan ayrılsın).

## Yazı tipleri (Google Fonts, Türkçe karakter destekli)
- Başlık: **Bricolage Grotesque** 600-700, sıkı harf aralığı (-0.03em).
- Metin: **Geist** 400 (vurgu 600).
- Kod / etiket / teknik ölçü: **Geist Mono** 500, büyük harf etiketlerde +0.08em aralık.
  Kart kodları (23EFXF gibi) her zaman mono yazılır.
- Kullanılmaz: Inter, Roboto, Poppins, Montserrat, italik başlık.

## Motif
- QR'ın köşe gözü (kare içinde kare) + NFC dalgası (iç içe üç yay). Logo bu ikisinin birleşimidir.
- Fosfor vurgu: başlıkta tek ifadenin altına sinyal yeşili bant (metnin x-yüksekliğinde).
- Mono teknik etiketler: `KART 23EFXF`, `100 × 100 MM`, `NFC + QR`.

## Logo dosyaları
`src/gorseller/marka/`: `logo-isaret.svg` (mürekkep), `logo-isaret-vurgulu.svg` (iç kare sinyal yeşili),
`logo-isaret-koyu-zemin.svg` (koyu zemin), `profil.svg` + `profil-1080.png` (Instagram profil fotoğrafı).
Yazı logosu: işaret + "nfcqrkartim", Bricolage Grotesque 700, harf aralığı -0.03em, işaret yazının ~1.3 katı.

## Görsel kural
- Ürün her zaman gerçek tasarımıyla görünür (stüdyo render'ı ya da gerçek fotoğraf). Ürünün baskısı,
  QR'ı ve yazısı yeniden çizilmez.
- Yapay zekâyla üretilmiş sahne (Flow) kullanılırsa altına küçük not düşülür:
  "Sahne görseli yapay zekâyla oluşturuldu; ürün gerçek tasarımıdır."
- Sahte müşteri, sahte yorum, sahte işletme logosu, uydurma sayı yok.

## Ton
- Esnafa "siz" diye hitap; kısa, somut, teknik terimsiz ("NFC" yerine çoğu yerde "telefonu yaklaştırın").
- Uzun çizgi (—) kullanılmaz. "Yeni nesil, sorunsuz, devrim, üst seviye, eşsiz" gibi şişirme sözcükler yok.
- Başlıklar cümle düzeninde (Her Kelime Büyük Değil).

## Ticari bilgiler (ÖNERİ, Yusuf onaylayacak)
Tek yer: `src/magaza/ayarlar.ts`. Onaylanınca bu tablo güncellenir.

| Konu | Öneri | Dayanak |
|---|---|---|
| Google yorum standı | 549 TL | Trendyol/idefix benzerleri 399-699 TL (Ekim 2026) |
| Instagram takip standı | 549 TL | aynı |
| İkili set (Google + Instagram) | 949 TL | iki tekliden 149 TL az |
| Kargo | Ücretsiz, 1-3 iş gününde kargoda | |
| Ödeme | Havale / EFT (kartla ödeme için iyzico ya da PayTR hesabı gerekir) | |
| Stok | Google 40, Instagram 40 (toplam ~80) | Yusuf: "yaklaşık 80 adet" |
| Kurulum paneli | https://ahmcloud.com/kart | QR'lar ahmcloud.com/q/KOD adresine gider |
