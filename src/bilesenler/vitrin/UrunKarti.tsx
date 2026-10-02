import Link from "next/link";
import { SepeteEkle } from "@/bilesenler/sepet/SepeteEkle";
import { UrunResmi } from "@/bilesenler/UrunResmi";
import type { Gorsel } from "@/gorseller";
import { tl } from "@/magaza/para";
import type { Urun } from "@/magaza/urunler";

export function StokBilgisi({ adet }: { adet: number }) {
  if (adet <= 0) return <span className="text-hata">Tükendi</span>;
  if (adet <= 5) return <span>Son {adet} adet</span>;
  return <span>Stokta</span>;
}

// Mağaza ve ana sayfadaki ürün kartı. "buyuk" ikili set için: görsel daha geniş, açıklama uzun.
export function UrunKarti({
  urun,
  satilabilir,
  gorsel = urun.gorseller[0],
  buyuk = false,
  ek,
  sizes,
}: {
  urun: Urun;
  satilabilir: number;
  gorsel?: Gorsel;
  buyuk?: boolean;
  ek?: React.ReactNode;
  sizes: string;
}) {
  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/urun/${urun.slug}`}
        className={buyuk ? "block lg:flex lg:flex-1 lg:flex-col" : "block"}
        tabIndex={-1}
        aria-hidden="true"
      >
        <UrunResmi
          gorsel={gorsel}
          sizes={sizes}
          className={`w-full transition-[filter] duration-[var(--sure-kisa)] group-hover:brightness-[1.03] ${
            buyuk ? "aspect-[4/5] lg:aspect-auto lg:min-h-[34rem] lg:flex-1" : "aspect-[5/4]"
          }`}
        />
      </Link>
      <div className={buyuk ? "flex flex-col pt-5" : "flex flex-1 flex-col pt-5"}>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className={buyuk ? "text-2xl" : "text-xl"}>
            <Link href={`/urun/${urun.slug}`} className="hover:underline">
              {urun.ad}
            </Link>
          </h3>
          <p className="sayilar shrink-0 text-lg font-semibold">{tl(urun.fiyat)}</p>
        </div>
        <p className="mt-2 max-w-[48ch] text-murekkep-2">{urun.ozet}</p>
        {ek}
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <p className="text-sm text-soluk">
            <StokBilgisi adet={satilabilir} /> · KDV dahil
          </p>
          <SepeteEkle slug={urun.slug} satilabilir={satilabilir} tur={buyuk ? "birincil" : "koyu"} boy="orta" />
        </div>
      </div>
    </article>
  );
}
