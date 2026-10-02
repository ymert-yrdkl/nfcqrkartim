import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// iyzico Checkout Form (barındırılan ödeme sayfası) istemcisi. Kart bilgisi bize hiç gelmez:
// 1) başlat → iyzico bir token ve ödeme sayfası adresi verir, müşteri oraya gider,
// 2) müşteri ödeyince iyzico tarayıcıyı callbackUrl'e POST ile geri yollar (yalnız token),
// 3) sonucu token ile sunucudan sunucuya sorarız (sonucSorgula); karar YALNIZ bu yanıta göre verilir.
//
// Ortam: IYZICO_API_KEY, IYZICO_SECRET_KEY, IYZICO_ADRES
//   (deneme: https://sandbox-api.iyzipay.com · canlı: https://api.iyzipay.com)
// Belgeler: docs.iyzico.com › Checkout Form, HMACSHA256 Auth, Response Signature Validation, Webhook.

const BASLAT_YOLU = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const SONUC_YOLU = "/payment/iyzipos/checkoutform/auth/ecom/detail";

function ayarlar() {
  const apiKey = process.env.IYZICO_API_KEY ?? "";
  const gizli = process.env.IYZICO_SECRET_KEY ?? "";
  const adres = (process.env.IYZICO_ADRES ?? "").replace(/\/$/, "");
  return { apiKey, gizli, adres };
}

