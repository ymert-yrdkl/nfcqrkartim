"use client";

import { useState } from "react";
import { dugmeSinifi, type DugmeBoyu, type DugmeTuru } from "@/bilesenler/dugme";
import type { UrunSlug } from "@/magaza/urunler";
import { sepetCekmecesiniAc, sepeteEkle, useSepet } from "./sepet-deposu";

// Sepete ekler ve sepet çekmecesini açar. Satılabilir adet aşılırsa eklemez, altında nedenini yazar.
export function SepeteEkle({
  slug,
  satilabilir,
  adet = 1,
  tur = "birincil",
  boy = "buyuk",
  className = "",
  metin = "Sepete ekle",
}: {
  slug: UrunSlug;
  satilabilir: number;
  adet?: number;
  tur?: DugmeTuru;
  boy?: DugmeBoyu;
  className?: string;
  metin?: string;
}) {
  const sepet = useSepet();
  const [uyari, setUyari] = useState<string | null>(null);
  const sepettekiAdet = sepet.find((s) => s.slug === slug)?.adet ?? 0;
  const tukendi = satilabilir <= 0;

  function ekle() {
    if (sepettekiAdet + adet > satilabilir) {
      setUyari(
        sepettekiAdet > 0
          ? `Stokta ${satilabilir} adet var, ${sepettekiAdet} tanesi zaten sepetinizde.`
          : `Stokta ${satilabilir} adet var.`,
      );
      return;
    }
    setUyari(null);
    sepeteEkle(slug, adet);
    sepetCekmecesiniAc();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={ekle}
        disabled={tukendi}
        className={dugmeSinifi(tur, boy, "w-full")}
      >
        {tukendi ? "Tükendi" : metin}
      </button>
      {uyari && (
        <p role="status" className="mt-2 text-sm text-hata">
          {uyari}
        </p>
      )}
    </div>
  );
}
