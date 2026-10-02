import type { MetadataRoute } from "next";

// Ortam değişkenleri çalışma anında okunsun.
export const dynamic = "force-dynamic";
import { SITE } from "@/magaza/ayarlar";

// Demo adresinde (ahmcloud.com alt alanı) arama motorlarına kapalı; ARAMA_MOTORU_ACIK=1 ile açılır.
export default function robots(): MetadataRoute.Robots {
  if (process.env.ARAMA_MOTORU_ACIK !== "1") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/yonetim", "/odeme", "/sepet", "/siparis/"] },
    sitemap: new URL("/sitemap.xml", SITE.adres).toString(),
  };
}
