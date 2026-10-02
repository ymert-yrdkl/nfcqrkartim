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

export async function stokKaydet(form: FormData) {
  await yonetimGerekli();
  for (const kalem of ["google", "instagram"] as const) {
    const adet = Number(form.get(kalem));
    if (Number.isInteger(adet) && adet >= 0 && adet <= 100000) stokAyarla(kalem, adet);
  }
  revalidatePath("/yonetim", "layout");
  revalidatePath("/", "layout");
}

export async function mesajiOkunduYap(form: FormData) {
  await yonetimGerekli();
  const id = Number(form.get("id"));
  if (Number.isInteger(id)) mesajOkundu(id);
  revalidatePath("/yonetim", "layout");
}
