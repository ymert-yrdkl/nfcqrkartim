"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

// Panoya kopyalar; etiket 2,5 saniye "Kopyalandı" olur (bildirim penceresi yok).
export function Kopyala({ metin, etiket }: { metin: string; etiket: string }) {
  const [oldu, setOldu] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(metin);
          setOldu(true);
          setTimeout(() => setOldu(false), 2500);
        } catch {
          // Pano izni yoksa kullanıcı metni elle seçebilir.
        }
      }}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-cerceve px-3 text-sm transition-colors duration-[var(--sure-mikro)] hover:border-murekkep hover:bg-kagit-3"
      aria-label={oldu ? `${etiket} kopyalandı` : `${etiket} kopyala`}
    >
      {oldu ? <Check size={14} weight="bold" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span aria-live="polite">{oldu ? "Kopyalandı" : "Kopyala"}</span>
    </button>
  );
}
