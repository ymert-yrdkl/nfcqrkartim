"use client";

import { startTransition, useActionState } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { Alan, kutuSinifi } from "@/bilesenler/form";
import { siparisSorgula, type SorguDurumu } from "./eylem";

export function SorguFormu() {
  const [durum, gonder, bekliyor] = useActionState<SorguDurumu, FormData>(siparisSorgula, null);
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const veri = new FormData(e.currentTarget);
        startTransition(() => gonder(veri));
      }}
      className="mt-10 max-w-md"
    >
      <Alan ad="no" etiket="Sipariş numarası" yardim="Sipariş onay sayfasında yazar, ör. NQ-482913.">
        <input
          id="no"
          name="no"
          required
          autoComplete="off"
          placeholder="NQ-000000"
          aria-describedby="no-aciklama"
          className={`${kutuSinifi} h-12 font-mono uppercase`}
        />
      </Alan>
      <Alan ad="telefon" etiket="Telefonun son 4 hanesi" yardim="Siparişte yazdığınız telefon.">
        <input
          id="telefon"
          name="telefon"
          required
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          aria-describedby="telefon-aciklama"
          className={`${kutuSinifi} h-12 w-40 font-mono`}
        />
      </Alan>
      {durum?.hata && (
        <p role="alert" className="mb-4 rounded-orta border border-hata bg-hata-zemin p-3 text-sm">
          {durum.hata}
        </p>
      )}
      <button type="submit" disabled={bekliyor} className={dugmeSinifi("koyu", "buyuk")}>
        {bekliyor ? "Aranıyor…" : "Siparişi göster"}
      </button>
    </form>
  );
}
