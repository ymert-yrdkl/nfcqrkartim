import type { Metadata } from "next";
import { UrunSecimi } from "@/bilesenler/vitrin/UrunSecimi";
import { tl } from "@/magaza/para";
import { URUNLER } from "@/magaza/urunler";
import { guncelSatilabilirler } from "@/sunucu/vitrin";

export const metadata: Metadata = {
  title: "Mağaza",
  description: "Google yorum standı, Instagram takip standı ve ikili set. NFC ve dinamik QR'lı, KDV dahil fiyatlar.",
  alternates: { canonical: "/urunler" },
};

const SATIRLAR: { ad: string; degerler: [string, string, string] }[] = [
  { ad: "Açtığı sayfa", degerler: ["Google yorum penceresi", "Instagram profili", "İkisi, ayrı standlarda"] },
  { ad: "Stand", degerler: ["1 pano + 1 taban", "1 pano + 1 taban", "2 pano + 2 taban"] },
  { ad: "Kart kodu", degerler: ["1", "1", "2 (her stand ayrı)"] },
  { ad: "Bağlantıyı değiştirme", degerler: ["Var", "Var", "Var, her biri ayrı"] },
  { ad: "En uygun yer", degerler: ["Kasa, ödeme noktası", "Masa, bekleme alanı", "Kasa + masa"] },
];

export default async function Magaza() {
  const satilabilir = await guncelSatilabilirler();
  return (
    <>
      <UrunSecimi satilabilir={satilabilir} baslikSeviyesi={1} />

      <section aria-labelledby="karsilastir-baslik" className="border-t border-cizgi bg-kagit-2">
        <div className="kabuk py-20 lg:py-24">
          <h2 id="karsilastir-baslik" className="text-bolum">
            Karşılaştırın
          </h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Üç modelin karşılaştırması</caption>
              <thead>
                <tr className="border-b border-murekkep">
                  <th scope="col" className="w-1/4 py-4 pe-4 font-normal">
                    <span className="sr-only">Özellik</span>
                  </th>
                  {URUNLER.map((u) => (
                    <th key={u.slug} scope="col" className="py-4 pe-4 align-bottom">
                      <span className="block font-baslik text-xl font-semibold tracking-tight">{u.kisaAd}</span>
                      <span className="sayilar mt-1 block text-sm font-normal text-soluk">{tl(u.fiyat)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cizgi">
                {SATIRLAR.map((s) => (
                  <tr key={s.ad}>
                    <th scope="row" className="etiket py-4 pe-4 align-top font-medium text-soluk">
                      {s.ad}
                    </th>
                    {s.degerler.map((d, i) => (
                      <td key={i} className="py-4 pe-4 align-top">
                        {d}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
