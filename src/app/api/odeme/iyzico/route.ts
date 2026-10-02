import { NextResponse } from "next/server";
import { SITE } from "@/magaza/ayarlar";
import { kartOdemesiniSonuclandir } from "@/sunucu/kart-odeme";
import { erisimCerezi } from "@/sunucu/siparis";

// iyzico ödeme sayfasından dönüş: tarayıcı buraya POST ile yalnız "token" getirir. Karar token'ın
// sunucudan sorgulanan sonucuna göre verilir (gelen form verisine güvenilmez).

function adres(yol: string, istek: Request) {
  const kok = process.env.NODE_ENV === "production" ? SITE.adres : new URL(istek.url).origin;
  return new URL(yol, kok);
}

export async function POST(istek: Request) {
  const form = await istek.formData().catch(() => null);
  const token = String(form?.get("token") ?? "");
  if (!token || token.length > 200) {
    return NextResponse.redirect(adres("/odeme?odeme=hata", istek), 303);
  }

  try {
    const sonuc = await kartOdemesiniSonuclandir(token);
    if (sonuc.durum === "basarisiz" && !sonuc.no) {
      return NextResponse.redirect(adres("/odeme?odeme=hata", istek), 303);
    }
    if (sonuc.durum === "basarisiz" && sonuc.no) {
      const yol = `/odeme?odeme=basarisiz&neden=${encodeURIComponent(sonuc.neden.slice(0, 160))}`;
      return NextResponse.redirect(adres(yol, istek), 303);
    }
    // Ödendi ya da incelemede: sipariş sayfasına; bu tarayıcıya bir günlük erişim çerezi.
    const yanit = NextResponse.redirect(adres(`/siparis/${sonuc.no}?yeni=1&odeme=kart`, istek), 303);
    yanit.cookies.set(`siparis_${sonuc.no}`, erisimCerezi(sonuc.no!, "alici", 60 * 60 * 24), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return yanit;
  } catch (hata) {
    console.error("iyzico dönüşü işlenemedi:", hata);
    return NextResponse.redirect(adres("/odeme?odeme=hata", istek), 303);
  }
}

// Biri adresi doğrudan açarsa
export function GET(istek: Request) {
  return NextResponse.redirect(adres("/", istek), 303);
}
