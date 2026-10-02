import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/bilesenler/Logo";
import { okunmamisMesajSayisi } from "@/sunucu/mesaj";
import { yonetimGerekli } from "@/sunucu/yonetim-oturum";
import { cikisYap } from "../eylemler";
import { PanelMenusu } from "./PanelMenusu";

export const metadata: Metadata = { title: "Yönetim", robots: { index: false, follow: false } };

export default async function PanelDuzeni({ children }: LayoutProps<"/yonetim">) {
  await yonetimGerekli();
  const okunmamis = okunmamisMesajSayisi();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-cizgi bg-kagit-2">
        <div className="kabuk flex h-16 items-center gap-6">
          <Link href="/yonetim" aria-label="Yönetim ana sayfası">
            <Logo />
          </Link>
          <span className="etiket rounded-full bg-murekkep px-2 py-1 text-kagit-2">Yönetim</span>
          <PanelMenusu okunmamis={okunmamis} />
          <div className="ms-auto flex items-center gap-2">
            <Link href="/" className="hidden h-11 items-center px-3 text-sm text-murekkep-2 hover:text-murekkep sm:inline-flex">
              Siteyi aç
            </Link>
            <form action={cikisYap}>
              <button type="submit" className="h-11 rounded-full px-3 text-sm text-murekkep-2 hover:bg-kagit-3 hover:text-murekkep">
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="kabuk py-10">{children}</main>
    </div>
  );
}
