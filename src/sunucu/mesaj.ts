import "server-only";
import { simdi, vt } from "./db";

export const KONULAR = {
  soru: "Ürünle ilgili soru",
  toplu: "Toplu / çok şubeli alım",
  siparis: "Verdiğim sipariş",
  diger: "Diğer",
} as const;
export type Konu = keyof typeof KONULAR;

export type Mesaj = {
  id: number;
  ad: string;
  iletisim: string;
  konu: Konu;
  metin: string;
  okundu: number;
  olusturma: string;
};

export function mesajKaydet(m: { ad: string; iletisim: string; konu: Konu; metin: string; ip: string | null }) {
  vt()
    .prepare("INSERT INTO mesaj (ad, iletisim, konu, metin, ip, olusturma) VALUES (?, ?, ?, ?, ?, ?)")
    .run(m.ad, m.iletisim, m.konu, m.metin, m.ip, simdi());
}

export function mesajlariListele(): Mesaj[] {
  return vt()
    .prepare("SELECT id, ad, iletisim, konu, metin, okundu, olusturma FROM mesaj ORDER BY olusturma DESC LIMIT 300")
    .all() as Mesaj[];
}

export function okunmamisMesajSayisi(): number {
  return (vt().prepare("SELECT COUNT(*) AS sayi FROM mesaj WHERE okundu = 0").get() as { sayi: number }).sayi;
}

export function mesajOkundu(id: number) {
  vt().prepare("UPDATE mesaj SET okundu = 1 WHERE id = ?").run(id);
}
