"use server";

import { z } from "zod";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { mesajKaydet } from "@/sunucu/mesaj";

export type MesajDurumu = { tamam: boolean; hatalar: Partial<Record<"ad" | "iletisim" | "metin", string>>; genel?: string } | null;

const sema = z.object({
  ad: z.string().trim().min(2, "Adınızı yazın.").max(80),
  iletisim: z
    .string()
    .trim()
    .min(5, "Size dönebileceğimiz bir telefon ya da e-posta yazın.")
    .max(120)
    .refine(
      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.replace(/\D/g, "").length >= 10,
      "Geçerli bir telefon ya da e-posta yazın.",
    ),
  konu: z.enum(["soru", "toplu", "siparis", "diger"]),
  metin: z.string().trim().min(10, "Mesajınızı biraz daha açık yazın.").max(2000, "Mesaj en çok 2000 karakter olabilir."),
});

export async function mesajGonder(_onceki: MesajDurumu, form: FormData): Promise<MesajDurumu> {
  if (String(form.get("web_sitesi") ?? "") !== "") return { tamam: true, hatalar: {} };
  const ip = await istemciIp();
  if (hizSiniriAsildi(`mesaj:${ip ?? "bilinmiyor"}`, 5, 30 * 60_000)) {
    return { tamam: false, hatalar: {}, genel: "Kısa sürede çok mesaj gönderildi. Biraz sonra tekrar deneyin." };
  }
  const sonuc = sema.safeParse(Object.fromEntries(form));
  if (!sonuc.success) {
    const hatalar: NonNullable<MesajDurumu>["hatalar"] = {};
    for (const s of sonuc.error.issues) {
      const alan = s.path[0] as "ad" | "iletisim" | "metin";
      if (!hatalar[alan]) hatalar[alan] = s.message;
    }
    return { tamam: false, hatalar };
  }
  mesajKaydet({ ...sonuc.data, ip });
  return { tamam: true, hatalar: {} };
}
