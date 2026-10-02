"use client";

import { useEffect } from "react";
import { sepetiBosalt } from "@/bilesenler/sepet/sepet-deposu";

// Sipariş tamamlanınca sepeti boşaltır (yalnız yeni sipariş sayfasında, bir kez).
export function SepetiTemizle() {
  useEffect(() => {
    sepetiBosalt();
  }, []);
  return null;
}
