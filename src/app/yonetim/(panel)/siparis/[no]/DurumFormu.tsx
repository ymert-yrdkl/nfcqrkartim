"use client";

import { startTransition, useActionState, useState } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { kutuSinifi } from "@/bilesenler/form";
import { DURUM_ADI, GECIS_ADI, ILERLEME, type SiparisDurumu } from "@/magaza/siparis-durumu";
import { durumGuncelle, type DurumSonucu } from "../../../eylemler";

// Siparişin geçebileceği durumlar için düğmeler. Geri dönüşler "Geri al" diye ayrı yazılır.
export function DurumFormu({
  no,
  durum,
  gecisler,
  kartlaOdendi,
}: {
  no: string;
  durum: SiparisDurumu;
  gecisler: SiparisDurumu[];
  kartlaOdendi: boolean;
}) {
  const [sonuc, gonder, bekliyor] = useActionState<DurumSonucu, FormData>(durumGuncelle, null);
  const [secilen, setSecilen] = useState<SiparisDurumu | null>(null);

  if (gecisler.length === 0) return <p className="text-murekkep-2">Bu sipariş kapandı; durumu değiştirilemez.</p>;

  const geriMi = (d: SiparisDurumu) => d !== "iptal" && ILERLEME.indexOf(d) < ILERLEME.indexOf(durum);
  const etiket = (d: SiparisDurumu) => (geriMi(d) ? `Geri al: ${DURUM_ADI[d]}` : GECIS_ADI[d]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {gecisler.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSecilen(d)}
            aria-pressed={secilen === d}
            className={dugmeSinifi(
              d === "iptal" ? "cizgili" : geriMi(d) ? "sade" : "koyu",
              "orta",
              `aria-pressed:outline-2 aria-pressed:outline-offset-2 aria-pressed:outline-murekkep ${d === "iptal" ? "text-hata" : ""}`,
            )}
          >
            {etiket(d)}
          </button>
        ))}
      </div>

      {secilen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const veri = new FormData(e.currentTarget);
            startTransition(() => {
              gonder(veri);
              setSecilen(null);
            });
          }}
          className="mt-5 space-y-4 rounded-orta border border-cizgi bg-kagit p-4"
        >
          <input type="hidden" name="no" value={no} />
          <input type="hidden" name="durum" value={secilen} />
          <p className="font-medium">{etiket(secilen)}</p>
          {secilen === "iptal" && kartlaOdendi && (
            <p className="rounded-orta border border-hata bg-hata-zemin p-3 text-sm">
              Bu sipariş kartla ödendi. İptalden sonra parayı iyzico üye işyeri panelinden iade edin; site iadeyi
              kendisi yapmaz.
            </p>
          )}
          {secilen === "iptal" && (
            <p className="text-sm text-murekkep-2">
              İptal edilince bu siparişteki ürünler stoğa geri eklenir. Gerekirse sonra &quot;Ödeme bekleniyor olarak
              geri al&quot; ile yeniden açılabilir (stok yeterliyse).
            </p>
          )}
          {secilen === "kargoda" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Kargo firması
                <input name="kargoFirmasi" className={`${kutuSinifi} mt-1.5 h-11`} />
              </label>
              <label className="text-sm font-medium">
                Takip numarası
                <input name="kargoTakip" required className={`${kutuSinifi} mt-1.5 h-11 font-mono`} />
              </label>
            </div>
          )}
          <label className="block text-sm font-medium">
            Not (müşteri sipariş sayfasında görmez)
            <input name="aciklama" maxLength={500} className={`${kutuSinifi} mt-1.5 h-11`} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={bekliyor} className={dugmeSinifi(secilen === "iptal" ? "koyu" : "birincil", "orta")}>
              {bekliyor ? "Kaydediliyor…" : "Onayla"}
            </button>
            <button type="button" onClick={() => setSecilen(null)} className={dugmeSinifi("sade", "orta")}>
              Vazgeç
            </button>
          </div>
        </form>
      )}
      {sonuc?.hata && (
        <p role="alert" className="mt-4 rounded-orta border border-hata bg-hata-zemin p-3 text-sm">
          {sonuc.hata}
        </p>
      )}
    </div>
  );
}
