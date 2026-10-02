"use client";

import { startTransition, useActionState } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { kutuSinifi } from "@/bilesenler/form";
import { stokKaydet, type StokSonucu } from "../../eylemler";

export function StokFormu({ google, instagram }: { google: number; instagram: number }) {
  const [sonuc, gonder, bekliyor] = useActionState<StokSonucu, FormData>(stokKaydet, null);
  return (
    <form
      key={`${google}-${instagram}`}
      onSubmit={(e) => {
        e.preventDefault();
        const veri = new FormData(e.currentTarget);
        startTransition(() => gonder(veri));
      }}
      className="mt-8 max-w-xl rounded-buyuk border border-cizgi bg-kagit-2 p-6"
    >
      <input type="hidden" name="google_eski" value={google} />
      <input type="hidden" name="instagram_eski" value={instagram} />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Google panosu
          <input name="google" type="number" min={0} defaultValue={google} className={`${kutuSinifi} sayilar mt-1.5 h-12`} />
        </label>
        <label className="text-sm font-medium">
          Instagram panosu
          <input name="instagram" type="number" min={0} defaultValue={instagram} className={`${kutuSinifi} sayilar mt-1.5 h-12`} />
        </label>
      </div>
      {sonuc?.hata && (
        <p role="alert" className="mt-4 rounded-orta border border-hata bg-hata-zemin p-3 text-sm">
          {sonuc.hata}
        </p>
      )}
      {sonuc?.tamam && (
        <p role="status" className="mt-4 text-sm text-basari">
          Stok kaydedildi.
        </p>
      )}
      <button type="submit" disabled={bekliyor} className={dugmeSinifi("koyu", "orta", "mt-6")}>
        {bekliyor ? "Kaydediliyor…" : "Stoğu kaydet"}
      </button>
    </form>
  );
}
