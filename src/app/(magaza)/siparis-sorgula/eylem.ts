"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { erisimImzasi, sorgula } from "@/sunucu/siparis";

export type SorguDurumu = { hata: string } | null;

export async function siparisSorgula(_onceki: SorguDurumu, form: FormData): Promise<SorguDurumu> {
  const ip = await istemciIp();
  if (hizSiniriAsildi(`sorgu:${ip ?? "bilinmiyor"}`, 10, 15 * 60_000)) {
    return { hata: "Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin." };
  }
  const ham = String(form.get("no") ?? "").trim().toUpperCase().replace(/\s/g, "");
  const no = /^\d{6}$/.test(ham) ? `NQ-${ham}` : ham.replace(/^NQ(?=\d)/, "NQ-");
  const son4 = String(form.get("telefon") ?? "").replace(/\D/g, "");

  if (!/^NQ-\d{6}$/.test(no)) return { hata: "Sipariş numarasını NQ-123456 biçiminde yazın." };
  if (!/^\d{4}$/.test(son4)) return { hata: "Telefon numaranızın son dört hanesini yazın." };

  const siparis = sorgula(no, son4);
  if (!siparis) {
    return { hata: "Bu numara ve telefonla eşleşen sipariş bulunamadı. Bilgileri kontrol edip tekrar deneyin." };
  }
  (await cookies()).set(`siparis_${no}`, erisimImzasi(no), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  redirect(`/siparis/${no}`);
}
