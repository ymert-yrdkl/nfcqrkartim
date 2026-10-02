import "server-only";
import { headers } from "next/headers";

// İstemcinin IP'si: ters vekil (Coolify/Traefik) X-Forwarded-For ekler; son değer vekilin gördüğüdür.
export async function istemciIp(): Promise<string | null> {
  const h = await headers();
  const gercek = h.get("x-real-ip");
  if (gercek) return gercek.trim();
  const zincir = h.get("x-forwarded-for");
  if (!zincir) return null;
  const parcalar = zincir.split(",").map((p) => p.trim()).filter(Boolean);
  return parcalar.at(-1) ?? null;
}

// Basit hız sınırı (tek sunucu, bellekte). Anahtar başına pencere içinde en çok `sinir` deneme.
const kayitlar = new Map<string, number[]>();

export function hizSiniriAsildi(anahtar: string, sinir: number, pencereMs: number): boolean {
  const simdi = Date.now();
  const zamanlar = (kayitlar.get(anahtar) ?? []).filter((z) => simdi - z < pencereMs);
  if (zamanlar.length >= sinir) {
    kayitlar.set(anahtar, zamanlar);
    return true;
  }
  zamanlar.push(simdi);
  kayitlar.set(anahtar, zamanlar);
  if (kayitlar.size > 5000) {
    for (const [k, v] of kayitlar) if (v.every((z) => simdi - z >= pencereMs)) kayitlar.delete(k);
  }
  return false;
}
