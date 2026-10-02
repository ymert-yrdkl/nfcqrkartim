import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowCounterClockwise, Bank, Receipt, Truck } from "@phosphor-icons/react/dist/ssr";
import { SatinAlma } from "@/bilesenler/urun/SatinAlma";
import { UrunGalerisi } from "@/bilesenler/urun/UrunGalerisi";
import { KURULUM_ADIMLARI } from "@/bilesenler/vitrin/Kurulum";
import { OzellikTablosu } from "@/bilesenler/vitrin/Ozellikler";
import { SoruListesi } from "@/bilesenler/vitrin/Sorular";
import { StokBilgisi, UrunKarti } from "@/bilesenler/vitrin/UrunKarti";
import { sorular } from "@/icerik/sss";
import { iyzicoAcikMi } from "@/sunucu/iyzico";
import { SITE, TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { URUNLER, setAvantaji, urunBul } from "@/magaza/urunler";
import { guncelSatilabilirler } from "@/sunucu/vitrin";

export async function generateMetadata({ params }: PageProps<"/urun/[slug]">): Promise<Metadata> {
  const urun = urunBul((await params).slug);
  if (!urun) return {};
  return {
    title: `${urun.ad} (NFC + QR)`,
    description: `${urun.ozet} ${tl(urun.fiyat)}, KDV dahil.`,
    alternates: { canonical: `/urun/${urun.slug}` },
    openGraph: { title: urun.ad, description: urun.ozet, images: [{ url: urun.gorseller[0].src.src }] },
  };
}

function Akordeon({ baslik, acik = false, children }: { baslik: string; acik?: boolean; children: React.ReactNode }) {
  return (
    <details className="akordeon group" open={acik}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold">
        {baslik}
        <span className="arti inline-flex size-8 items-center justify-center rounded-full border border-cerceve text-lg leading-none font-normal group-hover:border-murekkep" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="pb-6 text-murekkep-2">{children}</div>
    </details>
  );
}

export default async function UrunSayfasi({ params }: PageProps<"/urun/[slug]">) {
  const urun = urunBul((await params).slug);
  if (!urun) notFound();
  const satilabilir = await guncelSatilabilirler();
  const adet = satilabilir[urun.slug];
  const digerleri = URUNLER.filter((u) => u.slug !== urun.slug);

  const veri = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: urun.ad,
    description: urun.ozet,
    image: urun.gorseller.map((g) => new URL(g.src.src, SITE.adres).toString()),
    brand: { "@type": "Brand", name: SITE.ad },
    sku: urun.slug,
    offers: {
      "@type": "Offer",
      url: new URL(`/urun/${urun.slug}`, SITE.adres).toString(),
      priceCurrency: "TRY",
      price: (urun.fiyat / 100).toFixed(2),
      availability: adet > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(veri).replace(/</g, "\\u003c") }} />

      <div className="kabuk pt-6 pb-20 lg:pb-28">
        <nav aria-label="Konum" className="text-sm text-soluk">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/urunler" className="hover:text-murekkep hover:underline">
                Mağaza
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-murekkep">
              {urun.ad}
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <UrunGalerisi gorseller={urun.gorseller} video={urun.video} urunAdi={urun.ad} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(var(--ust-menu)+1.5rem)]">
              <p className="etiket text-soluk">NFC + QR stand</p>
              <h1 className="mt-3 text-[clamp(2rem,1.6vw+1.4rem,2.75rem)] leading-[1.05] tracking-[-0.03em]">
                {urun.ad}
              </h1>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <p className="sayilar text-2xl font-semibold">{tl(urun.fiyat)}</p>
                <p className="text-sm text-soluk">
                  KDV dahil · <StokBilgisi adet={adet} />
                </p>
              </div>
              <p className="mt-5 text-lg text-murekkep-2">{urun.ozet}</p>

              <fieldset className="mt-7">
                <legend className="text-sm font-medium">Model</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {URUNLER.map((u) => (
                    <Link
                      key={u.slug}
                      href={`/urun/${u.slug}`}
                      aria-current={u.slug === urun.slug ? "page" : undefined}
                      scroll={false}
                      className="flex min-h-14 flex-col items-center justify-center rounded-orta border border-cerceve px-2 py-2 text-center text-sm leading-tight transition-colors duration-[var(--sure-mikro)] hover:border-murekkep aria-[current=page]:border-murekkep aria-[current=page]:bg-murekkep aria-[current=page]:text-kagit-2"
                    >
                      <span className="font-medium">{u.kisaAd}</span>
                      <span className="sayilar mt-0.5 text-xs opacity-75">{tl(u.fiyat)}</span>
                    </Link>
                  ))}
                </div>
                {urun.slug !== "ikili-set" && (
                  <p className="mt-2 text-sm text-soluk">
                    İkisini birlikte alırsanız set{" "}
                    <span className="sayilar font-medium text-murekkep">{tl(setAvantaji())}</span> daha uygun.
                  </p>
                )}
              </fieldset>

              <div className="mt-7">
                <SatinAlma slug={urun.slug} ad={urun.ad} fiyat={urun.fiyat} satilabilir={adet} />
              </div>

              <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex gap-3">
                  <Truck size={20} className="shrink-0" aria-hidden="true" />
                  <span>
                    {TICARI.kargoUcreti === 0 ? "Kargo ücretsiz" : `Kargo ${tl(TICARI.kargoUcreti)}`}; ödemeden sonra{" "}
                    {TICARI.kargoyaVerilis} içinde kargoda
                  </span>
                </li>
                <li className="flex gap-3">
                  <ArrowCounterClockwise size={20} className="shrink-0" aria-hidden="true" />
                  <span>Teslimden sonra 14 gün içinde iade</span>
                </li>
                <li className="flex gap-3">
                  <Receipt size={20} className="shrink-0" aria-hidden="true" />
                  <span>Bireysel ya da kurumsal fatura</span>
                </li>
                <li className="flex gap-3">
                  <Bank size={20} className="shrink-0" aria-hidden="true" />
                  <span>{iyzicoAcikMi() ? "Kartla (taksitli) ya da havale / EFT ile ödeme" : "Havale / EFT ile ödeme"}</span>
                </li>
              </ul>

              <div className="mt-8 divide-y divide-cizgi border-y border-cizgi">
                <Akordeon baslik="Ürün hakkında" acik>
                  <div className="space-y-3">
                    {urun.aciklama.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </Akordeon>
                <Akordeon baslik="Kutu içeriği">
                  <ul className="list-disc space-y-1 ps-5">
                    {urun.icerik.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </Akordeon>
                <Akordeon baslik="Kurulum">
                  <ol className="list-decimal space-y-2 ps-5">
                    {KURULUM_ADIMLARI.map((a) => (
                      <li key={a.baslik}>
                        <span className="font-medium text-murekkep">{a.baslik}.</span> {a.metin}
                      </li>
                    ))}
                  </ol>
                </Akordeon>
                <Akordeon baslik="Kargo ve iade">
                  <p>
                    Ödemeniz onaylanınca siparişiniz {TICARI.kargoyaVerilis} içinde kargoya verilir. Teslim aldıktan sonra 14 gün içinde gerekçe göstermeden iade edebilirsiniz.{" "}
                    <Link href="/yasal/iade-ve-cayma" className="text-murekkep underline">
                      İade adımları
                    </Link>
                  </p>
                </Akordeon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="teknik-baslik" className="border-t border-cizgi bg-kagit-2">
        <div className="kabuk grid gap-10 py-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 id="teknik-baslik" className="text-bolum">
              Teknik ayrıntılar
            </h2>
          </div>
          <div className="lg:col-span-8">
            <OzellikTablosu />
          </div>
        </div>
      </section>

      <section aria-labelledby="diger-baslik" className="kabuk py-20 lg:py-24">
        <h2 id="diger-baslik" className="text-bolum">
          Diğer modeller
        </h2>
        <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
          {digerleri.map((u) => (
            <UrunKarti key={u.slug} urun={u} satilabilir={satilabilir[u.slug]} sizes="(min-width: 48rem) 40rem, 100vw" />
          ))}
        </div>
      </section>

      <section aria-labelledby="urun-sorular" className="kabuk grid gap-10 pb-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 id="urun-sorular" className="text-bolum">
            Sık sorulanlar
          </h2>
        </div>
        <div className="lg:col-span-8">
          <SoruListesi sorular={sorular(iyzicoAcikMi()).filter((s) => s.anaSayfada)} />
        </div>
      </section>
    </>
  );
}
