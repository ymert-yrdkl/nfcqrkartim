import type { Metadata } from "next";
import { denemeOrtamiMi, iyzicoAcikMi } from "@/sunucu/iyzico";
import { guncelSatilabilirler } from "@/sunucu/vitrin";
import { OdemeFormu } from "./OdemeFormu";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false },
};

export default async function OdemeSayfasi({ searchParams }: PageProps<"/odeme">) {
  const satilabilir = await guncelSatilabilirler();
  const kartAcik = iyzicoAcikMi();
  const { odeme, neden } = await searchParams;

  // iyzico ödeme sayfasından başarısız dönüş: /odeme?odeme=basarisiz&neden=...
  let donusHatasi: string | null = null;
  if (odeme === "basarisiz") donusHatasi = typeof neden === "string" && neden ? neden.slice(0, 160) : "Ödeme onaylanmadı.";
  else if (odeme === "hata") donusHatasi = "Ödeme sonucunu alamadık.";

  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <h1 className="text-bolum">Ödeme</h1>
      <p className="mt-3 max-w-[60ch] text-murekkep-2">
        {kartAcik
          ? "Bilgilerinizi yazın, kartla ya da havale / EFT ile ödeyin."
          : "Bilgilerinizi yazın, siparişi tamamlayın. Ödemeyi havale ya da EFT ile siparişten sonra yaparsınız."}
      </p>
      <OdemeFormu
        satilabilir={satilabilir}
        kartAcik={kartAcik}
        denemeOrtami={kartAcik && denemeOrtamiMi()}
        donusHatasi={donusHatasi}
      />
    </div>
  );
}
