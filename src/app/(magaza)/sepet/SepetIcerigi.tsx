"use client";

import Link from "next/link";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { SepetSatirlari, SepetTutarlari, SetOnerisi } from "@/bilesenler/sepet/SepetParcalari";
import { useSepet } from "@/bilesenler/sepet/sepet-deposu";
import { TICARI } from "@/magaza/ayarlar";

export function SepetIcerigi() {
  const satirlar = useSepet();

  if (satirlar.length === 0) {
    return (
      <div className="mt-10 max-w-xl rounded-buyuk border border-cizgi bg-kagit-2 p-8">
        <p className="text-lg font-medium">Sepetiniz boş.</p>
        <p className="mt-2 text-murekkep-2">
          Google yorum standı, Instagram takip standı ya da ikisi birden. Mağazada üç model var.
        </p>
        <Link href="/urunler" className={dugmeSinifi("koyu", "orta", "mt-6")}>
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="border-y border-cizgi lg:col-span-7">
        <SepetSatirlari satirlar={satirlar} buyuk />
      </div>
      <aside aria-label="Sipariş özeti" className="lg:col-span-5">
        <div className="space-y-5 rounded-buyuk border border-cizgi bg-kagit-2 p-6 lg:sticky lg:top-[calc(var(--ust-menu)+1.5rem)]">
          <h2 className="font-sans text-lg font-semibold">Sipariş özeti</h2>
          <SetOnerisi satirlar={satirlar} />
          <SepetTutarlari satirlar={satirlar} />
          <Link href="/odeme" className={dugmeSinifi("birincil", "buyuk", "w-full")}>
            Ödemeye geç
          </Link>
          <p className="text-sm text-soluk">
            Ödeme havale / EFT ile. Ödemeniz geçince {TICARI.kargoyaVerilis} içinde kargoya veririz.
          </p>
        </div>
      </aside>
    </div>
  );
}
