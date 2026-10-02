import type { Metadata } from "next";
import { EnvelopeSimple, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { ILETISIM } from "@/magaza/ayarlar";
import { MesajFormu } from "./MesajFormu";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Ürün, toplu alım ya da siparişinizle ilgili bize yazın.",
  alternates: { canonical: "/iletisim" },
};

export default function Iletisim() {
  const kanallar = [
    ILETISIM.whatsapp && {
      ikon: WhatsappLogo,
      ad: "WhatsApp",
      deger: "Mesaj gönderin",
      href: `https://wa.me/${ILETISIM.whatsapp}`,
    },
    ILETISIM.telefon && {
      ikon: Phone,
      ad: "Telefon",
      deger: ILETISIM.telefon,
      href: `tel:${ILETISIM.telefon.replace(/\s/g, "")}`,
    },
    ILETISIM.eposta && { ikon: EnvelopeSimple, ad: "E-posta", deger: ILETISIM.eposta, href: `mailto:${ILETISIM.eposta}` },
  ].filter(Boolean) as { ikon: typeof Phone; ad: string; deger: string; href: string }[];

  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h1 className="text-bolum">İletişim</h1>
          <p className="mt-4 max-w-[45ch] text-lg text-murekkep-2">
            Ürünle ilgili sorunuz, birden fazla şube için toplu alım ya da verdiğiniz siparişle ilgili bir konu
            varsa yazın. {ILETISIM.calismaSaatleri} arası dönüş yaparız.
          </p>
          {kanallar.length > 0 && (
            <ul className="mt-8 divide-y divide-cizgi border-y border-cizgi">
              {kanallar.map((k) => (
                <li key={k.ad}>
                  <a href={k.href} className="flex min-h-16 items-center gap-4 py-3 hover:underline">
                    <k.ikon size={22} aria-hidden="true" />
                    <span>
                      <span className="block text-sm text-soluk">{k.ad}</span>
                      <span className="font-medium">{k.deger}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 text-sm text-soluk">
            Siparişinizin durumunu Sipariş sorgula sayfasından kendiniz de görebilirsiniz.
          </p>
        </div>
        <div className="lg:col-span-7">
          <MesajFormu />
        </div>
      </div>
    </div>
  );
}
