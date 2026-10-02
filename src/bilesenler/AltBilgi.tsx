import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { LogoIsaret } from "@/bilesenler/Logo";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { ILETISIM, KURULUM_PANELI, SITE } from "@/magaza/ayarlar";
import { URUNLER } from "@/magaza/urunler";

export const YASAL_BAGLANTILAR = [
  { slug: "on-bilgilendirme", ad: "Ön bilgilendirme formu" },
  { slug: "mesafeli-satis", ad: "Mesafeli satış sözleşmesi" },
  { slug: "iade-ve-cayma", ad: "İade ve cayma" },
  { slug: "kargo-ve-teslimat", ad: "Kargo ve teslimat" },
  { slug: "kvkk", ad: "KVKK aydınlatma metni" },
  { slug: "gizlilik-ve-cerez", ad: "Gizlilik ve çerezler" },
  { slug: "kullanim-kosullari", ad: "Kullanım koşulları" },
] as const;

function Grup({ baslik, children, className = "" }: { baslik: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="etiket font-sans text-soluk">{baslik}</h2>
      <ul className="mt-3 space-y-0.5">{children}</ul>
    </div>
  );
}

const bag = "inline-flex min-h-9 items-center text-[0.95rem] text-murekkep-2 hover:text-murekkep hover:underline";

export function AltBilgi() {
  return (
    <footer className="mt-auto border-t border-cizgi bg-kagit-3">
      <div className="kabuk grid gap-12 pt-16 pb-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="max-w-[18ch] font-baslik text-bolum font-semibold">{SITE.slogan}</p>
          <p className="mt-4 max-w-[42ch] text-soluk">
            NFC ve QR&apos;lı pleksi standlar. Siparişler Türkiye&apos;nin her yerine kargoyla gönderilir.
          </p>
          <Link href="/urunler" className={dugmeSinifi("koyu", "orta", "mt-6")}>
            Mağazaya git
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7">
          <Grup baslik="Mağaza">
            {URUNLER.map((u) => (
              <li key={u.slug}>
                <Link href={`/urun/${u.slug}`} className={bag}>
                  {u.slug === "ikili-set" ? "İkili set" : u.ad}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sepet" className={bag}>
                Sepet
              </Link>
            </li>
          </Grup>
          <Grup baslik="Yardım">
            <li>
              <Link href="/nasil-calisir" className={bag}>
                Nasıl çalışır
              </Link>
            </li>
            <li>
              <Link href="/sss" className={bag}>
                Sık sorulan sorular
              </Link>
            </li>
            <li>
              <Link href="/siparis-sorgula" className={bag}>
                Sipariş sorgula
              </Link>
            </li>
            <li>
              <Link href="/iletisim" className={bag}>
                İletişim
              </Link>
            </li>
            <li>
              <a href={KURULUM_PANELI} className={`${bag} gap-1`}>
                Kartımı kur <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
              </a>
            </li>
          </Grup>
          <Grup baslik="Yasal" className="col-span-2 sm:col-span-1">
            {YASAL_BAGLANTILAR.map((y) => (
              <li key={y.slug}>
                <Link href={`/yasal/${y.slug}`} className={bag}>
                  {y.ad}
                </Link>
              </li>
            ))}
          </Grup>
        </div>
      </div>

      <div className="kabuk">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-cizgi py-5 text-sm text-soluk">
          <p>© {new Date().getFullYear()} nfcqrkartim. Fiyatlara KDV dahildir.</p>
          <p className="flex flex-wrap gap-x-5">
            {ILETISIM.eposta && <a href={`mailto:${ILETISIM.eposta}`}>{ILETISIM.eposta}</a>}
            {ILETISIM.telefon && <a href={`tel:${ILETISIM.telefon.replace(/\s/g, "")}`}>{ILETISIM.telefon}</a>}
          </p>
        </div>
        {/* Kapanış: büyük yazı markası, alt kenarı kesik. */}
        <div className="pointer-events-none flex items-end gap-[1.5vw] overflow-hidden select-none" aria-hidden="true">
          <LogoIsaret className="mb-[1.4vw] w-[10vw] max-w-[9rem] shrink-0 text-murekkep" vurgu />
          <span className="translate-y-[16%] font-baslik text-[min(16.6vw,14.8rem)] leading-[0.8] font-bold tracking-[-0.055em] text-murekkep">
            nfcqrkartim
          </span>
        </div>
      </div>
    </footer>
  );
}
