import Image from "next/image";
import { notFound } from "next/navigation";
import { LogoIsaret } from "@/bilesenler/Logo";
import { GORSEL } from "@/gorseller";
import { SITE } from "@/magaza/ayarlar";

// Yalnız geliştirmede açılır: paylaşım görseli (1200×630) ve uygulama ikonu bu sayfanın ekran görüntüsünden
// üretilir (scripts/paylasim-gorselleri.mjs). Canlıda 404.
export default async function OgKart({ searchParams }: PageProps<"/og-kart">) {
  if (process.env.NODE_ENV === "production") notFound();
  const { tur } = await searchParams;

  if (tur === "ikon") {
    return (
      <div className="flex size-[512px] items-center justify-center bg-murekkep text-kagit">
        <LogoIsaret className="size-[340px]" vurgu />
      </div>
    );
  }

  return (
    <div className="studyo-zemin relative flex h-[630px] w-[1200px] overflow-hidden">
      <div className="flex w-[560px] flex-col justify-between py-16 ps-16">
        <div className="flex items-center gap-3">
          <LogoIsaret className="size-11" vurgu />
          <span className="font-baslik text-[2rem] leading-none font-bold tracking-[-0.03em]">nfcqrkartim</span>
        </div>
        <div>
          <p className="font-baslik text-[4.1rem] leading-[1.02] font-semibold tracking-[-0.035em] [font-stretch:84%]">
            Telefonu <span className="fosfor">yaklaştırın</span>, gerisi kendiliğinden.
          </p>
          <p className="mt-6 max-w-[30ch] text-[1.45rem] leading-snug text-murekkep-2">{SITE.aciklama.split(".")[0]}.</p>
        </div>
        <p className="etiket text-[1rem] text-soluk">NFC + dinamik QR · Google ve Instagram standı</p>
      </div>
      <div className="relative flex-1">
        <Image src={GORSEL.ikili.src} alt="" fill sizes="700px" className="translate-x-[-2%] scale-[1.18] object-contain" priority />
      </div>
    </div>
  );
}
