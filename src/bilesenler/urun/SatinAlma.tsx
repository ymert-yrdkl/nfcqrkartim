"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { AdetSecici } from "@/bilesenler/sepet/AdetSecici";
import { sepetCekmecesiniAc, sepeteEkle, useSepet } from "@/bilesenler/sepet/sepet-deposu";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import type { UrunSlug } from "@/magaza/urunler";

// Ürün sayfasındaki satın alma kutusu: adet + "Sepete ekle" + "Hemen al".
// Telefonda ana düğme ekrandan çıkınca altta yapışkan bir satın alma çubuğu belirir.
export function SatinAlma({
  slug,
  ad,
  fiyat,
  satilabilir,
}: {
  slug: UrunSlug;
  ad: string;
  fiyat: number;
  satilabilir: number;
}) {
  const router = useRouter();
  const sepet = useSepet();
  const [adet, setAdet] = useState(1);
  const [uyari, setUyari] = useState<string | null>(null);
  const [cubukGorunur, setCubukGorunur] = useState(false);
  const anaDugme = useRef<HTMLDivElement>(null);

  const sepetteki = sepet.find((s) => s.slug === slug)?.adet ?? 0;
  const enCok = Math.max(1, Math.min(TICARI.satirBasinaEnCok, satilabilir - sepetteki));
  const tukendi = satilabilir <= 0;

  useEffect(() => {
    const el = anaDugme.current;
    if (!el) return;
    const gozcu = new IntersectionObserver(([g]) => setCubukGorunur(!g.isIntersecting && g.boundingClientRect.top < 0));
    gozcu.observe(el);
    return () => gozcu.disconnect();
  }, []);

  function ekle(sonra: "cekmece" | "odeme") {
    if (sepetteki + adet > satilabilir) {
      setUyari(
        sepetteki > 0
          ? `Stokta ${satilabilir} adet var, ${sepetteki} tanesi zaten sepetinizde.`
          : `Stokta ${satilabilir} adet var.`,
      );
      return;
    }
    if (sepetteki + adet > TICARI.satirBasinaEnCok) {
      setUyari(`Bir üründen en çok ${TICARI.satirBasinaEnCok} adet alınabiliyor. Daha fazlası için bize yazın.`);
      return;
    }
    setUyari(null);
    sepeteEkle(slug, adet);
    setAdet(1);
    if (sonra === "odeme") router.push("/odeme");
    else sepetCekmecesiniAc();
  }

  if (tukendi) {
    return (
      <div className="rounded-orta border border-cizgi bg-kagit-2 p-5">
        <p className="font-semibold">Bu model şu an tükendi.</p>
        <p className="mt-1 text-murekkep-2">
          Yeni üretim için İletişim sayfasından bize yazın; stok gelince haber verelim.
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={anaDugme} className="flex flex-wrap items-center gap-3">
        <AdetSecici
          adet={adet}
          enCok={enCok}
          etiket="Adet"
          degisti={(yeni) => {
            setUyari(null);
            setAdet(Math.max(1, Math.min(enCok, yeni)));
          }}
        />
        <button type="button" onClick={() => ekle("cekmece")} className={dugmeSinifi("birincil", "buyuk", "flex-1")}>
          Sepete ekle
        </button>
        <button type="button" onClick={() => ekle("odeme")} className={dugmeSinifi("koyu", "buyuk", "w-full")}>
          Hemen satın al
        </button>
      </div>
      {uyari && (
        <p role="status" className="mt-3 text-sm text-hata">
          {uyari}
        </p>
      )}

      {/* Telefonda yapışkan alt çubuk */}
      <div
        className="fixed inset-x-0 bottom-0 z-[var(--z-yapiskan)] border-t border-cizgi bg-kagit-2/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-[var(--sure-kisa)] ease-[var(--ease-cikis)] data-[gizli=true]:translate-y-full lg:hidden"
        data-gizli={!cubukGorunur}
        aria-hidden={!cubukGorunur}
        inert={!cubukGorunur}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm text-soluk">{ad}</p>
            <p className="sayilar font-semibold">{tl(fiyat)}</p>
          </div>
          <button type="button" onClick={() => ekle("cekmece")} className={dugmeSinifi("birincil", "orta")}>
            Sepete ekle
          </button>
        </div>
      </div>
    </>
  );
}
