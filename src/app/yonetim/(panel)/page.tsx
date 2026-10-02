import Link from "next/link";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { DURUMLAR, DURUM_ADI, type SiparisDurumu } from "@/magaza/siparis-durumu";
import { gunEkle, kisaTarih } from "@/magaza/tarih";
import { durumSayilari, siparisleriListele } from "@/sunucu/siparis";
import { stokOkuSenkron } from "@/sunucu/stok";
import { yonetimGerekli } from "@/sunucu/yonetim-oturum";

const ROZET: Record<SiparisDurumu, string> = {
  odeme_bekliyor: "bg-uyari-zemin",
  hazirlaniyor: "bg-sinyal",
  kargoda: "bg-kagit-3",
  teslim_edildi: "bg-basari-zemin",
  iptal: "bg-hata-zemin",
};

export default async function Siparisler({ searchParams }: PageProps<"/yonetim">) {
  await yonetimGerekli();
  const { durum: ham } = await searchParams;
  const durum = (DURUMLAR as readonly string[]).includes(String(ham)) ? (ham as SiparisDurumu) : "hepsi";
  const liste = siparisleriListele(durum);
  const sayilar = durumSayilari();
  const stok = stokOkuSenkron();
  const toplamSayi = Object.values(sayilar).reduce((a, b) => a + b, 0);
  const simdi = new Date().toISOString();

  const sekmeler: { anahtar: SiparisDurumu | "hepsi"; ad: string; sayi: number }[] = [
    { anahtar: "hepsi", ad: "Hepsi", sayi: toplamSayi },
    ...DURUMLAR.map((d) => ({ anahtar: d, ad: DURUM_ADI[d], sayi: sayilar[d] })),
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-sans text-3xl font-semibold tracking-tight [font-stretch:100%]">Siparişler</h1>
          <p className="mt-1 text-murekkep-2">
            Ödeme bekleyen {sayilar.odeme_bekliyor}, hazırlanacak {sayilar.hazirlaniyor} sipariş var.
          </p>
        </div>
        <p className="sayilar text-sm text-soluk">
          Stok: Google {stok.google} · Instagram {stok.instagram}{" "}
          <Link href="/yonetim/stok" className="ms-2 text-murekkep underline">
            Düzenle
          </Link>
        </p>
      </div>

      <nav aria-label="Duruma göre süz" className="mt-8 overflow-x-auto">
        <ul className="flex gap-2">
          {sekmeler.map((s) => (
            <li key={s.anahtar}>
              <Link
                href={s.anahtar === "hepsi" ? "/yonetim" : `/yonetim?durum=${s.anahtar}`}
                aria-current={durum === s.anahtar ? "page" : undefined}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-cizgi px-4 text-sm whitespace-nowrap hover:border-murekkep aria-[current=page]:border-murekkep aria-[current=page]:bg-murekkep aria-[current=page]:text-kagit-2"
              >
                {s.ad} <span className="sayilar opacity-70">{s.sayi}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {liste.length === 0 ? (
        <div className="mt-8 rounded-buyuk border border-cizgi bg-kagit-2 p-8">
          <p className="font-medium">Bu durumda sipariş yok.</p>
          <p className="mt-1 text-murekkep-2">Yeni siparişler burada en üstte görünür.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-buyuk border border-cizgi bg-kagit-2">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-cizgi text-soluk">
                <th scope="col" className="px-4 py-3 font-medium">Sipariş</th>
                <th scope="col" className="px-4 py-3 font-medium">Tarih</th>
                <th scope="col" className="px-4 py-3 font-medium">Müşteri</th>
                <th scope="col" className="px-4 py-3 font-medium">İl</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Adet</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Tutar</th>
                <th scope="col" className="px-4 py-3 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cizgi">
              {liste.map((s) => {
                const gecikti = s.durum === "odeme_bekliyor" && gunEkle(s.olusturma, TICARI.odemeSuresiGun) < simdi;
                return (
                  <tr key={s.no} className="hover:bg-kagit">
                    <td className="px-4 py-3">
                      <Link href={`/yonetim/siparis/${s.no}`} className="font-mono font-medium underline-offset-4 hover:underline">
                        {s.no}
                      </Link>
                    </td>
                    <td className="sayilar px-4 py-3 whitespace-nowrap text-murekkep-2">{kisaTarih(s.olusturma)}</td>
                    <td className="px-4 py-3">{s.ad}</td>
                    <td className="px-4 py-3 text-murekkep-2">{s.il}</td>
                    <td className="sayilar px-4 py-3 text-right">{s.adet}</td>
                    <td className="sayilar px-4 py-3 text-right font-medium">{tl(s.toplam)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${ROZET[s.durum]}`}>
                        {DURUM_ADI[s.durum]}
                      </span>
                      {gecikti && <span className="ms-2 text-xs text-hata">Ödeme süresi geçti</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
