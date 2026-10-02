import Link from "next/link";
import { AltBilgi } from "@/bilesenler/AltBilgi";
import { UstMenu } from "@/bilesenler/UstMenu";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { SepetCekmecesi } from "@/bilesenler/sepet/SepetCekmecesi";

export default function Bulunamadi() {
  return (
    <div className="flex min-h-dvh flex-col">
      <UstMenu />
      <main className="kabuk flex-1 pt-16 pb-24">
        <p className="etiket text-soluk">404</p>
        <h1 className="mt-4 text-dev [font-stretch:84%]">Bu sayfa yok.</h1>
        <p className="mt-5 max-w-[48ch] text-lg text-murekkep-2">
          Bağlantı eskimiş ya da adres yanlış yazılmış olabilir. Standlara mağazadan, siparişinize Sipariş sorgula
          sayfasından ulaşabilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/urunler" className={dugmeSinifi("birincil", "buyuk")}>
            Mağazaya git
          </Link>
          <Link href="/siparis-sorgula" className={dugmeSinifi("cizgili", "buyuk")}>
            Sipariş sorgula
          </Link>
        </div>
      </main>
      <AltBilgi />
      <SepetCekmecesi />
    </div>
  );
}
