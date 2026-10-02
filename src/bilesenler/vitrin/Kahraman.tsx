import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { SahneVideosu } from "@/bilesenler/SahneVideosu";
import { YzNotu } from "@/bilesenler/YzNotu";
import { VIDEO } from "@/gorseller";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { URUNLER } from "@/magaza/urunler";

export function Kahraman() {
  const enDusuk = Math.min(...URUNLER.map((u) => u.fiyat));
  return (
    <section aria-labelledby="kahraman-baslik" className="kabuk grid items-center gap-x-12 gap-y-10 pt-10 pb-16 lg:grid-cols-12 lg:pt-12 lg:pb-24">
      <div className="lg:col-span-6">
        <p className="etiket text-soluk">NFC + QR masa standı</p>
        <h1 id="kahraman-baslik" className="mt-5 text-dev font-semibold [font-stretch:84%]">
          Telefonu <span className="fosfor">yaklaştırın</span>, gerisi kendiliğinden.
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-murekkep-2">
          Kasanızdaki stand, müşterinizi tek dokunuşla Google yorum sayfanıza ya da Instagram profilinize götürür.
          NFC&apos;si kapalı telefonlar için QR da üstünde.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/urunler" className={dugmeSinifi("birincil", "buyuk")}>
            Standları gör
          </Link>
          <Link href="/nasil-calisir" className={dugmeSinifi("sade", "orta", "group gap-1.5")}>
            Nasıl çalışır
            <ArrowRight
              size={16}
              weight="bold"
              aria-hidden="true"
              className="transition-transform duration-[var(--sure-kisa)] ease-[var(--ease-cikis)] group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <p className="mt-8 text-sm text-soluk">
          <span className="sayilar">{tl(enDusuk)}</span>&apos;den başlayan fiyatlar ·{" "}
          {TICARI.kargoUcreti === 0 ? "kargo ücretsiz" : "Türkiye geneline kargo"}
        </p>
      </div>

      <figure className="lg:col-span-6">
        <SahneVideosu
          {...VIDEO.telefonuYaklastirin}
          className="stand-kosesi aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-auto lg:h-[min(44rem,calc(100dvh-10rem))]"
        />
        <figcaption>
          <YzNotu className="mt-3" />
        </figcaption>
      </figure>
    </section>
  );
}
