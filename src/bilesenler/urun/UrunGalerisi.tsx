import Image from "next/image";
import { SahneVideosu } from "@/bilesenler/SahneVideosu";
import { YzNotu } from "@/bilesenler/YzNotu";
import type { Gorsel, Video } from "@/gorseller";

type Oge = { tur: "gorsel"; gorsel: Gorsel } | { tur: "video"; video: Video };

// Ürün galerisi. Masaüstünde öğeler alt alta (ilki geniş, diğerleri ikili), satın alma kutusu yanda sabit
// durur. Telefonda yatay kaydırmalı; kaçıncı öğede olunduğu köşede yazar. Video varsa ikinci sıradadır.
export function UrunGalerisi({ gorseller, video, urunAdi }: { gorseller: Gorsel[]; video?: Video; urunAdi: string }) {
  const [kapak, ...digerleri] = gorseller;
  const ogeler: Oge[] = [
    { tur: "gorsel", gorsel: kapak },
    ...(video ? [{ tur: "video" as const, video }] : []),
    ...digerleri.map((g) => ({ tur: "gorsel" as const, gorsel: g })),
  ];
  const yzVar = Boolean(video) || gorseller.some((g) => g.yz);

  return (
    <div>
      <ul
        className="-mx-[var(--kenar)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--kenar)] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0"
        aria-label={`${urunAdi} görselleri`}
      >
        {ogeler.map((o, i) => {
          const ilk = i === 0;
          const sayac = (
            <span className="etiket pointer-events-none absolute bottom-3 left-3 rounded-full bg-kagit-2/90 px-2 py-1 text-murekkep lg:hidden">
              {i + 1} / {ogeler.length}
            </span>
          );
          return (
            <li
              key={o.tur === "video" ? o.video.src : o.gorsel.src.src}
              className={`w-[86%] shrink-0 snap-center lg:w-auto ${ilk ? "lg:col-span-2" : ""}`}
            >
              {o.tur === "video" ? (
                <div className="relative">
                  <SahneVideosu {...o.video} className="aspect-[4/5] rounded-orta" />
                  {sayac}
                </div>
              ) : (
                <div
                  className={`relative overflow-hidden ${o.gorsel.zemin === "seffaf" ? "studyo-zemin" : "bg-kagit-3"} ${
                    ilk ? "stand-kosesi aspect-[4/5] lg:aspect-[5/4]" : "aspect-[4/5] rounded-orta"
                  }`}
                >
                  <Image
                    src={o.gorsel.src}
                    alt={o.gorsel.alt}
                    fill
                    placeholder="blur"
                    sizes={ilk ? "(min-width: 64rem) 46rem, 86vw" : "(min-width: 64rem) 23rem, 86vw"}
                    loading={ilk ? "eager" : "lazy"}
                    fetchPriority={ilk ? "high" : undefined}
                    className={o.gorsel.zemin === "seffaf" ? "object-contain" : "object-cover"}
                    style={{ objectPosition: o.gorsel.odak ?? "50% 50%" }}
                  />
                  {sayac}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {yzVar && <YzNotu className="mt-3" />}
    </div>
  );
}
