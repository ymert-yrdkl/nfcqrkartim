import type { Metadata } from "next";
import { SorguFormu } from "./SorguFormu";

export const metadata: Metadata = {
  title: "Sipariş sorgula",
  description: "Sipariş numaranız ve telefonunuzun son dört hanesiyle siparişinizin durumunu görün.",
};

export default function SiparisSorgula() {
  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <h1 className="text-bolum">Sipariş sorgula</h1>
      <p className="mt-4 max-w-[55ch] text-lg text-murekkep-2">
        Ödeme durumunu, kargo takip numarasını ve sipariş özetinizi görmek için iki bilgi yeterli.
      </p>
      <SorguFormu />
    </div>
  );
}
