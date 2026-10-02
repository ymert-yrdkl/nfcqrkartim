"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowUpRight, List, ShoppingBagOpen, X } from "@phosphor-icons/react";
import { Logo } from "@/bilesenler/Logo";
import { KURULUM_PANELI } from "@/magaza/ayarlar";
import { sepetCekmecesiniAc, sepetToplami, useSepet } from "@/bilesenler/sepet/sepet-deposu";

const BAGLANTILAR = [
  { href: "/urunler", ad: "Mağaza" },
  { href: "/nasil-calisir", ad: "Nasıl çalışır" },
  { href: "/sss", ad: "Sorular" },
  { href: "/iletisim", ad: "İletişim" },
] as const;

export function UstMenu() {
  const yol = usePathname();
  const { adet } = sepetToplami(useSepet());
  const menu = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    menu.current?.close();
  }, [yol]);

  const aktif = (href: string) => yol === href || (href === "/urunler" && yol.startsWith("/urun/"));

  return (
    <header className="sticky top-0 z-[var(--z-yapiskan)] border-b border-cizgi bg-kagit/90 backdrop-blur-md backdrop-saturate-150">
      <div className="kabuk flex h-[var(--ust-menu)] items-center gap-6">
        <Link href="/" className="-ms-1 rounded-kucuk px-1" aria-label="nfcqrkartim ana sayfa">
          <Logo />
        </Link>

        <nav aria-label="Ana menü" className="ms-6 hidden md:block">
          <ul className="flex items-center gap-1">
            {BAGLANTILAR.map((b) => (
              <li key={b.href}>
                <Link
                  href={b.href}
                  aria-current={aktif(b.href) ? "page" : undefined}
                  className="relative inline-flex h-11 items-center rounded-full px-3.5 text-[0.95rem] text-murekkep-2 transition-colors duration-[var(--sure-mikro)] hover:text-murekkep aria-[current=page]:text-murekkep aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3.5 aria-[current=page]:after:bottom-2 aria-[current=page]:after:h-[3px] aria-[current=page]:after:rounded-full aria-[current=page]:after:bg-sinyal"
                >
                  {b.ad}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <a
            href={KURULUM_PANELI}
            className="hidden h-11 items-center gap-1 rounded-full px-3.5 text-[0.95rem] text-murekkep-2 hover:text-murekkep lg:inline-flex"
          >
            Kartımı kur
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={sepetCekmecesiniAc}
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-murekkep ps-4 pe-4 text-[0.95rem] font-medium text-kagit-2 transition-colors duration-[var(--sure-mikro)] hover:bg-murekkep-2"
            aria-label={adet > 0 ? `Sepet, ${adet} ürün` : "Sepet, boş"}
          >
            <ShoppingBagOpen size={20} aria-hidden="true" />
            <span className="hidden sm:inline">Sepet</span>
            <span
              className="sayilar inline-flex min-w-6 items-center justify-center rounded-full bg-sinyal px-1.5 text-sm font-semibold text-murekkep data-[bos=true]:bg-gece-2 data-[bos=true]:text-gece-soluk"
              data-bos={adet === 0}
              aria-hidden="true"
            >
              {adet}
            </span>
          </button>
          <button
            type="button"
            onClick={() => menu.current?.showModal()}
            className="-me-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-kagit-3 md:hidden"
            aria-label="Menüyü aç"
          >
            <List size={24} />
          </button>
        </div>
      </div>

      <dialog
        ref={menu}
        aria-label="Menü"
        className="menu-perdesi m-0 h-dvh max-h-dvh w-full max-w-full bg-kagit p-0 text-murekkep"
      >
        <div className="kabuk flex h-[var(--ust-menu)] items-center justify-between border-b border-cizgi">
          <Logo />
          <button
            type="button"
            onClick={() => menu.current?.close()}
            className="-me-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-kagit-3"
            aria-label="Menüyü kapat"
          >
            <X size={24} />
          </button>
        </div>
        <nav aria-label="Mobil menü" className="kabuk py-6">
          <ul className="divide-y divide-cizgi border-b border-cizgi">
            {[{ href: "/", ad: "Ana sayfa" }, ...BAGLANTILAR, { href: "/siparis-sorgula", ad: "Sipariş sorgula" }].map(
              (b) => (
                <li key={b.href}>
                  <Link
                    href={b.href}
                    aria-current={yol === b.href ? "page" : undefined}
                    className="flex min-h-14 items-center font-baslik text-2xl font-semibold tracking-tight aria-[current=page]:underline aria-[current=page]:decoration-sinyal aria-[current=page]:decoration-4 aria-[current=page]:underline-offset-8"
                  >
                    {b.ad}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <a href={KURULUM_PANELI} className="mt-6 inline-flex h-11 items-center gap-1.5 text-lg">
            Kartımı kur
            <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
          </a>
          <p className="mt-1 text-sm text-soluk">Standınızı aldıysanız bağlantısını buradan seçersiniz.</p>
        </nav>
      </dialog>
    </header>
  );
}
