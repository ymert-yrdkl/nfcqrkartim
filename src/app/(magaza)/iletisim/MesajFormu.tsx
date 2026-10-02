"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { Alan, alanBaglari, kutuSinifi } from "@/bilesenler/form";
import { mesajGonder, type MesajDurumu } from "./eylem";

export function MesajFormu() {
  const [durum, gonder, bekliyor] = useActionState<MesajDurumu, FormData>(mesajGonder, null);
  const h = durum?.hatalar ?? {};
  const basari = useRef<HTMLDivElement>(null);

  // Form başarı kutusuyla yer değiştirince odak kaybolmasın.
  useEffect(() => {
    if (durum?.tamam) basari.current?.focus();
  }, [durum]);

  if (durum?.tamam) {
    return (
      <div ref={basari} tabIndex={-1} role="status" className="rounded-buyuk border border-cizgi bg-kagit-2 p-7 focus:outline-none">
        <p className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle size={22} weight="fill" className="text-basari" aria-hidden="true" /> Mesajınız bize ulaştı.
        </p>
        <p className="mt-2 text-murekkep-2">Yazdığınız telefon ya da e-postadan size döneceğiz.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const veri = new FormData(e.currentTarget);
        startTransition(() => gonder(veri));
      }}
      className="rounded-buyuk border border-cizgi bg-kagit-2 p-6 sm:p-8"
    >
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Web siteniz
          <input type="text" name="web_sitesi" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <Alan ad="ad" etiket="Adınız" hata={h.ad}>
          <input {...alanBaglari("ad", h.ad)} autoComplete="name" className={`${kutuSinifi} h-12`} />
        </Alan>
        <Alan ad="iletisim" etiket="Telefon ya da e-posta" hata={h.iletisim}>
          <input {...alanBaglari("iletisim", h.iletisim)} autoComplete="email" className={`${kutuSinifi} h-12`} />
        </Alan>
        <Alan ad="konu" etiket="Konu" className="sm:col-span-2">
          <select id="konu" name="konu" defaultValue="soru" className={`${kutuSinifi} h-12`}>
            <option value="soru">Ürünle ilgili soru</option>
            <option value="toplu">Toplu / çok şubeli alım</option>
            <option value="siparis">Verdiğim sipariş</option>
            <option value="diger">Diğer</option>
          </select>
        </Alan>
        <Alan ad="metin" etiket="Mesajınız" hata={h.metin} className="sm:col-span-2">
          <textarea {...alanBaglari("metin", h.metin)} rows={5} maxLength={2000} className={`${kutuSinifi} min-h-32 resize-y py-3`} />
        </Alan>
      </div>
      {durum?.genel && (
        <p role="alert" className="mb-4 rounded-orta border border-hata bg-hata-zemin p-3 text-sm">
          {durum.genel}
        </p>
      )}
      <button type="submit" disabled={bekliyor} className={dugmeSinifi("koyu", "buyuk")}>
        {bekliyor ? "Gönderiliyor…" : "Mesajı gönder"}
      </button>
    </form>
  );
}
