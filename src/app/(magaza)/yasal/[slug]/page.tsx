import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YASAL_BELGELER, type YasalBlok } from "@/icerik/yasal";
import { ILETISIM, SATICI, SITE, TICARI, YASAL_GUNCELLEME } from "@/magaza/ayarlar";

// Yer tutucuların değeri ve eksikse görünecek adı. null = henüz bilinmiyor, sayfada "eklenecek" yazar.
const DEGERLER: Record<string, { deger: string | null; ad: string }> = {
  SATICI_UNVAN: { deger: SATICI.unvan, ad: "satıcı unvanı" },
  SATICI_ADRES: { deger: SATICI.adres, ad: "satıcı adresi" },
  SATICI_VERGI_DAIRESI: { deger: SATICI.vergiDairesi, ad: "vergi dairesi" },
  SATICI_VERGI_NO: { deger: SATICI.vergiNo, ad: "vergi numarası" },
  SATICI_MERSIS: { deger: SATICI.mersis, ad: "MERSİS numarası" },
  SATICI_TELEFON: { deger: ILETISIM.telefon, ad: "telefon" },
  SATICI_EPOSTA: { deger: ILETISIM.eposta, ad: "e-posta" },
  SATICI_KEP: { deger: SATICI.kep, ad: "KEP adresi" },
  SITE_ADRESI: { deger: SITE.adres, ad: "site adresi" },
  IADE_ADRESI: { deger: SATICI.iadeAdresi, ad: "iade adresi" },
  KARGO_FIRMASI: { deger: TICARI.kargoFirmasi, ad: "kargo firması" },
  KARGOYA_VERILIS_IS_GUNU: { deger: TICARI.kargoyaVerilisGun, ad: "kargoya veriliş süresi" },
  ODEME_SURESI_GUN: { deger: String(TICARI.odemeSuresiGun), ad: "ödeme süresi" },
  IADE_KARGO_KIMDE: { deger: SATICI.iadeKargo, ad: "iade kargo ücretini kimin ödediği" },
  YONLENDIRME_HIZMET_SURESI: { deger: SATICI.yonlendirmeSuresi, ad: "yönlendirme hizmetinin süresi" },
  SUNUCU_KONUMU: { deger: SATICI.sunucuKonumu, ad: "sunucu konumu" },
  KURUMSAL_IADE_POLITIKASI: { deger: SATICI.kurumsalIade, ad: "kurumsal iade politikası" },
  GUNCELLEME_TARIHI: { deger: YASAL_GUNCELLEME, ad: "güncelleme tarihi" },
};

function Metin({ metin }: { metin: string }) {
  const parcalar = metin.split(/(\{\{[A-Z_]+\}\})/g);
  return (
    <>
      {parcalar.map((p, i) => {
        const eslesme = p.match(/^\{\{([A-Z_]+)\}\}$/);
        if (!eslesme) return p;
        const bilgi = DEGERLER[eslesme[1]];
        if (bilgi?.deger) return bilgi.deger;
        return (
          <mark key={i} className="rounded-kucuk bg-uyari-zemin px-1 text-murekkep">
            [{bilgi?.ad ?? eslesme[1].toLowerCase()} eklenecek]
          </mark>
        );
      })}
    </>
  );
}

function Blok({ blok }: { blok: YasalBlok }) {
  if (typeof blok === "string") {
    return (
      <p>
        <Metin metin={blok} />
      </p>
    );
  }
  if (blok.tur === "liste" || blok.tur === "sirali") {
    const Liste = blok.tur === "liste" ? "ul" : "ol";
    return (
      <Liste className={`space-y-2 ps-5 ${blok.tur === "liste" ? "list-disc" : "list-decimal"}`}>
        {blok.maddeler.map((m) => (
          <li key={m}>
            <Metin metin={m} />
          </li>
        ))}
      </Liste>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.95rem]">
        <thead>
          <tr className="border-b border-murekkep">
            {blok.basliklar.map((b) => (
              <th key={b} scope="col" className="py-2 pe-4 font-semibold text-murekkep">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cizgi">
          {blok.satirlar.map((satir, i) => (
            <tr key={i}>
              {satir.map((h, j) => (
                <td key={j} className={`py-2.5 pe-4 align-top ${j === 0 ? "text-soluk" : ""}`}>
                  <Metin metin={h} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function generateStaticParams() {
  return YASAL_BELGELER.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/yasal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const belge = YASAL_BELGELER.find((b) => b.slug === slug);
  if (!belge) return {};
  return { title: belge.baslik, description: belge.ozet, alternates: { canonical: `/yasal/${belge.slug}` } };
}

export default async function YasalSayfa({ params }: PageProps<"/yasal/[slug]">) {
  const { slug } = await params;
  const belge = YASAL_BELGELER.find((b) => b.slug === slug);
  if (!belge) notFound();
  const kimlik = (i: number) => `bolum-${i + 1}`;

  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <div className="grid gap-12 lg:grid-cols-12">
        <aside className="order-last lg:order-none lg:col-span-3">
          <nav aria-label="Yasal metinler" className="lg:sticky lg:top-[calc(var(--ust-menu)+1.5rem)]">
            <p className="etiket text-soluk">Yasal metinler</p>
            <ul className="mt-3 space-y-0.5">
              {YASAL_BELGELER.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/yasal/${b.slug}`}
                    aria-current={b.slug === belge.slug ? "page" : undefined}
                    className="inline-flex min-h-9 items-center text-murekkep-2 hover:text-murekkep hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-murekkep"
                  >
                    {b.baslik}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="lg:col-span-8 lg:col-start-5">
          <h1 className="text-bolum">{belge.baslik}</h1>
          <p className="mt-4 max-w-[65ch] text-lg text-murekkep-2">{belge.ozet}</p>
          <p className="mt-4 text-sm text-soluk">Son güncelleme: {YASAL_GUNCELLEME}</p>
          <p className="mt-6 max-w-[65ch] rounded-orta border border-cizgi bg-uyari-zemin p-4 text-sm">
            Bu metin taslaktır; hukukçu incelemesinden sonra kesinleşecek. Sarı işaretli bilgiler yayından önce
            eklenecek.
          </p>

          {belge.bolumler.length > 4 && (
            <nav aria-label="Bu sayfada" className="mt-10 border-y border-cizgi py-5">
              <p className="text-sm font-semibold">Bu sayfada</p>
              <ol className="mt-3 grid gap-x-8 gap-y-1.5 text-[0.95rem] sm:grid-cols-2">
                {belge.bolumler.map((b, i) => (
                  <li key={b.baslik}>
                    <a href={`#${kimlik(i)}`} className="text-murekkep-2 hover:text-murekkep hover:underline">
                      {i + 1}. {b.baslik}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mt-10 max-w-[70ch] space-y-10 leading-relaxed">
            {belge.bolumler.map((b, i) => (
              <section key={b.baslik} id={kimlik(i)} aria-labelledby={`${kimlik(i)}-baslik`}>
                <h2 id={`${kimlik(i)}-baslik`} className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
                  {i + 1}. {b.baslik}
                </h2>
                <div className="mt-3 space-y-3 text-murekkep-2">
                  {b.bloklar.map((blok, j) => (
                    <Blok key={j} blok={blok} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
