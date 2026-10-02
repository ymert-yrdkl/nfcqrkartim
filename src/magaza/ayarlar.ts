// Mağazanın ticari ayarları tek yerde.
// "ONAY BEKLİYOR" yazan değerler Yusuf'un önerisidir; onaylanınca docs/marka.md de güncellenir.
// null olan iletişim/şirket bilgileri sitede gizlenir ya da yasal metinlerde "eklenecek" diye görünür.

export const SITE = {
  ad: "nfcqrkartim",
  slogan: "Telefonu yaklaştırın, gerisi kendiliğinden.",
  // Canlı adres; ortam değişkeniyle değiştirilebilir (Coolify: SITE_ADRESI).
  adres: process.env.SITE_ADRESI ?? "https://nfcqrkartimcom.ahmcloud.com",
  aciklama:
    "İşletmenizin kasasına koyacağınız NFC ve QR'lı pleksi stand. Müşteriniz telefonunu yaklaştırır, Google yorum sayfanız ya da Instagram profiliniz açılır.",
} as const;

// Kartların bağlandığı kurulum paneli (QR'lar ahmcloud.com/q/<KOD> adresine gider).
export const KURULUM_PANELI = "https://ahmcloud.com/kart";
export const ORNEK_KART_KODU = { google: "23EFXF", instagram: "27KN9C" } as const;

export const TICARI = {
  // Kargo ücreti (kuruş). 0 = ücretsiz (Yusuf onaylı, 2 Ekim 2026).
  kargoUcreti: 0,
  // ONAY BEKLİYOR: ödeme onayından sonra kargoya veriliş süresi (iş günü).
  kargoyaVerilisGun: "1-3",
  kargoyaVerilis: "1-3 iş günü",
  kargoFirmasi: null as string | null,
  // Havale bekleme süresi. Süre + 1 gün geçen ödenmemiş siparişler kendiliğinden iptal edilir.
  odemeSuresiGun: 3,
  // Bir satırda en çok kaç adet sepete eklenebilir (toplu alım iletişimden).
  satirBasinaEnCok: 10,
  // Bir siparişte en çok kaç pano (ikili set 2 pano sayılır). Stoğun tek siparişle kilitlenmesini önler.
  siparisBasinaEnCokPano: 12,
  // ONAY BEKLİYOR: stand alındıktan sonra yönlendirme hizmeti ücretli mi?
  // Bu cümle SSS'te ve ürün sayfasında görünür. Doğrulanmadan yayına almayın.
  yonlendirmeUcreti:
    "Standı bir kez satın alırsınız. Bağlantınızı değiştirmek için ayrıca ücret ödemezsiniz.",
} as const;

// Havale/EFT bilgisi. null iken sipariş onay sayfası "hesap bilgisini ileteceğiz" der.
export const BANKA: { banka: string; alici: string; iban: string } | null = null;

// İletişim. null olanlar sitede gösterilmez.
export const ILETISIM = {
  eposta: null as string | null,
  telefon: null as string | null, // görünen biçim: "0555 555 55 55"
  whatsapp: null as string | null, // yalnız rakam, ülke koduyla: "905555555555"
  instagram: null as string | null, // kullanıcı adı, @ olmadan
  calismaSaatleri: "Hafta içi 09.00-18.00",
} as const;

// Şirket bilgileri yasal metinlerde kullanılır. Hepsi eklenecek.
export const SATICI = {
  unvan: null as string | null,
  adres: null as string | null,
  vergiDairesi: null as string | null,
  vergiNo: null as string | null,
  mersis: null as string | null,
  kep: null as string | null,
  iadeAdresi: null as string | null,
  sunucuKonumu: null as string | null,
  // İade kargo ücretini kim öder (ör. "satıcı öder; ürünü anlaşmalı kargoyla ücretsiz gönderirsiniz").
  iadeKargo: null as string | null,
  // Yönlendirme hizmetinin süresi ve kapsamı (ör. "ürünün ömrü boyunca, ek ücret olmadan").
  yonlendirmeSuresi: null as string | null,
  // Kurumsal (tacir) alıcılara iade politikası.
  kurumsalIade: null as string | null,
} as const;

export const YASAL_GUNCELLEME = "2 Ekim 2026";
