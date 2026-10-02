import type { Metadata } from "next";
import { Logo } from "@/bilesenler/Logo";
import { yonetimAcikMi } from "@/sunucu/yonetim-oturum";
import { GirisFormu } from "./GirisFormu";

export const metadata: Metadata = { title: "Yönetim girişi", robots: { index: false, follow: false } };

// Şifre ortam değişkeni çalışma anında okunur (derlemede dondurulmasın).
export const dynamic = "force-dynamic";

export default function YonetimGiris() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-10 font-sans text-2xl font-semibold tracking-tight [font-stretch:100%]">Yönetim</h1>
        {yonetimAcikMi() ? (
          <GirisFormu />
        ) : (
          <p className="mt-4 rounded-orta border border-cizgi bg-uyari-zemin p-4 text-sm">
            Yönetim paneli kapalı: sunucuda YONETICI_SIFRE ortam değişkeni (en az 8 karakter) tanımlı değil.
          </p>
        )}
      </div>
    </main>
  );
}
