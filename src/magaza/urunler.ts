// Ürün kataloğu. Fiyatlar kuruş; sunucu siparişte fiyatı HER ZAMAN buradan yeniden okur.
// Stok veritabanında "stok kalemi" (sku) bazında tutulur: ikili set bir Google + bir Instagram düşer.

import { GORSEL, VIDEO, type Gorsel, type Video } from "@/gorseller";

export type StokKalemi = "google" | "instagram";
export type UrunSlug = "google-yorum-standi" | "instagram-takip-standi" | "ikili-set";

export type Urun = {
  slug: UrunSlug;
  ad: string;
  kisaAd: string; // sepet ve model seçicide
  fiyat: number; // kuruş, KDV dahil (Yusuf onaylı, 2 Ekim 2026)
  ozet: string; // tek cümle
  aciklama: string[]; // ürün sayfasında paragraflar
  icerik: string[]; // kutu içeriği
  stok: { kalem: StokKalemi; adet: number }[];
  gorseller: Gorsel[]; // ilki kapak
  video?: Video; // galeride ikinci sırada
};

export const URUNLER: Urun[] = [
  {
    slug: "google-yorum-standi",
    ad: "Google yorum standı",
    kisaAd: "Google",
    fiyat: 54900,
    ozet: "Hesap ödenirken müşterinizi doğrudan Google yorum sayfanıza götürür.",
    aciklama: [
      "Müşteriniz telefonunu standa yaklaştırır, işletmenizin Google yorum penceresi açılır. Arama yapması, işletmenizi bulması gerekmez. NFC'si kapalı telefonlar için aynı bağlantı QR'da da var.",
      "Standın gittiği adresi kurulum panelinden siz belirlersiniz. Yorum sayfanız değişirse ya da bir dönem başka bir sayfaya yönlendirmek isterseniz standı yeniden bastırmazsınız.",
    ],
    icerik: ["1 adet 100 × 100 mm baskılı pleksi pano", "1 adet 100 × 35 mm pleksi taban"],
    stok: [{ kalem: "google", adet: 1 }],
    video: VIDEO.restoranGoogle,
    gorseller: [GORSEL.googleUc, GORSEL.googleYakin, GORSEL.googleOn, GORSEL.googleParcalar],
  },
  {
    slug: "instagram-takip-standi",
    ad: "Instagram takip standı",
    kisaAd: "Instagram",
    fiyat: 54900,
    ozet: "Masada bekleyen müşteriniz tek dokunuşla Instagram profilinize gelir.",
    aciklama: [
      "Müşteriniz telefonunu standa yaklaştırır, Instagram profiliniz açılır; takip etmesi için tek dokunuş kalır. QR da aynı profile gider.",
      "Profil adınız değişirse ya da bir kampanya sayfasını öne çıkarmak isterseniz bağlantıyı panelden güncellersiniz. Baskı aynı kalır.",
    ],
    icerik: ["1 adet 100 × 100 mm baskılı pleksi pano", "1 adet 100 × 35 mm pleksi taban"],
    stok: [{ kalem: "instagram", adet: 1 }],
    video: VIDEO.butikInstagram,
    gorseller: [GORSEL.instagramUc, GORSEL.instagramYakin, GORSEL.instagramOn, GORSEL.instagramSol],
  },
  {
    slug: "ikili-set",
    ad: "Google ve Instagram ikili set",
    kisaAd: "İkili set",
    fiyat: 94900,
    ozet: "Kasaya Google, masaya Instagram. İki stand, iki ayrı kart kodu.",
    aciklama: [
      "Setteki iki stand birbirinden bağımsız çalışır: her birinin kendi kart kodu ve kendi bağlantısı vardır. Birini kasaya, diğerini müşterinin beklediği masaya koyabilirsiniz.",
      "İki standı ayrı ayrı almaktan daha uygundur. İkisinin bağlantısını da aynı kurulum panelinden yönetirsiniz.",
    ],
    icerik: [
      "1 adet Google yorum panosu ve tabanı",
      "1 adet Instagram takip panosu ve tabanı",
    ],
    stok: [
      { kalem: "google", adet: 1 },
      { kalem: "instagram", adet: 1 },
    ],
    video: VIDEO.ikiliSet,
    gorseller: [GORSEL.ikili, GORSEL.kafeIkili, GORSEL.ikiliUst, GORSEL.googleYan],
  },
];

export function urunBul(slug: string): Urun | undefined {
  return URUNLER.find((u) => u.slug === slug);
}

// İki tekliyi ayrı almak ile set arasındaki fark (kuruş).
export function setAvantaji(): number {
  const google = urunBul("google-yorum-standi")!;
  const instagram = urunBul("instagram-takip-standi")!;
  const set = urunBul("ikili-set")!;
  return google.fiyat + instagram.fiyat - set.fiyat;
}

// Ürünün satılabilir adedi: stok kalemlerinden en kısıtlayıcı olan.
export function satilabilirAdet(urun: Urun, stok: Record<StokKalemi, number>): number {
  return Math.min(...urun.stok.map((s) => Math.floor(stok[s.kalem] / s.adet)));
}

export const TEKNIK_OZELLIKLER: { ad: string; deger: string }[] = [
  { ad: "Pano", deger: "100 × 100 mm, 3 mm parlak beyaz pleksi, üst köşeleri yuvarlatılmış" },
  { ad: "Taban", deger: "100 × 35 mm, 3 mm pleksi; pano tabandaki yuvaya oturur" },
  { ad: "Okuma", deger: "NFC (telefonu yaklaştırma) ve QR (kamerayla okutma)" },
  { ad: "Telefon uyumu", deger: "iPhone XS ve sonrası; NFC'si açık Android telefonlar. QR'ı her kameralı telefon okur." },
  { ad: "Uygulama", deger: "Gerekmez, ne sizin ne müşterinizin telefonunda" },
  { ad: "Yönlendirme", deger: "Dinamik: gideceği adresi kurulum panelinden değiştirirsiniz" },
  { ad: "Kart kodu", deger: "Her panonun alt kısmında altı haneli kendi kodu var" },
];
