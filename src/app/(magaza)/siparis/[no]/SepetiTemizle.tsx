"use client";

import { useEffect } from "react";
import { sepetiBosalt } from "@/bilesenler/sepet/sepet-deposu";

// Sipariş tamamlanınca sepeti boşaltır ve adresten "yeni=1"i siler; böylece saklanan bağlantı sonradan
// açılınca o anki sepet silinmez.
export function SepetiTemizle() {
  useEffect(() => {
    sepetiBosalt();
    const adres = new URL(window.location.href);
    adres.searchParams.delete("yeni");
    window.history.replaceState(window.history.state, "", adres.pathname + adres.search);
  }, []);
  return null;
}
