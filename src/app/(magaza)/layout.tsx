import { AltBilgi } from "@/bilesenler/AltBilgi";
import { UstMenu } from "@/bilesenler/UstMenu";
import { SepetCekmecesi } from "@/bilesenler/sepet/SepetCekmecesi";
import { ILETISIM, SITE, TICARI } from "@/magaza/ayarlar";

// Arama motorları için kuruluş bilgisi (yalnız bilinen alanlar).
const KURULUS = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.ad,
  url: SITE.adres,
  logo: new URL("/apple-icon.png", SITE.adres).toString(),
  slogan: SITE.slogan,
  ...(ILETISIM.eposta ? { email: ILETISIM.eposta } : {}),
  ...(ILETISIM.telefon ? { telephone: ILETISIM.telefon } : {}),
  ...(ILETISIM.instagram ? { sameAs: [`https://instagram.com/${ILETISIM.instagram}`] } : {}),
};

export default function MagazaDuzeni({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(KURULUS).replace(/</g, "\\u003c") }}
      />
      <a
        href="#icerik"
        className="sr-only z-[var(--z-bildirim)] rounded-full bg-murekkep px-4 py-2 text-kagit-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        İçeriğe geç
      </a>
      <p className="koyu bg-gece px-4 py-2 text-center text-[0.8rem] text-gece-soluk">
        {TICARI.kargoUcreti === 0 ? "Kargo ücretsiz." : "Türkiye'nin her yerine kargo."}{" "}
        <span className="hidden sm:inline">Ödemeniz onaylanınca </span>
        {TICARI.kargoyaVerilis} içinde kargoda.
      </p>
      <UstMenu />
      <main id="icerik" className="flex-1">
        {children}
      </main>
      <AltBilgi />
      <SepetCekmecesi />
    </div>
  );
}
