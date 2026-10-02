import Image from "next/image";
import { YzNotu } from "@/bilesenler/YzNotu";
import type { Gorsel } from "@/gorseller";

// Ürün galerisi. Masaüstünde görseller alt alta (ilki geniş, diğerleri ikili), satın alma kutusu yanda
// sabit durur. Telefonda yatay kaydırmalı; kaçıncı görselde olunduğu altta yazar.
export function UrunGalerisi({ gorseller, urunAdi }: { gorseller: Gorsel[]; urunAdi: string }) {
  const yzVar = gorseller.some((g) => g.yz);
  return (
    <div>
      <ul
        className="-mx-[var(--kenar)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--kenar)] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:overflow-visible lg:px-0"
        aria-label={`${urunAdi} görselleri`}
      >
        {gorseller.map((g, i) => (
          <li
            key={g.src.src}
            className={`w-[86%] shrink-0 snap-center lg:w-auto ${i === 0 ? "lg:col-span-2" : ""}`}
          >
            <div
              className={`relative overflow-hidden ${g.zemin === "seffaf" ? "studyo-zemin" : "bg-kagit-3"} ${i === 0 ? "stand-kosesi aspect-[4/5] lg:aspect-[5/4]" : "rounded-orta aspect-[4/5]"}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                placeholder="blur"
                sizes={i === 0 ? "(min-width: 64rem) 46rem, 86vw" : "(min-width: 64rem) 23rem, 86vw"}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : undefined}
                className={g.zemin === "seffaf" ? "object-contain" : "object-cover"}
                style={{
                  objectPosition: g.odak ?? "50% 50%",
                  transform: g.olcek ? `scale(${g.olcek})` : undefined,
                  transformOrigin: g.odak ?? "50% 50%",
                }}
              />
              <span className="etiket absolute bottom-3 left-3 rounded-full bg-kagit-2/90 px-2 py-1 text-murekkep lg:hidden">
                {i + 1} / {gorseller.length}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {yzVar && <YzNotu className="mt-3" />}
    </div>
  );
}
