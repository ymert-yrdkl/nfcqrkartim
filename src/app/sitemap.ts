import type { MetadataRoute } from "next";

// Ortam değişkenleri çalışma anında okunsun.
export const dynamic = "force-dynamic";
import { YASAL_BELGELER } from "@/icerik/yasal";
import { SITE } from "@/magaza/ayarlar";
import { URUNLER } from "@/magaza/urunler";

export default function sitemap(): MetadataRoute.Sitemap {
  const adres = (yol: string) => new URL(yol, SITE.adres).toString();
  return [
    { url: adres("/"), changeFrequency: "weekly", priority: 1 },
    { url: adres("/urunler"), changeFrequency: "weekly", priority: 0.9 },
    ...URUNLER.map((u) => ({ url: adres(`/urun/${u.slug}`), changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: adres("/nasil-calisir"), changeFrequency: "monthly", priority: 0.7 },
    { url: adres("/sss"), changeFrequency: "monthly", priority: 0.6 },
    { url: adres("/iletisim"), changeFrequency: "yearly", priority: 0.4 },
    ...YASAL_BELGELER.map((b) => ({ url: adres(`/yasal/${b.slug}`), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
