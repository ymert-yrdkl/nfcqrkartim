"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { SepetSatirlari, SepetTutarlari, SetOnerisi } from "./SepetParcalari";
import { SEPET_AC_OLAYI, sepetToplami, useSepet } from "./sepet-deposu";

export function SepetCekmecesi() {
  const pencere = useRef<HTMLDialogElement>(null);
  const satirlar = useSepet();
  const { adet } = sepetToplami(satirlar);
  const yol = usePathname();

  useEffect(() => {
    const ac = () => pencere.current?.showModal();
    window.addEventListener(SEPET_AC_OLAYI, ac);
    return () => window.removeEventListener(SEPET_AC_OLAYI, ac);
  }, []);

  // Sayfa değişince (ör. "Ödemeye geç") çekmece kapanır.
  useEffect(() => {
    pencere.current?.close();
  }, [yol]);

  return (
    <dialog
      ref={pencere}
      aria-labelledby="sepet-baslik"
      className="cekmece m-0 ms-auto h-dvh max-h-dvh w-full max-w-[28rem] bg-kagit-2 p-0 text-murekkep shadow-[var(--shadow-cekmece)] backdrop:bg-murekkep/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-cizgi px-5">
          <h2 id="sepet-baslik" className="font-sans text-lg font-semibold tracking-tight">
            Sepetiniz {adet > 0 && <span className="sayilar text-soluk">({adet})</span>}
          </h2>
          <button
            type="button"
            onClick={() => pencere.current?.close()}
            className="-me-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-kagit-3"
            aria-label="Sepeti kapat"
          >
            <X size={20} />
          </button>
        </header>

        {satirlar.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-5">
            <p className="text-lg font-medium">Sepetiniz boş.</p>
            <p className="text-soluk">
              Standlar tek tek ya da ikili set olarak satılıyor. Fiyatlara KDV dahil, kargo{" "}
              {TICARI.kargoUcreti === 0 ? "ücretsiz" : tl(TICARI.kargoUcreti)}.
            </p>
            <Link href="/urunler" className={dugmeSinifi("koyu", "orta")}>
              Standları gör
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <SepetSatirlari satirlar={satirlar} />
            </div>
            <footer className="shrink-0 space-y-4 border-t border-cizgi bg-kagit px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <SetOnerisi satirlar={satirlar} />
              <div>
                <SepetTutarlari satirlar={satirlar} />
              </div>
              <div className="grid gap-2">
                <Link href="/odeme" className={dugmeSinifi("birincil", "buyuk", "w-full")}>
                  Ödemeye geç
                </Link>
                <Link href="/sepet" className={dugmeSinifi("sade", "orta", "w-full justify-center")}>
                  Sepeti sayfada aç
                </Link>
              </div>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
