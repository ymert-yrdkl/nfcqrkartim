import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowUpRight, CheckCircle, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { Kopyala } from "@/bilesenler/Kopyala";
import { BANKA, ILETISIM, KURULUM_PANELI, TICARI } from "@/magaza/ayarlar";
import { tl, tlKesirli } from "@/magaza/para";
import { DURUM_ADI, ILERLEME } from "@/magaza/siparis-durumu";
import { gunEkle, tarih, tarihSaat } from "@/magaza/tarih";
import { anahtarIleBul, imzaIleBul, type Siparis } from "@/sunucu/siparis";
import { SepetiTemizle } from "./SepetiTemizle";

export const metadata: Metadata = {
  title: "Siparişiniz",
  robots: { index: false, follow: false },
};

async function siparisiBul(no: string, anahtar: string | undefined): Promise<Siparis | null> {
  if (!/^NQ-\d{6}$/.test(no)) return null;
  if (anahtar) {
    const s = anahtarIleBul(no, anahtar);
    if (s) return s;
  }
  const imza = (await cookies()).get(`siparis_${no}`)?.value;
  return imza ? imzaIleBul(no, imza) : null;
}

function Satir({ etiket, children }: { etiket: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <dt className="text-sm text-soluk">{etiket}</dt>
      <dd className="flex items-center gap-3 font-medium">{children}</dd>
    </div>
  );
}

