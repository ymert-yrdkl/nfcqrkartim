"use client";

import Link from "next/link";
import { useEffect } from "react";
import { dugmeSinifi } from "@/bilesenler/dugme";

// Mağaza sayfalarında beklenmeyen hata. En sık neden: site yeni sürüme geçerken eski sekmeden işlem yapılması.
export default function Hata({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="kabuk pt-16 pb-24">
      <p className="etiket text-soluk">Bir sorun çıktı</p>
      <h1 className="mt-4 text-bolum">Sayfa yüklenemedi.</h1>
      <p className="mt-4 max-w-[52ch] text-lg text-murekkep-2">
        Site az önce güncellenmiş olabilir. Sayfayı yenileyip tekrar deneyin; sepetiniz tarayıcınızda duruyor.
        Sorun sürerse İletişim sayfasından bize yazın.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => window.location.reload()} className={dugmeSinifi("birincil", "buyuk")}>
          Sayfayı yenile
        </button>
        <button type="button" onClick={() => retry()} className={dugmeSinifi("cizgili", "buyuk")}>
          Tekrar dene
        </button>
        <Link href="/iletisim" className={dugmeSinifi("sade", "buyuk")}>
          İletişim
        </Link>
      </div>
      {error.digest && <p className="mt-8 font-mono text-xs text-soluk">Hata kodu: {error.digest}</p>}
    </div>
  );
}
