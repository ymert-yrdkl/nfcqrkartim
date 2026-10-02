"use server";

import { redirect } from "next/navigation";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { iyzicoAcikMi } from "@/sunucu/iyzico";
import { kartOdemesiBaslat } from "@/sunucu/kart-odeme";
import { siparisiErisimleBul } from "@/sunucu/siparis-erisim";

// Ödemesi bekleyen siparişi kartla ödemek için iyzico ödeme sayfasını (yeniden) açar.
// Yalnız siparişi veren tarayıcı ya da onay bağlantısının sahibi yapabilir (maskeli erişim yetmez).
export async function kartlaOde(form: FormData) {
  const no = String(form.get("no") ?? "");
  const anahtar = String(form.get("t") ?? "") || null;
  const bulunan = await siparisiErisimleBul(no, anahtar);
  const geri = `/siparis/${no}${anahtar ? `?t=${encodeURIComponent(anahtar)}` : ""}`;
  if (!bulunan || bulunan.maskeli || !iyzicoAcikMi()) redirect(geri);

  const s = bulunan.siparis;
  if (s.durum !== "odeme_bekliyor" || s.odemeKimlik) redirect(geri);

  const ip = await istemciIp();
  if (hizSiniriAsildi(`kartla-ode:${ip ?? "?"}`, 8, 15 * 60_000)) redirect(`${geri}${anahtar ? "&" : "?"}odeme=sinir`);

  let sayfa: string;
  try {
    sayfa = await kartOdemesiBaslat(s);
  } catch (hata) {
    console.error("Kartla ödeme yeniden başlatılamadı:", hata);
    redirect(`${geri}${anahtar ? "&" : "?"}odeme=hata`);
  }
  redirect(sayfa);
}
