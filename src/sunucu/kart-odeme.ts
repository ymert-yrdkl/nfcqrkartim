import "server-only";
import { headers } from "next/headers";
import { SITE } from "@/magaza/ayarlar";
import { istemciIp } from "./istek";
import { odemeFormuBaslat, sonucSorgula } from "./iyzico";
import {
  kartOdemesiBasarisiz,
  kartOdemesiIncelemede,
  kartOdemesiniOnayla,
  odemeTokeniKaydet,
  tokenIleSiparisNo,
  type Siparis,
} from "./siparis";

// Kartla ödemenin iki ucu: iyzico ödeme sayfasını başlatmak ve dönen sonucu siparişe işlemek.

// iyzico'nun tarayıcıyı geri yollayacağı adres. Canlıda sabit site adresi (Host başlığına güvenilmez),
// geliştirmede isteğin geldiği adres.
async function donusAdresi(): Promise<string> {
  if (process.env.NODE_ENV === "production") return new URL("/api/odeme/iyzico", SITE.adres).toString();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const protokol = h.get("x-forwarded-proto") ?? "http";
  return `${protokol}://${host}/api/odeme/iyzico`;
}

// Sipariş için iyzico ödeme sayfasını açar, token'ı siparişe yazar, sayfa adresini döner.
export async function kartOdemesiBaslat(s: Siparis): Promise<string> {
  const kalemler = s.kalemler.map((k) => ({
    kimlik: k.urunSlug,
    ad: k.adet > 1 ? `${k.urunAdi} (${k.adet} adet)` : k.urunAdi,
    kategori: "NFC QR stand",
    tutar: k.tutar,
  }));
  if (s.kargo > 0) kalemler.push({ kimlik: "kargo", ad: "Kargo", kategori: "Kargo", tutar: s.kargo });

  const kimlikNo = s.vergiNo && /^\d{11}$/.test(s.vergiNo) ? s.vergiNo : null;
  const { token, sayfa } = await odemeFormuBaslat({
    siparisNo: s.no,
    toplam: s.toplam,
    kalemler,
    alici: {
      ad: s.ad,
      telefon: s.telefon,
      eposta: s.eposta,
      il: s.il,
      ilce: s.ilce,
      adres: s.adres,
      postaKodu: s.postaKodu,
      kimlikNo,
      ip: await istemciIp(),
    },
    fatura: {
      ad: s.faturaTuru === "kurumsal" && s.firmaUnvani ? s.firmaUnvani : s.ad,
      il: s.il,
      adres: s.faturaAdresi ?? `${s.adres}, ${s.ilce}`,
      postaKodu: s.postaKodu,
    },
    donusAdresi: await donusAdresi(),
  });
  odemeTokeniKaydet(s.no, token);
  return sayfa;
}

export type Sonuclandirma =
  | { durum: "odendi" | "incelemede"; no: string }
  | { durum: "basarisiz"; no: string | null; neden: string };

// iyzico'dan gelen token'ın sonucunu sunucudan sorgular ve siparişe işler. Aynı token birden çok kez
// gelebilir (tarayıcı dönüşü + webhook); işlem tekrar edilebilir (idempotent).
export async function kartOdemesiniSonuclandir(token: string): Promise<Sonuclandirma> {
  const no = tokenIleSiparisNo(token);
  if (!no) return { durum: "basarisiz", no: null, neden: "Bu ödemeye ait sipariş bulunamadı." };

  const sonuc = await sonucSorgula(token);
  if (sonuc.siparisNo && sonuc.siparisNo !== no) {
    console.error("iyzico: token başka bir siparişe ait görünüyor", { no, iyzico: sonuc.siparisNo });
    return { durum: "basarisiz", no, neden: "Ödeme siparişle eşleşmedi." };
  }

  if (sonuc.durum === "odendi") {
    const r = kartOdemesiniOnayla(no, sonuc);
    if (r === "onaylandi" || r === "zaten") return { durum: "odendi", no };
    if (r === "tutar-uyusmuyor") return { durum: "basarisiz", no, neden: "Ödenen tutar siparişle uyuşmuyor; size ulaşacağız." };
    return { durum: "basarisiz", no, neden: "Ödemeniz alındı ama sipariş açılamadı; iade için size ulaşacağız." };
  }
  if (sonuc.durum === "beklemede") {
    return { durum: "basarisiz", no, neden: "Ödeme henüz tamamlanmadı. Birkaç dakika sonra sipariş sayfanıza bakın." };
  }
  if (sonuc.durum === "incelemede") {
    kartOdemesiIncelemede(no, sonuc.odemeKimlik);
    return { durum: "incelemede", no };
  }
  kartOdemesiBasarisiz(no, sonuc.neden);
  return { durum: "basarisiz", no, neden: sonuc.neden };
}
