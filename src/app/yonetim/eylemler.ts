"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { DURUMLAR } from "@/magaza/siparis-durumu";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { mesajOkundu } from "@/sunucu/mesaj";
import { durumDegistir } from "@/sunucu/siparis";
import { stokAyarla } from "@/sunucu/stok";
import { oturumAc, oturumKapat, sifreDogruMu, yonetimGerekli } from "@/sunucu/yonetim-oturum";

export type GirisDurumu = { hata: string } | null;

export async function girisYap(_onceki: GirisDurumu, form: FormData): Promise<GirisDurumu> {
  const ip = await istemciIp();
  if (hizSiniriAsildi(`yonetim-giris:${ip ?? "bilinmiyor"}`, 8, 15 * 60_000)) {
    return { hata: "Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin." };
  }
  if (!sifreDogruMu(String(form.get("sifre") ?? ""))) return { hata: "Şifre yanlış." };
  await oturumAc();
  redirect("/yonetim");
}

export async function cikisYap() {
  await oturumKapat();
  redirect("/yonetim/giris");
}

export type DurumSonucu = { hata: string | null } | null;

const durumSemasi = z.object({
  no: z.string().regex(/^NQ-\d{6}$/),
  durum: z.enum(DURUMLAR),
  aciklama: z.string().trim().max(500).optional(),
  kargoFirmasi: z.string().trim().max(60).optional(),
  kargoTakip: z.string().trim().max(60).optional(),
});

export async function durumGuncelle(_onceki: DurumSonucu, form: FormData): Promise<DurumSonucu> {
  await yonetimGerekli();
  const sonuc = durumSemasi.safeParse(Object.fromEntries(form));
  if (!sonuc.success) return { hata: "Form okunamadı." };
  const v = sonuc.data;
  if (v.durum === "kargoda" && !v.kargoTakip) return { hata: "Kargoya verirken takip numarasını yazın." };
  try {
    durumDegistir(v.no, v.durum, {
      aciklama: v.aciklama || null,
      kargoFirmasi: v.kargoFirmasi || null,
      kargoTakip: v.kargoTakip || null,
    });
  } catch (hata) {
    return { hata: hata instanceof Error ? hata.message : "Durum değiştirilemedi." };
  }
  revalidatePath("/yonetim", "layout");
  return { hata: null };
}

export type StokSonucu = { hata: string | null; tamam: boolean } | null;

export async function stokKaydet(_onceki: StokSonucu, form: FormData): Promise<StokSonucu> {
  await yonetimGerekli();
  const degisen: string[] = [];
  const cakisan: string[] = [];
  for (const kalem of ["google", "instagram"] as const) {
    const ham = String(form.get(kalem) ?? "").trim();
    const eski = Number(form.get(`${kalem}_eski`));
    if (ham === "") continue; // boş alan stoğu sıfırlamaz
    const adet = Number(ham);
    if (!Number.isInteger(adet) || adet < 0 || adet > 100000) {
      return { hata: "Stok 0 ile 100000 arasında bir tam sayı olmalı.", tamam: false };
    }
    if (adet === eski) continue;
    if (stokAyarla(kalem, adet, eski)) degisen.push(kalem);
    else cakisan.push(kalem === "google" ? "Google" : "Instagram");
  }
  revalidatePath("/", "layout");
  if (cakisan.length > 0) {
    return {
      hata: `${cakisan.join(" ve ")} stoğu siz sayfayı açtıktan sonra değişti (ör. yeni sipariş). Güncel değeri kontrol edip tekrar kaydedin.`,
      tamam: false,
    };
  }
  return { hata: null, tamam: degisen.length > 0 };
}

export async function mesajiOkunduYap(form: FormData) {
  await yonetimGerekli();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) mesajOkundu(id);
  revalidatePath("/yonetim", "layout");
}
