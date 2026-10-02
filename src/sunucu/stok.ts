import "server-only";
import { connection } from "next/server";
import { URUNLER, satilabilirAdet, type StokKalemi, type UrunSlug } from "@/magaza/urunler";
import { simdi, vt } from "./db";

export type StokDurumu = Record<StokKalemi, number>;

// Her istekte güncel stok (sayfa önbelleğe alınmasın diye connection()).
export async function stokOku(): Promise<StokDurumu> {
  await connection();
  return stokOkuSenkron();
}

export function stokOkuSenkron(): StokDurumu {
  const satirlar = vt().prepare("SELECT kalem, adet FROM stok").all() as { kalem: StokKalemi; adet: number }[];
  const sonuc: StokDurumu = { google: 0, instagram: 0 };
  for (const s of satirlar) sonuc[s.kalem] = s.adet;
  return sonuc;
}

export async function satilabilirler(): Promise<Record<UrunSlug, number>> {
  const stok = await stokOku();
  return Object.fromEntries(URUNLER.map((u) => [u.slug, satilabilirAdet(u, stok)])) as Record<UrunSlug, number>;
}

// Yalnız bir transaction (islem) içinden çağrılır.
export function stoktanDus(kalem: StokKalemi, adet: number): boolean {
  const sonuc = vt()
    .prepare("UPDATE stok SET adet = adet - ?, guncelleme = ? WHERE kalem = ? AND adet >= ?")
    .run(adet, simdi(), kalem, adet);
  return sonuc.changes === 1;
}

export function stogaEkle(kalem: StokKalemi, adet: number) {
  vt().prepare("UPDATE stok SET adet = adet + ?, guncelleme = ? WHERE kalem = ?").run(adet, simdi(), kalem);
}

export function stokAyarla(kalem: StokKalemi, adet: number) {
  vt().prepare("UPDATE stok SET adet = ?, guncelleme = ? WHERE kalem = ?").run(adet, simdi(), kalem);
}
