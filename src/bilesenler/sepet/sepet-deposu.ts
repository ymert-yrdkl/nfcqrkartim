// Sepet tarayıcının yerel deposunda (localStorage) tutulur. Sunucuya yalnız siparişte gider;
// fiyatı sunucu katalogdan yeniden hesaplar. React tarafı useSyncExternalStore ile okur (useSepet).

import { useSyncExternalStore } from "react";
import { TICARI } from "@/magaza/ayarlar";
import { URUNLER, urunBul, type UrunSlug } from "@/magaza/urunler";

export type SepetSatiri = { slug: UrunSlug; adet: number };

const ANAHTAR = "nfcqrkartim-sepet-v1";
const BOS: SepetSatiri[] = [];
const dinleyiciler = new Set<() => void>();
let satirlar: SepetSatiri[] = BOS;
let okundu = false;

function gecerliAdet(adet: unknown): number {
  const sayi = Math.floor(Number(adet));
  if (!Number.isFinite(sayi)) return 0;
  return Math.max(0, Math.min(TICARI.satirBasinaEnCok, sayi));
}

function depodanOku(): SepetSatiri[] {
  try {
    const ham = JSON.parse(window.localStorage.getItem(ANAHTAR) ?? "[]");
    if (!Array.isArray(ham)) return BOS;
    const temiz: SepetSatiri[] = [];
    for (const s of ham) {
      const urun = urunBul(String(s?.slug));
      const adet = gecerliAdet(s?.adet);
      if (urun && adet > 0 && !temiz.some((t) => t.slug === urun.slug)) temiz.push({ slug: urun.slug, adet });
    }
    return temiz;
  } catch {
    return BOS;
  }
}

function yay() {
  for (const fn of dinleyiciler) fn();
}

function yaz(yeni: SepetSatiri[]) {
  // Katalog sırasını koru; böylece sepet her yerde aynı sırada görünür.
  satirlar = URUNLER.flatMap((u) => yeni.filter((s) => s.slug === u.slug && s.adet > 0));
  try {
    window.localStorage.setItem(ANAHTAR, JSON.stringify(satirlar));
  } catch {
    // Gizli sekme ya da dolu depo: sepet bu sayfa açıkken yine çalışır.
  }
  yay();
}

function anlikGoruntu(): SepetSatiri[] {
  if (!okundu) {
    satirlar = depodanOku();
    okundu = true;
  }
  return satirlar;
}

function abone(fn: () => void) {
  dinleyiciler.add(fn);
  const baskaSekme = (e: StorageEvent) => {
    if (e.key === ANAHTAR) {
      satirlar = depodanOku();
      yay();
    }
  };
  window.addEventListener("storage", baskaSekme);
  return () => {
    dinleyiciler.delete(fn);
    window.removeEventListener("storage", baskaSekme);
  };
}

export function useSepet(): SepetSatiri[] {
  return useSyncExternalStore(abone, anlikGoruntu, () => BOS);
}

export function sepeteEkle(slug: UrunSlug, adet = 1) {
  const mevcut = anlikGoruntu();
  const satir = mevcut.find((s) => s.slug === slug);
  const yeniAdet = gecerliAdet((satir?.adet ?? 0) + adet);
  yaz([...mevcut.filter((s) => s.slug !== slug), { slug, adet: yeniAdet }]);
}

export function adediDegistir(slug: UrunSlug, adet: number) {
  const mevcut = anlikGoruntu();
  yaz(mevcut.map((s) => (s.slug === slug ? { slug, adet: gecerliAdet(adet) } : s)));
}

export function sepettenCikar(slug: UrunSlug) {
  yaz(anlikGoruntu().filter((s) => s.slug !== slug));
}

export function sepetiBosalt() {
  yaz([]);
}

// Sepette hem tekli Google hem tekli Instagram varsa, eşleşen çiftleri ikili sete çevirir.
export function setlereCevir() {
  const mevcut = anlikGoruntu();
  const g = mevcut.find((s) => s.slug === "google-yorum-standi")?.adet ?? 0;
  const i = mevcut.find((s) => s.slug === "instagram-takip-standi")?.adet ?? 0;
  const cift = Math.min(g, i);
  if (cift === 0) return;
  const set = mevcut.find((s) => s.slug === "ikili-set")?.adet ?? 0;
  const setAdet = Math.min(TICARI.satirBasinaEnCok, set + cift);
  const cevrilen = setAdet - set;
  yaz([
    ...mevcut.filter((s) => !["google-yorum-standi", "instagram-takip-standi", "ikili-set"].includes(s.slug)),
    { slug: "google-yorum-standi", adet: g - cevrilen },
    { slug: "instagram-takip-standi", adet: i - cevrilen },
    { slug: "ikili-set", adet: setAdet },
  ]);
}

export function sepetToplami(liste: SepetSatiri[]) {
  let araToplam = 0;
  let adet = 0;
  for (const s of liste) {
    const urun = urunBul(s.slug);
    if (!urun) continue;
    araToplam += urun.fiyat * s.adet;
    adet += s.adet;
  }
  const kargo = adet > 0 ? TICARI.kargoUcreti : 0;
  return { araToplam, kargo, toplam: araToplam + kargo, adet };
}

// Sepet çekmecesini sayfanın herhangi bir yerinden açmak için.
export const SEPET_AC_OLAYI = "nfcqrkartim:sepet-ac";
export function sepetCekmecesiniAc() {
  window.dispatchEvent(new Event(SEPET_AC_OLAYI));
}
