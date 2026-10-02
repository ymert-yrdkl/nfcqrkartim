"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Bank, LockSimple } from "@phosphor-icons/react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { Alan, alanBaglari, kutuSinifi } from "@/bilesenler/form";
import { SepetTutarlari } from "@/bilesenler/sepet/SepetParcalari";
import { sepetToplami, useSepet } from "@/bilesenler/sepet/sepet-deposu";
import { TICARI } from "@/magaza/ayarlar";
import { ILLER_ALFABETIK } from "@/magaza/iller";
import { tl } from "@/magaza/para";
import { urunBul, type UrunSlug } from "@/magaza/urunler";
import { siparisVer, type OdemeAlani, type OdemeDurumu } from "./eylemler";

const ALAN_ADLARI: Record<OdemeAlani, string> = {
  ad: "Ad soyad",
  telefon: "Telefon",
  eposta: "E-posta",
  il: "İl",
  ilce: "İlçe",
  adres: "Açık adres",
  postaKodu: "Posta kodu",
  firmaUnvani: "Firma unvanı",
  vergiDairesi: "Vergi dairesi",
  vergiNo: "Vergi numarası",
  faturaAdresi: "Fatura adresi",
  siparisNotu: "Sipariş notu",
  sozlesme: "Sözleşme onayı",
};