// Kartla ödeme yalnız üç değişken de tanımlıysa açılır.
export function iyzicoAcikMi(): boolean {
  const { apiKey, gizli, adres } = ayarlar();
  return Boolean(apiKey && gizli && /^https?:\/\//.test(adres));
}

export function denemeOrtamiMi(): boolean {
  return ayarlar().adres.includes("sandbox");
}

// iyzico fiyat biçimi: "549.0", "1098.5" (en az bir ondalık).
export function fiyatMetni(kurus: number): string {
  const metin = (kurus / 100).toString();
  return metin.includes(".") ? metin : `${metin}.0`;
}

const hmacHex = (anahtar: string, veri: string) => createHmac("sha256", anahtar).update(veri).digest("hex");

function esitMi(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// IYZWSv2 kimlik doğrulaması: imza = HMAC-SHA256(gizli, rastgele + yol + gövde), hex.
async function istek<T>(yol: string, govde: Record<string, unknown>): Promise<T> {
  const { apiKey, gizli, adres } = ayarlar();
  const rastgele = `${Date.now()}${randomBytes(6).toString("hex")}`;
  const json = JSON.stringify(govde);
  const imza = hmacHex(gizli, rastgele + yol + json);
  const yetki = Buffer.from(`apiKey:${apiKey}&randomKey:${rastgele}&signature:${imza}`).toString("base64");
  const yanit = await fetch(adres + yol, {
    method: "POST",
    headers: {
      Authorization: `IYZWSv2 ${yetki}`,
      "x-iyzi-rnd": rastgele,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: json,
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  if (!yanit.ok) throw new Error(`iyzico HTTP ${yanit.status}`);
  return (await yanit.json()) as T;
}

// --- Ödeme formunu başlat ---------------------------------------------------------------------

export type OdemeGirdisi = {
  siparisNo: string;
  toplam: number; // kuruş
  kalemler: { kimlik: string; ad: string; kategori: string; tutar: number }[]; // tutarların toplamı = toplam
  alici: {
    ad: string;
    telefon: string; // "0532 111 22 33"
    eposta: string;
    il: string;
    ilce: string;
    adres: string;
    postaKodu: string | null;
    kimlikNo: string | null; // 11 hane; yoksa iyzico'nun kabul ettiği genel değer kullanılır
    ip: string | null;
  };
  fatura: { ad: string; il: string; adres: string; postaKodu: string | null };
  donusAdresi: string; // callbackUrl
};

type BaslatYaniti = {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  tokenExpireTime?: number;
  conversationId?: string;
  signature?: string;
};

function adSoyad(tam: string) {
  const parcalar = tam.trim().split(/\s+/);
  const soyad = parcalar.length > 1 ? parcalar.pop()! : parcalar[0];
  return { ad: parcalar.join(" ") || soyad, soyad };
}

export async function odemeFormuBaslat(g: OdemeGirdisi): Promise<{ token: string; sayfa: string }> {
  const { gizli } = ayarlar();
  const kisi = adSoyad(g.alici.ad);
  const telefon = `+90${g.alici.telefon.replace(/\D/g, "").replace(/^0/, "")}`;
  const teslimat = {
    contactName: g.alici.ad,
    city: g.alici.il,
    country: "Turkey",
    address: `${g.alici.adres}, ${g.alici.ilce}`,
    ...(g.alici.postaKodu ? { zipCode: g.alici.postaKodu } : {}),
  };
  const govde = {
    locale: "tr",
    conversationId: g.siparisNo,
    price: fiyatMetni(g.toplam),
    paidPrice: fiyatMetni(g.toplam),
    currency: "TRY",
    basketId: g.siparisNo,
    paymentGroup: "PRODUCT",
    callbackUrl: g.donusAdresi,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: g.siparisNo,
      name: kisi.ad,
      surname: kisi.soyad,
      gsmNumber: telefon,
      email: g.alici.eposta,
      // iyzico kimlik numarası ister; müşteriden TC kimlik almıyoruz (KVKK), yerine genel değer gider.
      identityNumber: g.alici.kimlikNo ?? "11111111111",
      registrationAddress: teslimat.address,
      ip: g.alici.ip ?? "85.34.78.112",
      city: g.alici.il,
      country: "Turkey",
      ...(g.alici.postaKodu ? { zipCode: g.alici.postaKodu } : {}),
    },
    shippingAddress: teslimat,
    billingAddress: {
      contactName: g.fatura.ad,
      city: g.fatura.il,
      country: "Turkey",
      address: g.fatura.adres,
      ...(g.fatura.postaKodu ? { zipCode: g.fatura.postaKodu } : {}),
    },
    basketItems: g.kalemler.map((k) => ({
      id: k.kimlik,
      name: k.ad,
      category1: k.kategori,
      itemType: "PHYSICAL",
      price: fiyatMetni(k.tutar),
    })),
  };

  const y = await istek<BaslatYaniti>(BASLAT_YOLU, govde);
  if (y.status !== "success" || !y.token || !y.paymentPageUrl) {
    throw new Error(`iyzico başlatılamadı: ${y.errorCode ?? "?"} ${y.errorMessage ?? ""}`.trim());
  }
  // Yanıt imzası: HMAC(conversationId:token). Yanıt zaten TLS ile doğrudan iyzico'dan geliyor; imza
  // ek bir denetim, uymazsa kayda yazılır (biçim farkı yüzünden ödemeyi durdurmayalım).
  if (y.signature && !esitMi(hmacHex(gizli, [y.conversationId, y.token].join(":")), y.signature)) {
    console.warn("iyzico: başlatma yanıtının imzası beklenenle uyuşmadı", g.siparisNo);
  }
  return { token: y.token, sayfa: y.paymentPageUrl };
}

// --- Sonucu sorgula ----------------------------------------------------------------------------

type SonucYaniti = {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  paymentStatus?: string; // SUCCESS | FAILURE | INIT_THREEDS | CALLBACK_THREEDS ...
  fraudStatus?: number; // 1 onaylı, 0 incelemede, -1 reddedildi
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  conversationId?: string;
  token?: string;
  installment?: number;
  lastFourDigits?: string;
  signature?: string;
};

export type OdemeSonucu =
  | { durum: "odendi"; siparisNo: string; odemeKimlik: string; tutar: number; taksit: number; kartSon4: string | null }
  | { durum: "incelemede"; siparisNo: string; odemeKimlik: string }
  | { durum: "beklemede"; siparisNo: string | null }
  | { durum: "basarisiz"; siparisNo: string | null; neden: string };

// Fiyatlar imzada sondaki sıfırlar atılmış hâliyle yer alır ("10.50" → "10.5", "949.0" → "949").
const imzaFiyati = (deger: number | undefined) => (deger === undefined ? "" : String(Number(deger)));

export async function sonucSorgula(token: string): Promise<OdemeSonucu> {
  const { gizli } = ayarlar();
  const y = await istek<SonucYaniti>(SONUC_YOLU, { locale: "tr", token });
  const siparisNo = y.basketId ?? y.conversationId ?? null;

  if (y.signature) {
    const beklenen = hmacHex(
      gizli,
      [y.paymentStatus, y.paymentId, y.currency, y.basketId, y.conversationId, imzaFiyati(y.paidPrice), imzaFiyati(y.price), y.token].join(":"),
    );
    if (!esitMi(beklenen, y.signature)) console.warn("iyzico: sonuç yanıtının imzası beklenenle uyuşmadı", siparisNo);
  }
  // 3D Secure sürüyor gibi ara durumlar: henüz karar yok, siparişe dokunulmaz.
  if (y.status === "success" && y.paymentStatus && !["SUCCESS", "FAILURE"].includes(y.paymentStatus)) {
    return { durum: "beklemede", siparisNo };
  }
  if (y.status !== "success" || y.paymentStatus !== "SUCCESS" || !y.paymentId || !siparisNo) {
    return { durum: "basarisiz", siparisNo, neden: y.errorMessage || "Ödeme tamamlanmadı." };
  }
  if (y.fraudStatus === -1) return { durum: "basarisiz", siparisNo, neden: "Ödeme iyzico tarafından reddedildi." };
  if (y.fraudStatus === 0) return { durum: "incelemede", siparisNo, odemeKimlik: y.paymentId };
  return {
    durum: "odendi",
    siparisNo,
    odemeKimlik: y.paymentId,
    tutar: Math.round(Number(y.price) * 100),
    taksit: y.installment ?? 1,
    kartSon4: y.lastFourDigits ?? null,
  };
}

// --- Webhook -----------------------------------------------------------------------------------
// İmza (X-IYZ-SIGNATURE-V3): HMAC-SHA256(gizli, gizli + iyziEventType + iyziPaymentId + token +
// paymentConversationId + status), hex. Bildirim yalnız "şu token'ı yeniden sorgula" anlamında kullanılır.
export function bildirimImzasiDogruMu(
  govde: { iyziEventType?: string; iyziPaymentId?: string | number; token?: string; paymentConversationId?: string; status?: string },
  baslik: string | null,
): boolean {
  const { gizli } = ayarlar();
  if (!baslik) return false;
  const veri = `${gizli}${govde.iyziEventType ?? ""}${govde.iyziPaymentId ?? ""}${govde.token ?? ""}${govde.paymentConversationId ?? ""}${govde.status ?? ""}`;
  return esitMi(hmacHex(gizli, veri), baslik);
}
