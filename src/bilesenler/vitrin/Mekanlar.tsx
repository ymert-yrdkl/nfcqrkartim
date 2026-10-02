"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { YzNotu } from "@/bilesenler/YzNotu";
import { GORSEL, type Gorsel } from "@/gorseller";

const MEKANLAR: { yer: string; an: string; gorsel: Gorsel }[] = [
  { yer: "Kafe", an: "Kasada, hesap ödenirken.", gorsel: GORSEL.kafeGoogle },
  { yer: "Kuaför", an: "Resepsiyonda, işlem bitince.", gorsel: GORSEL.kuaforInstagram },
  { yer: "Restoran", an: "Kasada, çay ikram edilirken.", gorsel: GORSEL.restoranGoogle },
  { yer: "Pastane", an: "Vitrin önünde, paket hazırlanırken.", gorsel: GORSEL.pastaneInstagram },
  { yer: "Klinik", an: "Resepsiyonda, sonraki randevu verilirken.", gorsel: GORSEL.klinikGoogle },
  { yer: "Butik", an: "Kasada, poşet hazırlanırken.", gorsel: GORSEL.butikInstagram },
  { yer: "Berber", an: "Tezgâhta, tıraş bitince.", gorsel: GORSEL.berberInstagram },
  { yer: "Çiçekçi", an: "Tezgâhta, buket sarılırken.", gorsel: GORSEL.cicekciInstagram },
  { yer: "Oto servis", an: "Resepsiyonda, anahtar teslim edilirken.", gorsel: GORSEL.otoServisGoogle },
];

export function Mekanlar() {
  const ray = useRef<HTMLUListElement>(null);

  function kaydir(yon: 1 | -1) {
    const el = ray.current;
    if (!el) return;
    const kart = el.querySelector("li");
    const adim = kart ? kart.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: yon * adim, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="mekan-baslik" className="py-20 lg:py-28">
      <div className="kabuk flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 id="mekan-baslik" className="text-bolum">
            Yorumu, müşteri en memnunken isteyin.
          </h2>
          <p className="mt-4 text-lg text-murekkep-2">
            Standı koyduğunuz yer, ne zaman sorduğunuzu belirler. Birkaç örnek:
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => kaydir(-1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-cerceve hover:border-murekkep hover:bg-kagit-3"
            aria-label="Önceki örnekler"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => kaydir(1)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-cerceve hover:border-murekkep hover:bg-kagit-3"
            aria-label="Sonraki örnekler"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <ul
        ref={ray}
        className="ray mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        aria-label="Standın kullanıldığı yerler"
      >
        {MEKANLAR.map((m) => (
          <li key={m.yer} className="w-[78%] shrink-0 snap-start sm:w-[42%] lg:w-[19rem] xl:w-[20rem]">
            <figure>
              <div className="stand-kosesi relative aspect-[3/4] overflow-hidden bg-kagit-3">
                <Image
                  src={m.gorsel.src}
                  alt={m.gorsel.alt}
                  fill
                  sizes="(min-width: 64rem) 19rem, (min-width: 40rem) 42vw, 78vw"
                  placeholder="blur"
                  className="object-cover"
                  style={{ objectPosition: m.gorsel.odak }}
                />
              </div>
              <figcaption className="mt-4">
                <p className="etiket text-soluk">{m.yer}</p>
                <p className="mt-1.5 font-medium">{m.an}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="kabuk">
        <YzNotu className="mt-4" />
      </div>
    </section>
  );
}
