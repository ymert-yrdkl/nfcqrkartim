"use client";

import { Minus, Plus } from "@phosphor-icons/react";

// Adet seçici: eksi / sayı / artı. En az 1; sıfıra inmek için "Kaldır" kullanılır.
export function AdetSecici({
  adet,
  enCok,
  etiket,
  degisti,
}: {
  adet: number;
  enCok: number;
  etiket: string;
  degisti: (yeni: number) => void;
}) {
  const dugme =
    "inline-flex size-11 items-center justify-center text-murekkep transition-colors duration-[var(--sure-mikro)] hover:bg-kagit-3 disabled:text-cerceve disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={etiket}
      className="inline-flex h-11 items-center overflow-hidden rounded-full border border-cerceve bg-kagit-2"
    >
      <button
        type="button"
        className={dugme}
        onClick={() => degisti(adet - 1)}
        disabled={adet <= 1}
        aria-label="Bir azalt"
      >
        <Minus size={16} weight="bold" />
      </button>
      <output className="sayilar w-8 text-center font-medium" aria-live="polite">
        {adet}
      </output>
      <button
        type="button"
        className={dugme}
        onClick={() => degisti(adet + 1)}
        disabled={adet >= enCok}
        aria-label="Bir artır"
      >
        <Plus size={16} weight="bold" />
      </button>
    </div>
  );
}
