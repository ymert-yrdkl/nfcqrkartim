import type { Metadata } from "next";
import Link from "next/link";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { SoruListesi } from "@/bilesenler/vitrin/Sorular";
import { SORULAR } from "@/icerik/sss";

export const metadata: Metadata = {
  title: "Sık sorulan sorular",
  description: "Hangi telefonlar okur, bağlantı nasıl değişir, kargo ve ödeme nasıl işler: nfcqrkartim standları hakkında sorular.",
  alternates: { canonical: "/sss" },
};

export default function Sss() {
  const veri = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SORULAR.map((s) => ({
      "@type": "Question",
      name: s.soru,
      acceptedAnswer: { "@type": "Answer", text: s.cevap.join(" ") },
    })),
  };
  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, "\u003c") }} />
      <h1 className="text-bolum">Sık sorulan sorular</h1>
      <p className="mt-4 max-w-[55ch] text-lg text-murekkep-2">
        Standın nasıl çalıştığı, kurulum, sipariş ve kargo. Burada olmayan bir soru için bize yazın.
      </p>

      <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
        <section aria-labelledby="kullanim" className="lg:col-span-8">
          <h2 id="kullanim" className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
            Kullanım ve kurulum
          </h2>
          <div className="mt-4">
            <SoruListesi sorular={SORULAR.filter((s) => s.grup === "kullanim")} />
          </div>
          <h2 id="siparis" className="mt-14 font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
            Sipariş, ödeme ve kargo
          </h2>
          <div className="mt-4">
            <SoruListesi sorular={SORULAR.filter((s) => s.grup === "siparis")} />
          </div>
        </section>
        <aside className="lg:col-span-4">
          <div className="rounded-buyuk border border-cizgi bg-kagit-2 p-6 lg:sticky lg:top-[calc(var(--ust-menu)+1.5rem)]">
            <p className="font-semibold">Cevabı bulamadınız mı?</p>
            <p className="mt-2 text-murekkep-2">Sorunuzu yazın, size dönelim.</p>
            <Link href="/iletisim" className={dugmeSinifi("koyu", "orta", "mt-5")}>
              Bize yazın
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
