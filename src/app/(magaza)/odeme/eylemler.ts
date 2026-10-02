"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TICARI } from "@/magaza/ayarlar";
import { ILLER } from "@/magaza/iller";
import { URUNLER, urunBul, type UrunSlug } from "@/magaza/urunler";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { StokYetersiz, erisimCerezi, siparisOlustur, suresiGecenleriIptalEt } from "@/sunucu/siparis";

export type OdemeAlani =
  | "ad"
  | "telefon"
  | "eposta"
  | "il"
  | "ilce"
  | "adres"
  | "postaKodu"
  | "firmaUnvani"
  | "vergiDairesi"
  | "vergiNo"
  | "faturaAdresi"
  | "siparisNotu"
  | "sozlesme";

export type OdemeDurumu = {
  hatalar: Partial<Record<OdemeAlani, string>>;
  genelHata: string | null;
} | null;

// Boş ya da formda hiç olmayan (gizli) isteğe bağlı alanlar null olur.
const bosuNulla = (v: unknown) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v);
const metin = (min: number, max: number, mesaj: string) =>
  z
    .string(mesaj)
    .trim()
    .min(min, mesaj)
    .max(max, `En çok ${max} karakter yazabilirsiniz.`);

// Telefon: 0532 123 45 67, +90 532..., 5321234567 hepsi kabul; 10 haneye indirilir.
const telefon = z
  .string("Telefon numaranızı yazın.")
  .transform((v) => v.replace(/\D/g, "").replace(/^90(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, ""))
  .refine((v) => /^[2-5]\d{9}$/.test(v), "Telefonu 0 ile başlayan 11 hane olarak yazın, ör. 0532 123 45 67.")
  .transform((v) => `0${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 8)} ${v.slice(8)}`);

const sema = z
  .object({
    ad: metin(3, 80, "Adınızı ve soyadınızı yazın.").refine((v) => /\S\s+\S/.test(v), "Adınızı ve soyadınızı birlikte yazın."),
    telefon,
    eposta: z.email("Geçerli bir e-posta adresi yazın, ör. ad@ornek.com.").max(120),
    il: z.enum(ILLER, "Listeden bir il seçin."),
    ilce: metin(2, 60, "İlçeyi yazın."),
    adres: metin(10, 300, "Mahalle, sokak, bina ve daire numarasıyla açık adresi yazın."),
    postaKodu: z.preprocess(bosuNulla, z.string().regex(/^\d{5}$/, "Posta kodu 5 rakamdır.").nullable()),
    faturaTuru: z.enum(["bireysel", "kurumsal"]),
    firmaUnvani: z.preprocess(bosuNulla, z.string().trim().max(150, "Firma unvanı en çok 150 karakter olabilir.").nullable()),
    vergiDairesi: z.preprocess(bosuNulla, z.string().trim().max(80, "Vergi dairesi en çok 80 karakter olabilir.").nullable()),
    vergiNo: z.preprocess(bosuNulla, z.string().trim().nullable()),
    faturaAyni: z.preprocess((v) => v === "on", z.boolean()),
    faturaAdresi: z.preprocess(bosuNulla, z.string().trim().max(300, "Fatura adresi en çok 300 karakter olabilir.").nullable()),
    siparisNotu: z.preprocess(bosuNulla, z.string().trim().max(500, "Not en çok 500 karakter olabilir.").nullable()),
    sozlesme: z.literal("on", "Siparişi tamamlamak için ön bilgilendirme formunu ve mesafeli satış sözleşmesini onaylayın."),
  })
  .superRefine((v, ctx) => {
    if (v.faturaTuru === "kurumsal") {
      if (!v.firmaUnvani || v.firmaUnvani.length < 2)
        ctx.addIssue({ code: "custom", path: ["firmaUnvani"], message: "Fatura için firma unvanını yazın." });
      if (!v.vergiDairesi || v.vergiDairesi.length < 2)
        ctx.addIssue({ code: "custom", path: ["vergiDairesi"], message: "Vergi dairesini yazın." });
      if (!v.vergiNo || !/^\d{10,11}$/.test(v.vergiNo))
        ctx.addIssue({ code: "custom", path: ["vergiNo"], message: "Vergi numarası 10, şahıs şirketinde TC kimlik no 11 hanedir." });
    }
    if (!v.faturaAyni && (!v.faturaAdresi || v.faturaAdresi.length < 10))
      ctx.addIssue({ code: "custom", path: ["faturaAdresi"], message: "Fatura adresini yazın ya da teslimat adresiyle aynı olsun." });
  });

const sepetSemasi = z
  .array(
    z.object({
      slug: z.enum(URUNLER.map((u) => u.slug) as [UrunSlug, ...UrunSlug[]]),
      adet: z.number().int().min(1).max(TICARI.satirBasinaEnCok),
    }),
  )
  .min(1)
  .max(URUNLER.length)
  .refine((s) => new Set(s.map((x) => x.slug)).size === s.length);

export async function siparisVer(_onceki: OdemeDurumu, form: FormData): Promise<OdemeDurumu> {
  // Bot tuzağı: insanlar bu gizli alanı görmez, doldurmaz.
  if (String(form.get("web_sitesi") ?? "") !== "") {
    return { hatalar: {}, genelHata: "Sipariş alınamadı. Sayfayı yenileyip tekrar deneyin." };
  }

  let sepet;
  try {
    sepet = sepetSemasi.parse(JSON.parse(String(form.get("sepet") ?? "[]")));
  } catch {
    return { hatalar: {}, genelHata: "Sepetiniz okunamadı. Sepeti açıp ürünleri kontrol edin." };
  }
  const panoSayisi = sepet.reduce(
    (t, s) => t + s.adet * (urunBul(s.slug)?.stok.reduce((a, k) => a + k.adet, 0) ?? 0),
    0,
  );
  if (panoSayisi > TICARI.siparisBasinaEnCokPano) {
    return {
      hatalar: {},
      genelHata: `Bir siparişte en çok ${TICARI.siparisBasinaEnCokPano} pano alınabiliyor (ikili set 2 pano sayılır). Daha fazlası için İletişim sayfasından bize yazın.`,
    };
  }

  const sonuc = sema.safeParse(Object.fromEntries(form));
  if (!sonuc.success) {
    const hatalar: Partial<Record<OdemeAlani, string>> = {};
    for (const sorun of sonuc.error.issues) {
      const alan = sorun.path[0] as OdemeAlani;
      if (alan && !hatalar[alan]) hatalar[alan] = sorun.message;
    }
    return { hatalar, genelHata: null };
  }
  const v = sonuc.data;

  // Hız sınırı yalnız geçerli sipariş denemelerini sayar (yanlış doldurulan form müşteriyi kilitlemesin).
  const ip = await istemciIp();
  if (hizSiniriAsildi(`siparis:${ip ?? "bilinmiyor"}`, 6, 15 * 60_000)) {
    return {
      hatalar: {},
      genelHata: "Kısa sürede çok sipariş verildi. 15 dakika sonra tekrar deneyin ya da bize yazın.",
    };
  }

  let siparis;
  try {
    suresiGecenleriIptalEt();
    siparis = siparisOlustur(
      {
        ad: v.ad,
        telefon: v.telefon,
        eposta: v.eposta.toLowerCase(),
        il: v.il,
        ilce: v.ilce,
        adres: v.adres,
        postaKodu: v.postaKodu,
        faturaTuru: v.faturaTuru,
        firmaUnvani: v.faturaTuru === "kurumsal" ? v.firmaUnvani : null,
        vergiDairesi: v.faturaTuru === "kurumsal" ? v.vergiDairesi : null,
        vergiNo: v.faturaTuru === "kurumsal" ? v.vergiNo : null,
        faturaAdresi: v.faturaAyni ? null : v.faturaAdresi,
        siparisNotu: v.siparisNotu,
      },
      sepet,
      ip,
    );
  } catch (hata) {
    if (hata instanceof StokYetersiz) {
      return {
        hatalar: {},
        genelHata: `${hata.urunler.join(", ")} için stok yetersiz. Sepetteki adedi azaltıp tekrar deneyin.`,
      };
    }
    console.error("Sipariş oluşturulamadı:", hata);
    return {
      hatalar: {},
      genelHata: "Siparişiniz kaydedilemedi. Bilgileriniz duruyor; birkaç saniye sonra tekrar deneyin.",
    };
  }

  // Müşteri bu tarayıcıda sipariş sayfasını bir gün boyunca anahtarsız da açabilsin.
  (await cookies()).set(`siparis_${siparis.no}`, erisimCerezi(siparis.no, "alici", 60 * 60 * 24), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  // redirect try bloğunun dışında: Next onu kontrol akışı hatasıyla yapar.
  redirect(`/siparis/${siparis.no}?t=${siparis.anahtar}&yeni=1`);
}
