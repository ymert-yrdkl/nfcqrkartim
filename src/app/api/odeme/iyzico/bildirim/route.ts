import { iyzicoAcikMi, bildirimImzasiDogruMu } from "@/sunucu/iyzico";
import { hizSiniriAsildi, istemciIp } from "@/sunucu/istek";
import { kartOdemesiniSonuclandir } from "@/sunucu/kart-odeme";

// iyzico webhook'u (iyzico paneli › Üye işyeri ayarları › Bildirimler: https://<site>/api/odeme/iyzico/bildirim).
// Müşteri ödedikten sonra tarayıcısını kapatsa bile sipariş onaylansın diye. Bildirim yalnız "bu token'ı
// yeniden sorgula" anlamına gelir; karar her zaman iyzico'dan sorgulanan sonuca göre verilir.

type Bildirim = {
  iyziEventType?: string;
  iyziPaymentId?: string | number;
  token?: string;
  paymentConversationId?: string;
  status?: string;
};

export async function POST(istek: Request) {
  if (!iyzicoAcikMi()) return new Response(null, { status: 404 });
  const ip = await istemciIp();
  if (hizSiniriAsildi(`iyzico-bildirim:${ip ?? "?"}`, 60, 60_000)) return new Response(null, { status: 429 });

  const govde = (await istek.json().catch(() => null)) as Bildirim | null;
  if (!govde?.token || typeof govde.token !== "string" || govde.token.length > 200) {
    return Response.json({ tamam: false }, { status: 400 });
  }
  if (!bildirimImzasiDogruMu(govde, istek.headers.get("x-iyz-signature-v3"))) {
    console.warn("iyzico bildirimi: imza uyuşmadı, sonuç yine de iyzico'dan sorgulanacak", govde.paymentConversationId);
  }
  // Ara durumlar (3D Secure sürüyor vb.) için bir şey yapılmaz.
  if (govde.status !== "SUCCESS" && govde.status !== "FAILURE") return Response.json({ tamam: true });

  try {
    const sonuc = await kartOdemesiniSonuclandir(govde.token);
    return Response.json({ tamam: true, durum: sonuc.durum });
  } catch (hata) {
    console.error("iyzico bildirimi işlenemedi:", hata);
    // 2xx dışı yanıtta iyzico 15 dakika sonra yeniden dener.
    return Response.json({ tamam: false }, { status: 500 });
  }
}
