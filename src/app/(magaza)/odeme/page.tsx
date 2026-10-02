import type { Metadata } from "next";
import { guncelSatilabilirler } from "@/sunucu/vitrin";
import { OdemeFormu } from "./OdemeFormu";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false },
};

export default async function OdemeSayfasi() {
  const satilabilir = await guncelSatilabilirler();
  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <h1 className="text-bolum">Ödeme</h1>
      <p className="mt-3 max-w-[60ch] text-murekkep-2">
        Bilgilerinizi yazın, siparişi tamamlayın. Ödemeyi havale ya da EFT ile siparişten sonra yaparsınız.
      </p>
      <OdemeFormu satilabilir={satilabilir} />
    </div>
  );
}
