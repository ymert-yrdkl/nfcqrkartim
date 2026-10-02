import Link from "next/link";
import { Anatomi } from "@/bilesenler/vitrin/Anatomi";
import { DinamikQr } from "@/bilesenler/vitrin/DinamikQr";
import { Kahraman } from "@/bilesenler/vitrin/Kahraman";
import { Kurulum } from "@/bilesenler/vitrin/Kurulum";
import { Mekanlar } from "@/bilesenler/vitrin/Mekanlar";
import { Ozellikler } from "@/bilesenler/vitrin/Ozellikler";
import { SoruListesi } from "@/bilesenler/vitrin/Sorular";
import { UrunSecimi } from "@/bilesenler/vitrin/UrunSecimi";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { SORULAR } from "@/icerik/sss";
import { guncelSatilabilirler } from "@/sunucu/vitrin";

export default async function AnaSayfa() {
  const satilabilir = await guncelSatilabilirler();
  return (
    <>
      <Kahraman />
      <Anatomi />
      <DinamikQr />
      <UrunSecimi satilabilir={satilabilir} />
      <Mekanlar />
      <Kurulum />
      <Ozellikler />
      <section aria-labelledby="sorular-baslik" className="kabuk grid gap-10 pb-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 id="sorular-baslik" className="text-bolum">
            Aklınıza takılanlar
          </h2>
          <p className="mt-4 text-murekkep-2">Cevabını bulamadığınız soru için bize yazın.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sss" className={dugmeSinifi("cizgili", "orta")}>
              Bütün sorular
            </Link>
            <Link href="/iletisim" className={dugmeSinifi("sade", "orta")}>
              İletişim
            </Link>
          </div>
        </div>
        <div className="lg:col-span-8">
          <SoruListesi sorular={SORULAR.filter((s) => s.anaSayfada)} />
        </div>
      </section>
    </>
  );
}
