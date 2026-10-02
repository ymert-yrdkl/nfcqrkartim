"use client";

import Image from "next/image";
import Link from "next/link";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { setAvantaji, urunBul } from "@/magaza/urunler";
import { AdetSecici } from "./AdetSecici";
import {
  adediDegistir,
  sepetToplami,
  sepettenCikar,
  setlereCevir,
  type SepetSatiri,
} from "./sepet-deposu";

// Sepet satırları: çekmecede ve sepet sayfasında aynı liste.
export function SepetSatirlari({ satirlar, buyuk = false }: { satirlar: SepetSatiri[]; buyuk?: boolean }) {
  return (
    <ul className="divide-y divide-cizgi" aria-label="Sepetteki ürünler">
      {satirlar.map((s) => {
        const urun = urunBul(s.slug);
        if (!urun) return null;
        const kapak = urun.gorseller[0];
        return (
          <li key={s.slug} className={`flex gap-4 ${buyuk ? "py-6" : "py-5"}`}>
            <Link
              href={`/urun/${urun.slug}`}
              className={`studyo-zemin stand-kosesi relative shrink-0 overflow-hidden ${buyuk ? "size-28" : "size-20"}`}
            >
              <Image src={kapak.src} alt="" fill sizes={buyuk ? "112px" : "80px"} className="object-contain" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/urun/${urun.slug}`} className="font-medium leading-snug hover:underline">
                    {urun.ad}
                  </Link>
                  {buyuk && <p className="sayilar mt-1 text-sm text-soluk">Adet fiyatı {tl(urun.fiyat)}</p>}
                </div>
                <span className="sayilar shrink-0 font-medium">{tl(urun.fiyat * s.adet)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <AdetSecici
                  adet={s.adet}
                  enCok={TICARI.satirBasinaEnCok}
                  etiket={`${urun.ad} adedi`}
                  degisti={(yeni) => adediDegistir(s.slug, yeni)}
                />
                <button
                  type="button"
                  onClick={() => sepettenCikar(s.slug)}
                  className="h-11 text-sm text-soluk underline-offset-4 hover:text-murekkep hover:underline"
                >
                  Kaldır
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Tekli Google + tekli Instagram varsa sete çevirme önerisi.
export function SetOnerisi({ satirlar }: { satirlar: SepetSatiri[] }) {
  const google = satirlar.find((s) => s.slug === "google-yorum-standi")?.adet ?? 0;
  const instagram = satirlar.find((s) => s.slug === "instagram-takip-standi")?.adet ?? 0;
  const set = satirlar.find((s) => s.slug === "ikili-set")?.adet ?? 0;
  const cift = Math.min(google, instagram, TICARI.satirBasinaEnCok - set);
  if (cift <= 0) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-orta border border-cizgi bg-kagit-2 p-3 text-sm">
      <p>
        Google ve Instagram standını birlikte alıyorsunuz. Set olarak{" "}
        <strong className="sayilar font-semibold">{tl(setAvantaji() * cift)}</strong> daha az ödersiniz.
      </p>
      <button type="button" onClick={setlereCevir} className={dugmeSinifi("cizgili", "kucuk", "shrink-0")}>
        Sete çevir
      </button>
    </div>
  );
}

export function SepetTutarlari({ satirlar }: { satirlar: SepetSatiri[] }) {
  const { araToplam, kargo, toplam } = sepetToplami(satirlar);
  return (
    <>
      <dl className="sayilar space-y-1.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-soluk">Ara toplam</dt>
          <dd>{tl(araToplam)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-soluk">Kargo</dt>
          <dd>{kargo === 0 ? "Ücretsiz" : tl(kargo)}</dd>
        </div>
        <div className="flex justify-between border-t border-cizgi pt-2.5 text-base font-semibold">
          <dt>Toplam</dt>
          <dd>{tl(toplam)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-soluk">Fiyatlara KDV dahildir.</p>
    </>
  );
}