export default async function SiparisSayfasi({ params, searchParams }: PageProps<"/siparis/[no]">) {
  const { no } = await params;
  const sorgu = await searchParams;
  const anahtar = typeof sorgu.t === "string" ? sorgu.t : undefined;
  const yeni = sorgu.yeni === "1";
  const siparis = await siparisiBul(no, anahtar);

  if (!siparis) {
    return (
      <div className="kabuk pt-14 pb-24">
        <h1 className="text-bolum">Sipariş açılamadı</h1>
        <p className="mt-4 max-w-[55ch] text-lg text-murekkep-2">
          Bağlantı eksik ya da süresi dolmuş olabilir. Sipariş numaranız ve telefonunuzun son dört hanesiyle
          siparişinizi yeniden açabilirsiniz.
        </p>
        <Link href="/siparis-sorgula" className={dugmeSinifi("koyu", "orta", "mt-8")}>
          Sipariş sorgula
        </Link>
      </div>
    );
  }

  const sonOdeme = tarih(gunEkle(siparis.olusturma, TICARI.odemeSuresiGun));
  const adim = ILERLEME.indexOf(siparis.durum);
  const iptal = siparis.durum === "iptal";
  const whatsapp = ILETISIM.whatsapp
    ? `https://wa.me/${ILETISIM.whatsapp}?text=${encodeURIComponent(
        `Merhaba, ${siparis.no} numaralı siparişimin ödeme dekontunu gönderiyorum.`,
      )}`
    : null;

  return (
    <div className="kabuk pt-10 pb-24 lg:pt-14">
      {yeni && <SepetiTemizle />}

      <header className="max-w-3xl">
        {yeni ? (
          <>
            <p className="flex items-center gap-2 font-medium text-basari">
              <CheckCircle size={22} weight="fill" aria-hidden="true" /> Siparişiniz alındı
            </p>
            <h1 className="mt-3 text-bolum">
              Teşekkürler. Sipariş numaranız <span className="fosfor font-mono">{siparis.no}</span>
            </h1>
          </>
        ) : (
          <h1 className="text-bolum">
            Sipariş <span className="font-mono">{siparis.no}</span>
          </h1>
        )}
        <p className="mt-4 text-murekkep-2">
          {tarihSaat(siparis.olusturma)} · {DURUM_ADI[siparis.durum]}
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-10 lg:col-span-7">
          {/* İlerleme */}
          <section aria-labelledby="durum-baslik">
            <h2 id="durum-baslik" className="sr-only">
              Sipariş durumu
            </h2>
            {iptal ? (
              <p className="rounded-orta border border-hata bg-hata-zemin p-4">
                Bu sipariş iptal edildi. Bir yanlışlık olduğunu düşünüyorsanız bize yazın.
              </p>
            ) : (
              <ol className="grid grid-cols-4 gap-2">
                {ILERLEME.map((d, i) => (
                  <li key={d} aria-current={i === adim ? "step" : undefined}>
                    <span
                      className={`block h-1.5 rounded-full ${i <= adim ? "bg-murekkep" : "bg-cizgi"}`}
                      aria-hidden="true"
                    />
                    <span className={`mt-2 block text-sm ${i === adim ? "font-semibold" : i < adim ? "" : "text-soluk"}`}>
                      {DURUM_ADI[d]}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {siparis.durum === "odeme_bekliyor" && (
            <section aria-labelledby="odeme-baslik" className="rounded-buyuk border border-murekkep bg-kagit-2 p-6 sm:p-7">
              <h2 id="odeme-baslik" className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
                Ödemeyi havale ya da EFT ile yapın
              </h2>
              <p className="mt-2 text-murekkep-2">
                Açıklamaya yalnız sipariş numaranızı yazın. Ödeme en geç <strong>{sonOdeme}</strong> tarihinde
                hesabımıza geçmezse sipariş iptal edilir.
              </p>
              {BANKA ? (
                <dl className="mt-5 divide-y divide-cizgi border-y border-cizgi">
                  <Satir etiket="Banka">{BANKA.banka}</Satir>
                  <Satir etiket="Alıcı">{BANKA.alici}</Satir>
                  <Satir etiket="IBAN">
                    <span className="sayilar font-mono text-[0.95rem]">{BANKA.iban}</span>
                    <Kopyala metin={BANKA.iban.replace(/\s/g, "")} etiket="IBAN" />
                  </Satir>
                  <Satir etiket="Tutar">
                    <span className="sayilar">{tlKesirli(siparis.toplam)}</span>
                    <Kopyala metin={(siparis.toplam / 100).toFixed(2).replace(".", ",")} etiket="Tutar" />
                  </Satir>
                  <Satir etiket="Açıklama">
                    <span className="font-mono">{siparis.no}</span>
                    <Kopyala metin={siparis.no} etiket="Sipariş numarası" />
                  </Satir>
                </dl>
              ) : (
                <div className="mt-5 rounded-orta bg-uyari-zemin p-4">
                  <p>
                    Hesap bilgilerimizi siparişinizi onayladığımızda telefonla ya da e-postayla ileteceğiz. Tutar:{" "}
                    <strong className="sayilar">{tlKesirli(siparis.toplam)}</strong>, açıklama:{" "}
                    <strong className="font-mono">{siparis.no}</strong>.
                  </p>
                </div>
              )}
              {whatsapp && (
                <a href={whatsapp} className={dugmeSinifi("cizgili", "orta", "mt-6 gap-2")}>
                  <WhatsappLogo size={18} aria-hidden="true" /> Dekontu WhatsApp&apos;tan gönderin
                </a>
              )}
            </section>
          )}

          {siparis.kargoTakip && (
            <section aria-labelledby="kargo-baslik" className="rounded-buyuk border border-cizgi bg-kagit-2 p-6">
              <h2 id="kargo-baslik" className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
                Kargo
              </h2>
              <dl className="mt-3 divide-y divide-cizgi">
                {siparis.kargoFirmasi && <Satir etiket="Kargo firması">{siparis.kargoFirmasi}</Satir>}
                <Satir etiket="Takip numarası">
                  <span className="font-mono">{siparis.kargoTakip}</span>
                  <Kopyala metin={siparis.kargoTakip} etiket="Takip numarası" />
                </Satir>
              </dl>
            </section>
          )}

          <section aria-labelledby="sonra-baslik">
            <h2 id="sonra-baslik" className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">
              Stand elinize geçince
            </h2>
            <p className="mt-2 max-w-[60ch] text-murekkep-2">
              Panoyu tabana takın, kendi telefonunuzla okutun ve açılan kurulum sayfasında bağlantınızı seçin. Google
              yorum bağlantınızı şimdiden hazırlayabilirsiniz.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/nasil-calisir" className={dugmeSinifi("cizgili", "orta")}>
                Kurulum adımları
              </Link>
              <a href={KURULUM_PANELI} className={dugmeSinifi("sade", "orta", "gap-1.5")}>
                Kurulum paneli <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </a>
            </div>
          </section>

          {anahtar && (
            <p className="rounded-orta border border-cizgi p-4 text-sm text-murekkep-2">
              Bu sayfanın bağlantısını saklayın. Kaybederseniz sipariş numaranız ve telefonunuzun son dört hanesiyle{" "}
              <Link href="/siparis-sorgula" className="underline">
                Sipariş sorgula
              </Link>{" "}
              sayfasından açabilirsiniz.
            </p>
          )}
        </div>

        <aside aria-label="Sipariş ayrıntıları" className="lg:col-span-5">
          <div className="space-y-6 rounded-buyuk border border-cizgi bg-kagit-2 p-6">
            <div>
              <h2 className="font-sans text-lg font-semibold">Ürünler</h2>
              <ul className="mt-3 divide-y divide-cizgi border-y border-cizgi">
                {siparis.kalemler.map((k) => (
                  <li key={k.urunSlug} className="flex justify-between gap-4 py-3">
                    <span>
                      {k.urunAdi} <span className="sayilar text-soluk">× {k.adet}</span>
                    </span>
                    <span className="sayilar font-medium">{tl(k.tutar)}</span>
                  </li>
                ))}
              </ul>
              <dl className="sayilar mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-soluk">Ara toplam</dt>
                  <dd>{tl(siparis.araToplam)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soluk">Kargo</dt>
                  <dd>{siparis.kargo === 0 ? "Ücretsiz" : tl(siparis.kargo)}</dd>
                </div>
                <div className="flex justify-between border-t border-cizgi pt-2 text-base font-semibold">
                  <dt>Toplam</dt>
                  <dd>{tl(siparis.toplam)}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold">Teslimat</h2>
              <p className="mt-2 text-murekkep-2">
                {siparis.ad}
                <br />
                {siparis.adres}
                <br />
                {siparis.ilce} / {siparis.il} {siparis.postaKodu}
                <br />
                {siparis.telefon}
              </p>
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold">Fatura</h2>
              <p className="mt-2 text-murekkep-2">
                {siparis.faturaTuru === "kurumsal" ? (
                  <>
                    {siparis.firmaUnvani}
                    <br />
                    {siparis.vergiDairesi} V.D. · {siparis.vergiNo}
                  </>
                ) : (
                  <>Bireysel · {siparis.ad}</>
                )}
                <br />
                {siparis.faturaAdresi ?? "Teslimat adresiyle aynı"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
