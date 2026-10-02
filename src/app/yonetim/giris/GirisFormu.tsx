"use client";

import { startTransition, useActionState } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { kutuSinifi } from "@/bilesenler/form";
import { girisYap, type GirisDurumu } from "../eylemler";

export function GirisFormu() {
  const [durum, gonder, bekliyor] = useActionState<GirisDurumu, FormData>(girisYap, null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const veri = new FormData(e.currentTarget);
        startTransition(() => gonder(veri));
      }}
      className="mt-8 space-y-4"
    >
      <div>
        <label htmlFor="sifre" className="text-sm font-medium">
          Yönetici şifresi
        </label>
        <input
          id="sifre"
          name="sifre"
          type="password"
          autoComplete="current-password"
          required
          aria-describedby="sifre-hata"
          aria-invalid={durum?.hata ? true : undefined}
          className={`${kutuSinifi} mt-1.5 h-12`}
        />
        <p id="sifre-hata" className="mt-1.5 min-h-5 text-sm text-hata">
          {durum?.hata ?? ""}
        </p>
      </div>
      <button type="submit" disabled={bekliyor} className={dugmeSinifi("koyu", "buyuk", "w-full")}>
        {bekliyor ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