function Bolum({ no, baslik, children }: { no: number; baslik: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-cizgi pt-8">
      <legend className="float-left mb-6 flex w-full items-center gap-3 font-baslik text-2xl font-semibold tracking-tight [font-stretch:88%]">
        <span className="flex size-8 items-center justify-center rounded-full bg-murekkep font-mono text-sm text-kagit-2">
          {no}
        </span>
        {baslik}
      </legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

export function OdemeFormu({ satilabilir }: { satilabilir: Record<UrunSlug, number> }) {
  const satirlar = useSepet();
  const [durum, gonder, bekliyor] = useActionState<OdemeDurumu, FormData>(siparisVer, null);
  const [faturaTuru, setFaturaTuru] = useState<"bireysel" | "kurumsal">("bireysel");
  const [faturaAyni, setFaturaAyni] = useState(true);
  const ozet = useRef<HTMLDivElement>(null);
  const h = durum?.hatalar ?? {};
  const hataSayisi = Object.keys(h).length;

  // Hata gelince özet kutusuna odaklan (ekran okuyucu ve klavye için).
  useEffect(() => {
    if (durum && (durum.genelHata || Object.keys(durum.hatalar).length > 0)) ozet.current?.focus();
  }, [durum]);

  const stokSorunu = satirlar.filter((s) => s.adet > (satilabilir[s.slug] ?? 0));
  const { adet, toplam } = sepetToplami(satirlar);

  if (satirlar.length === 0) {
    return (
      <div className="mt-10 max-w-xl rounded-buyuk border border-cizgi bg-kagit-2 p-8">
        <p className="text-lg font-medium">Sepetiniz boş, ödeme adımına geçilemiyor.</p>
        <p className="mt-2 text-murekkep-2">Önce mağazadan bir stand seçin.</p>
        <Link href="/urunler" className={dugmeSinifi("koyu", "orta", "mt-6")}>
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // <form action> yerine: React 19 hata dönünce formu sıfırlamasın, girilenler kalsın.
        e.preventDefault();
        const veri = new FormData(e.currentTarget);
        startTransition(() => gonder(veri));
      }}
      className="mt-8 grid gap-x-16 gap-y-10 lg:grid-cols-12"
    >
      <div className="space-y-10 lg:col-span-7">
        {(durum?.genelHata || hataSayisi > 0) && (
          <div
            ref={ozet}
            tabIndex={-1}
            role="alert"
            className="rounded-orta border border-hata bg-hata-zemin p-4 text-murekkep focus:outline-none"
          >
            {durum?.genelHata ? (
              <p className="font-medium">{durum.genelHata}</p>
            ) : (
              <>
                <p className="font-medium">
                  {hataSayisi === 1 ? "Bir alanı düzeltmeniz gerekiyor:" : `${hataSayisi} alanı düzeltmeniz gerekiyor:`}
                </p>
                <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">
                  {(Object.keys(h) as OdemeAlani[]).map((a) => (
                    <li key={a}>
                      <a href={`#${a}`} className="underline">
                        {ALAN_ADLARI[a]}
                      </a>
                      : {h[a]}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Bot tuzağı: insanlar görmez. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Web siteniz
            <input type="text" name="web_sitesi" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
        <input type="hidden" name="sepet" value={JSON.stringify(satirlar)} />

        <Bolum no={1} baslik="İletişim">
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Alan ad="ad" etiket="Ad soyad" hata={h.ad} className="sm:col-span-2">
              <input {...alanBaglari("ad", h.ad)} autoComplete="name" required className={`${kutuSinifi} h-12`} />
            </Alan>
            <Alan ad="telefon" etiket="Telefon" hata={h.telefon} yardim="Kargo ve sipariş bilgisi için.">
              <input
                {...alanBaglari("telefon", h.telefon)}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="0532 123 45 67"
                required
                className={`${kutuSinifi} h-12`}
              />
            </Alan>
            <Alan ad="eposta" etiket="E-posta" hata={h.eposta} yardim="Siparişle ilgili size buradan ulaşırız.">
              <input
                {...alanBaglari("eposta", h.eposta)}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                className={`${kutuSinifi} h-12`}
              />
            </Alan>
          </div>
        </Bolum>

        <Bolum no={2} baslik="Teslimat adresi">
          <div className="grid gap-x-5 sm:grid-cols-2">
            <Alan ad="il" etiket="İl" hata={h.il}>
              <select
                {...alanBaglari("il", h.il)}
                autoComplete="address-level1"
                required
                defaultValue=""
                className={`${kutuSinifi} h-12`}
              >
                <option value="" disabled>
                  İl seçin
                </option>
                {ILLER_ALFABETIK.map((il) => (
                  <option key={il} value={il}>
                    {il}
                  </option>
                ))}
              </select>
            </Alan>
            <Alan ad="ilce" etiket="İlçe" hata={h.ilce}>
              <input {...alanBaglari("ilce", h.ilce)} autoComplete="address-level2" required className={`${kutuSinifi} h-12`} />
            </Alan>
            <Alan
              ad="adres"
              etiket="Açık adres"
              hata={h.adres}
              yardim="Mahalle, sokak, bina ve daire numarası."
              className="sm:col-span-2"
            >
              <textarea
                {...alanBaglari("adres", h.adres)}
                autoComplete="street-address"
                rows={3}
                required
                className={`${kutuSinifi} min-h-24 resize-y py-3`}
              />
            </Alan>
            <Alan ad="postaKodu" etiket="Posta kodu" hata={h.postaKodu} istege>
              <input
                {...alanBaglari("postaKodu", h.postaKodu)}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                className={`${kutuSinifi} h-12`}
              />
            </Alan>
          </div>
        </Bolum>

        <Bolum no={3} baslik="Fatura">
          <div role="radiogroup" aria-label="Fatura türü" className="grid grid-cols-2 gap-3">
            {(["bireysel", "kurumsal"] as const).map((t) => (
              <label
                key={t}
                className="flex h-12 cursor-pointer items-center gap-3 rounded-orta border border-cerceve bg-kagit-2 px-4 hover:border-murekkep has-[:checked]:border-murekkep has-[:checked]:shadow-[inset_0_0_0_1px_var(--color-murekkep)]"
              >
                <input
                  type="radio"
                  name="faturaTuru"
                  value={t}
                  checked={faturaTuru === t}
                  onChange={() => setFaturaTuru(t)}
                  className="size-4 accent-murekkep"
                />
                {t === "bireysel" ? "Bireysel" : "Kurumsal"}
              </label>
            ))}
          </div>

          {faturaTuru === "kurumsal" && (
            <div className="mt-6 grid gap-x-5 sm:grid-cols-2">
              <Alan ad="firmaUnvani" etiket="Firma unvanı" hata={h.firmaUnvani} className="sm:col-span-2">
                <input {...alanBaglari("firmaUnvani", h.firmaUnvani)} autoComplete="organization" className={`${kutuSinifi} h-12`} />
              </Alan>
              <Alan ad="vergiDairesi" etiket="Vergi dairesi" hata={h.vergiDairesi}>
                <input {...alanBaglari("vergiDairesi", h.vergiDairesi)} className={`${kutuSinifi} h-12`} />
              </Alan>
              <Alan
                ad="vergiNo"
                etiket="Vergi numarası"
                hata={h.vergiNo}
                yardim="Şahıs şirketinde TC kimlik numarası."
              >
                <input
                  {...alanBaglari("vergiNo", h.vergiNo)}
                  inputMode="numeric"
                  maxLength={11}
                  className={`${kutuSinifi} h-12`}
                />
              </Alan>
            </div>
          )}

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="faturaAyni"
              checked={faturaAyni}
              onChange={(e) => setFaturaAyni(e.target.checked)}
              className="size-5 accent-murekkep"
            />
            Fatura adresi teslimat adresiyle aynı
          </label>
          {!faturaAyni && (
            <Alan ad="faturaAdresi" etiket="Fatura adresi" hata={h.faturaAdresi} className="mt-5">
              <textarea {...alanBaglari("faturaAdresi", h.faturaAdresi)} rows={3} className={`${kutuSinifi} min-h-24 resize-y py-3`} />
            </Alan>
          )}
        </Bolum>

        <Bolum no={4} baslik="Ödeme">
          <label className="flex cursor-pointer gap-4 rounded-orta border border-murekkep bg-kagit-2 p-4 shadow-[inset_0_0_0_1px_var(--color-murekkep)]">
            <input type="radio" name="odeme" value="havale" defaultChecked className="mt-1 size-4 accent-murekkep" />
            <span>
              <span className="flex items-center gap-2 font-medium">
                <Bank size={18} aria-hidden="true" /> Havale / EFT
              </span>
              <span className="mt-1 block text-sm text-murekkep-2">
                Siparişi tamamlayınca hesap bilgisi ve sipariş numaranız ekranda çıkar. Açıklamaya sipariş numarasını
                yazın. Ödeme {TICARI.odemeSuresiGun} gün içinde gelmezse sipariş iptal edilir.
              </span>
            </span>
          </label>

          <Alan ad="siparisNotu" etiket="Sipariş notu" hata={h.siparisNotu} istege className="mt-6">
            <textarea
              {...alanBaglari("siparisNotu", h.siparisNotu)}
              rows={2}
              maxLength={500}
              placeholder="Teslimatla ilgili eklemek istedikleriniz"
              className={`${kutuSinifi} min-h-20 resize-y py-3`}
            />
          </Alan>
        </Bolum>

        <div className="border-t border-cizgi pt-8">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              id="sozlesme"
              name="sozlesme"
              aria-describedby="sozlesme-aciklama"
              aria-invalid={h.sozlesme ? true : undefined}
              className="mt-0.5 size-5 shrink-0 accent-murekkep"
            />
            <span>
              <Link href="/yasal/on-bilgilendirme" target="_blank" className="underline">
                Ön bilgilendirme formunu
              </Link>{" "}
              ve{" "}
              <Link href="/yasal/mesafeli-satis" target="_blank" className="underline">
                mesafeli satış sözleşmesini
              </Link>{" "}
              okudum, onaylıyorum.
            </span>
          </label>
          <p id="sozlesme-aciklama" className={`mt-1.5 min-h-5 ps-8 text-sm ${h.sozlesme ? "text-hata" : "text-soluk"}`}>
            {h.sozlesme ?? ""}
          </p>
          <p className="mt-2 text-sm text-soluk">
            Kişisel verileriniz{" "}
            <Link href="/yasal/kvkk" target="_blank" className="underline">
              KVKK aydınlatma metnine
            </Link>{" "}
            göre yalnız siparişiniz için işlenir.
          </p>

          {stokSorunu.length > 0 && (
            <p role="alert" className="mt-6 rounded-orta border border-hata bg-hata-zemin p-4 text-sm">
              {stokSorunu.map((s) => `${urunBul(s.slug)?.ad}: stokta ${satilabilir[s.slug] ?? 0} adet`).join(", ")}.
              Sepetteki adedi azaltın.
            </p>
          )}

          <button
            type="submit"
            disabled={bekliyor || stokSorunu.length > 0}
            className={dugmeSinifi("birincil", "buyuk", "mt-6 w-full sm:w-auto sm:min-w-72")}
          >
            {bekliyor ? "Sipariş alınıyor…" : `Siparişi tamamla, ${tl(toplam)}`}
          </button>
          <p className="mt-3 flex items-center gap-2 text-sm text-soluk">
            <LockSimple size={16} aria-hidden="true" /> Bağlantınız şifreli. Kart bilgisi istenmez.
          </p>
        </div>
      </div>

      <aside aria-label="Sipariş özeti" className="order-first lg:order-none lg:col-span-5">
        <div className="rounded-buyuk border border-cizgi bg-kagit-2 p-5 sm:p-6 lg:sticky lg:top-[calc(var(--ust-menu)+1.5rem)]">
          <div className="flex items-baseline justify-between">
            <h2 className="font-sans text-lg font-semibold">Sipariş özeti</h2>
            <Link href="/sepet" className="text-sm underline">
              Düzenle
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-cizgi border-y border-cizgi">
            {satirlar.map((s) => {
              const urun = urunBul(s.slug);
              if (!urun) return null;
              const kapak = urun.gorseller[0];
              return (
                <li key={s.slug} className="flex items-center gap-4 py-3">
                  <div className="studyo-zemin stand-kosesi relative size-14 shrink-0 overflow-hidden">
                    <Image src={kapak.src} alt="" fill sizes="56px" className="object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug font-medium">{urun.ad}</p>
                    <p className="sayilar text-sm text-soluk">{s.adet} adet</p>
                  </div>
                  <p className="sayilar text-sm font-medium">{tl(urun.fiyat * s.adet)}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <SepetTutarlari satirlar={satirlar} />
          </div>
          <p className="mt-4 text-sm text-soluk">
            {adet} ürün · Ödemeniz geçince {TICARI.kargoyaVerilis} içinde kargoda.
          </p>
        </div>
      </aside>
    </form>
  );
}
