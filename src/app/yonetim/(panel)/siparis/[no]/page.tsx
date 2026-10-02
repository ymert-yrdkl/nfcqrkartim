import Link from "next/link";
import { notFound } from "next/navigation";
import { tl } from "@/magaza/para";
import { DURUM_ADI, GECISLER } from "@/magaza/siparis-durumu";
import { tarihSaat } from "@/magaza/tarih";
import { yonetimBul } from "@/sunucu/siparis";
import { yonetimGerekli } from "@/sunucu/yonetim-oturum";
import { DurumFormu } from "./DurumFormu";

function Bilgi({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-sm text-soluk">{etiket}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function YonetimSiparis({ params }: PageProps<"/yonetim/siparis/[no]">) {
  await yonetimGerekli();
  const { no } = await params;
  const s = yonetimBul(no);
  if (!s) notFound();
  const telefon = s.telefon.replace(/\D/g, "").replace(/^0/, "90");

  return (
    <>
      <Link href="/yonetim" className="text-sm text-soluk hover:text-murekkep hover:underline">
        ← Siparişler
      </Link>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="font-mono text-3xl font-semibold">{s.no}</h1>
        <p className="text-murekkep-2">
          {tarihSaat(s.olusturma)} · <strong>{DURUM_ADI[s.durum]}</strong>
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section className="rounded-buyuk border border-cizgi bg-kagit-2 p-6">
            <h2 className="font-sans text-lg font-semibold [font-stretch:100%]">Durumu değiştir</h2>
            <div className="mt-4">
              <DurumFormu
                no={s.no}
                durum={s.durum}
                gecisler={GECISLER[s.durum]}
                kartlaOdendi={Boolean(s.odemeKimlik && s.odemeZamani)}
              />
            </div>
          </section>

          <section className="rounded-buyuk border border-cizgi bg-kagit-2 p-6">
            <h2 className="font-sans text-lg font-semibold [font-stretch:100%]">Ürünler</h2>
            <ul className="mt-3 divide-y divide-cizgi border-y border-cizgi">
              {s.kalemler.map((k) => (
                <li key={k.urunSlug} className="flex justify-between gap-4 py-3">
                  <span>
                    {k.urunAdi} <span className="sayilar text-soluk">× {k.adet}</span>
                  </span>
                  <span className="sayilar">{tl(k.tutar)}</span>
                </li>
              ))}
            </ul>
            <p className="sayilar mt-3 flex justify-between font-semibold">
              <span>Toplam ({s.kargo === 0 ? "kargo ücretsiz" : `kargo ${tl(s.kargo)}`})</span>
              <span>{tl(s.toplam)}</span>
            </p>
          </section>

          <section className="rounded-buyuk border border-cizgi bg-kagit-2 p-6">
            <h2 className="font-sans text-lg font-semibold [font-stretch:100%]">Geçmiş</h2>
            <ol className="mt-3 space-y-3">
              {s.olaylar.map((o, i) => (
                <li key={i} className="grid grid-cols-[10rem_1fr] gap-4 text-sm">
                  <span className="sayilar text-soluk">{tarihSaat(o.zaman)}</span>
                  <span>
                    <strong>{DURUM_ADI[o.durum]}</strong>
                    {o.aciklama && <span className="text-murekkep-2"> · {o.aciklama}</span>}
                    <span className="text-soluk"> ({o.yapan})</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-8 lg:col-span-5">
          <section className="rounded-buyuk border border-cizgi bg-kagit-2 p-6">
            <h2 className="font-sans text-lg font-semibold [font-stretch:100%]">Müşteri</h2>
            <dl className="mt-2 divide-y divide-cizgi">
              <Bilgi etiket="Ödeme">
                {s.odemeYontemi === "kart" ? "Kart (iyzico)" : "Havale / EFT"}
                {s.odemeKimlik && (
                  <>
                    {" "}
                    · ödeme no <span className="font-mono">{s.odemeKimlik}</span>
                    {s.odemeZamani ? ` · ${tarihSaat(s.odemeZamani)}` : " · iyzico incelemesinde"}
                  </>
                )}
              </Bilgi>
              <Bilgi etiket="Ad soyad">{s.ad}</Bilgi>
              <Bilgi etiket="Telefon">
                <a href={`tel:${s.telefon.replace(/\s/g, "")}`} className="underline">
                  {s.telefon}
                </a>{" "}
                ·{" "}
                <a href={`https://wa.me/${telefon}`} className="underline">
                  WhatsApp
                </a>
              </Bilgi>
              <Bilgi etiket="E-posta">
                <a href={`mailto:${s.eposta}`} className="underline">
                  {s.eposta}
                </a>
              </Bilgi>
              <Bilgi etiket="Teslimat">
                {s.adres}
                <br />
                {s.ilce} / {s.il} {s.postaKodu}
              </Bilgi>
              <Bilgi etiket="Fatura">
                {s.faturaTuru === "kurumsal" ? (
                  <>
                    {s.firmaUnvani}
                    <br />
                    {s.vergiDairesi} V.D. · <span className="font-mono">{s.vergiNo}</span>
                  </>
                ) : (
                  "Bireysel"
                )}
                <br />
                <span className="text-murekkep-2">{s.faturaAdresi ?? "Teslimat adresiyle aynı"}</span>
              </Bilgi>
              {s.siparisNotu && <Bilgi etiket="Sipariş notu">{s.siparisNotu}</Bilgi>}
              {s.kargoTakip && (
                <Bilgi etiket="Kargo">
                  {s.kargoFirmasi} <span className="font-mono">{s.kargoTakip}</span>
                </Bilgi>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
