import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { gizliAnahtar } from "./db";

// Yönetim paneli tek şifreyle korunur (YONETICI_SIFRE). Oturum, imzalı ve süreli bir çerezdir.
// Her yönetim sayfası ve eylemi ilk satırda yonetimGerekli() çağırır.

const CEREZ = "yonetim";
const SURE_SN = 12 * 60 * 60;

const ozet = (s: string) => createHash("sha256").update(s).digest();
const imzala = (veri: string) => createHmac("sha256", gizliAnahtar()).update(`yonetim:${veri}`).digest("base64url");

export function yonetimAcikMi(): boolean {
  return (process.env.YONETICI_SIFRE ?? "").length >= 8;
}

export function sifreDogruMu(sifre: string): boolean {
  const beklenen = process.env.YONETICI_SIFRE ?? "";
  if (beklenen.length < 8) return false;
  return timingSafeEqual(ozet(sifre), ozet(beklenen));
}

export async function oturumAc() {
  const bitis = Math.floor(Date.now() / 1000) + SURE_SN;
  (await cookies()).set(CEREZ, `${bitis}.${imzala(String(bitis))}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SURE_SN,
    path: "/",
  });
}

export async function oturumKapat() {
  (await cookies()).delete(CEREZ);
}

export async function yoneticiMi(): Promise<boolean> {
  const deger = (await cookies()).get(CEREZ)?.value;
  if (!deger) return false;
  const [bitis, imza] = deger.split(".");
  if (!bitis || !imza || Number(bitis) < Date.now() / 1000) return false;
  const a = Buffer.from(imza);
  const b = Buffer.from(imzala(bitis));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function yonetimGerekli() {
  if (!(await yoneticiMi())) redirect("/yonetim/giris");
}
