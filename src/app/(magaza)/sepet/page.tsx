import type { Metadata } from "next";
import { SepetIcerigi } from "./SepetIcerigi";

export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false },
};

export default function SepetSayfasi() {
  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      <h1 className="text-bolum">Sepet</h1>
      <SepetIcerigi />
    </div>
  );
}
