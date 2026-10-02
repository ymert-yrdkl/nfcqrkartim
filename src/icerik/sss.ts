import { KURULUM_PANELI, TICARI } from "@/magaza/ayarlar";

export type Soru = { soru: string; cevap: string[]; anaSayfada?: boolean; grup: "kullanim" | "siparis" };

export const SORULAR: Soru[] = [
  {
    grup: "kullanim",
    anaSayfada: true,
    soru: "Müşterimin telefonunda uygulama olması gerekir mi?",
    cevap: [
      "Hayır. Telefonu standa yaklaştırınca bağlantı bildirim olarak çıkar, dokununca açılır. QR'ı okutmak için telefonun kendi kamerası yeter.",
    ],
  },
  {
    grup: "kullanim",
    anaSayfada: true,
    soru: "Hangi telefonlar okur?",
    cevap: [
      "iPhone XS ve sonrası telefonu yaklaştırınca okur. Android telefonlarda NFC'nin açık olması gerekir; çoğunda zaten açıktır.",
      "NFC'si olmayan ya da kapalı olan telefonlar için standın sağ yarısında QR var. Her kameralı telefon onu okur.",
    ],
  },
  {
    grup: "kullanim",
    anaSayfada: true,
    soru: "Standın açtığı bağlantıyı sonradan değiştirebilir miyim?",
    cevap: [
      `Evet. QR ve NFC doğrudan sizin sayfanıza değil, standın kendi koduna gider. O kodun hangi sayfayı açacağını kurulum panelinden (${KURULUM_PANELI.replace("https://", "")}) siz seçersiniz. Değişiklik bir sonraki okutmada geçerli olur, standı yeniden bastırmanız gerekmez.`,
    ],
  },
  {
    grup: "kullanim",
    anaSayfada: true,
    soru: "Google yorum bağlantımı nereden bulurum?",
    cevap: [
      "Google İşletme Profilinizi açın ve \"Yorum isteyin\" (ya da \"Daha fazla yorum alın\") bölümündeki bağlantıyı kopyalayın. Bu bağlantı müşterinizi doğrudan yıldız verme penceresine götürür. Kurulumda bu bağlantıyı yapıştırmanız yeterli.",
    ],
  },
  {
    grup: "kullanim",
    soru: "Yorum istemek Google'ın kurallarına uygun mu?",
    cevap: [
      "Müşterinizden yorum istemek uygundur. Yorum karşılığında indirim, hediye ya da ödül vermek ise Google'ın kurallarına aykırıdır; bu tür yorumlar silinebilir. Stand yalnız yorum sayfasını açar, ödül vermez.",
    ],
  },
  {
    grup: "kullanim",
    soru: "Birden fazla standım olursa her biri ayrı mı çalışır?",
    cevap: [
      "Evet. Her standın kendi kart kodu vardır ve her kodu ayrı bir bağlantıya yönlendirebilirsiniz. Örneğin iki şubeniz varsa her şubenin standı kendi Google sayfasını açar.",
    ],
  },
  {
    grup: "kullanim",
    soru: "Aylık ücret var mı?",
    cevap: [TICARI.yonlendirmeUcreti],
  },
  {
    grup: "siparis",
    anaSayfada: true,
    soru: "Siparişim ne zaman kargoya verilir?",
    cevap: [
      `Havale ya da EFT'niz hesabımıza geçtikten sonra ${TICARI.kargoyaVerilis} içinde kargoya veririz. Kargo ${
        TICARI.kargoUcreti === 0 ? "ücretsizdir" : "ücreti sipariş özetinde yazar"
      }. Kargo takip numarası sipariş sayfanızda görünür.`,
    ],
  },
  {
    grup: "siparis",
    soru: "Nasıl ödeme yaparım?",
    cevap: [
      `Şimdilik havale ya da EFT ile. Siparişi tamamlayınca hesap bilgisi ve sipariş numaranız ekranda çıkar; açıklamaya sipariş numarasını yazmanız yeterli. Ödeme ${TICARI.odemeSuresiGun} gün içinde gelmezse sipariş iptal edilir ve stok serbest kalır.`,
    ],
  },
  {
    grup: "siparis",
    soru: "Şirketim adına fatura alabilir miyim?",
    cevap: [
      "Evet. Ödeme sayfasında fatura türünü \"Kurumsal\" seçip firma unvanını, vergi dairesini ve vergi numarasını yazın.",
    ],
  },
  {
    grup: "siparis",
    soru: "İade edebilir miyim?",
    cevap: [
      "Teslim aldığınız günden itibaren 14 gün içinde gerekçe göstermeden iade edebilirsiniz. Kurulumunu yaptığınız standın bağlantısı iade sırasında sıfırlanır. Adımlar \"İade ve cayma\" sayfasında.",
    ],
  },
  {
    grup: "siparis",
    soru: "Çok sayıda stand almak istiyorum.",
    cevap: [
      `Sepete bir üründen en çok ${TICARI.satirBasinaEnCok} adet eklenebiliyor. Zincir ya da çok şubeli işletmeler için İletişim sayfasından bize yazın; adet ve teslim planını birlikte çıkaralım.`,
    ],
  },
];
