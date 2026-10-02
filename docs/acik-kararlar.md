# Açık kararlar (Yusuf / Ahmet)

Hepsi `src/magaza/ayarlar.ts` içinden tek satırla değişir. Site bu değerler olmadan da çalışır; eksik olanlar
gizlenir ya da yasal metinlerde sarı "eklenecek" etiketiyle görünür.

## Satıştan önce mutlaka
| Konu | Şu an | Nerede |
|---|---|---|
| Banka hesabı (IBAN, alıcı adı) | Yok. Onay sayfası "hesap bilgisini ileteceğiz" diyor | `ayarlar.ts` → `BANKA` |
| İletişim (telefon, WhatsApp, e-posta) | Yok. İletişim sayfasında yalnız mesaj formu var | `ayarlar.ts` → `ILETISIM` |
| Şirket bilgileri (unvan, adres, vergi no, MERSİS, KEP) | Yok. Yasal metinlerde sarı etiket | `ayarlar.ts` → `SATICI` |
| Yönlendirme hizmeti ücretli mi, süresi ne? | SSS'te "ayrıca ücret ödemezsiniz" yazıyor (doğrulanmadı) | `TICARI.yonlendirmeUcreti`, `SATICI.yonlendirmeSuresi` |
| Kargo firması | Belirsiz (kargo ücretsiz, onaylı) | `TICARI.kargoFirmasi` |
| İade kargo ücretini kim öder | Belirsiz | `SATICI.iadeKargo` |
| Yasal metinler | Taslak, hukukçu incelemesi gerekli (notlar `src/icerik/yasal.ts` içinde `notlar` alanlarında) | |
| Stok dağılımı | 40 Google + 40 Instagram varsayıldı | Yönetim → Stok |

## Ahmet ile netleşecek
- Müşteri kartını nasıl kuruyor: `ahmcloud.com/kart` hesabı satın alınca mı açılıyor, müşteri kendisi mi
  açıyor? Sitedeki kurulum adımları "okut → giriş yap → bağlantını seç" diye yazıldı.
- Satılan her kartın kodu ahmcloud'da önceden tanımlı mı, siparişle kart kodu eşleştirilecek mi?
- Sunucu konumu (KVKK aydınlatma metnine yazılacak).

## İleride
- Kartla ödeme: iyzico ya da PayTR üye işyeri hesabı açılınca ödeme adımına eklenir.
- Sipariş bildirimi: şu an yönetim panelinden takip ediliyor; e-posta/SMS/Telegram bildirimi eklenebilir.
- Sosyal medya ajansının videoları hazır olunca ürün sayfalarına ve ana sayfaya eklenecek.
- Alan adı nfcqrkartim.com alınınca `SITE_ADRESI` ve `ARAMA_MOTORU_ACIK=1`.
