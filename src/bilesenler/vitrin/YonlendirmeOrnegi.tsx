"use client";

import { useState } from "react";

// Dinamik QR'ı anlatan küçük örnek: standdaki adres sabit, açılan sayfa seçilene göre değişir.
// Adresler örnektir (gerçek bir işletmeye ait değildir).
const HEDEFLER = [
  { ad: "Google yorumları", adres: "g.page/r/ornek-kafe/review", not: "Yıldız verme penceresi açılır." },
  { ad: "Instagram", adres: "instagram.com/ornekkafe", not: "Profil açılır, takip için tek dokunuş kalır." },
  { ad: "Menü", adres: "ornekkafe.com/menu", not: "Kampanya haftasında menüyü öne çıkarın." },
  { ad: "WhatsApp", adres: "wa.me/905000000000", not: "Sipariş ya da rezervasyon için mesaj ekranı açılır." },
] as const;

export function YonlendirmeOrnegi() {
  const [secili, setSecili] = useState(0);
  const hedef = HEDEFLER[secili];

  return (
    <div className="rounded-buyuk border border-gece-cizgi bg-gece-2 p-5 sm:p-7">
      <p className="etiket text-gece-soluk">Örnek</p>

      <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4">
        <span aria-hidden="true" className="mt-1.5 size-3 rounded-[3px] border-2 border-kagit" />
        <div>
          <p className="text-sm text-gece-soluk">Standdaki adres (hiç değişmez)</p>
          <p className="mt-1 font-mono text-[0.95rem] break-all text-kagit">
            ahmcloud.com/q/<span className="text-sinyal">KARTKODU</span>
          </p>
        </div>

        <span aria-hidden="true" className="mx-auto my-1 w-px border-l-2 border-dashed border-gece-cizgi" />
        <span aria-hidden="true" className="h-8" />

        <span aria-hidden="true" className="mt-1.5 size-3 rounded-full bg-sinyal" />
        <div>
          <p className="text-sm text-gece-soluk">Açılan sayfa (siz seçersiniz)</p>
          <p key={hedef.adres} className="degisim mt-1 font-mono text-[0.95rem] break-all text-kagit" aria-live="polite">
            {hedef.adres}
          </p>
          <p key={hedef.not} className="degisim mt-1 text-sm text-gece-soluk">
            {hedef.not}
          </p>
        </div>
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm text-gece-soluk">Açılacak sayfayı seçin</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {HEDEFLER.map((h, i) => (
            <label
              key={h.ad}
              className="relative inline-flex h-11 cursor-pointer items-center rounded-full border border-gece-cizgi px-4 text-sm text-kagit transition-colors duration-[var(--sure-mikro)] hover:border-gece-soluk has-[:checked]:border-sinyal has-[:checked]:bg-sinyal has-[:checked]:text-murekkep has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sinyal"
            >
              <input
                type="radio"
                name="hedef"
                value={i}
                checked={secili === i}
                onChange={() => setSecili(i)}
                className="sr-only"
              />
              {h.ad}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
