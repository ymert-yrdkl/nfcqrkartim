import "server-only";
import { cookies } from "next/headers";
import { anahtarIleBul, cerezIleBul, type Siparis } from "./siparis";

// Müşterinin sipariş sayfasına erişimi: onay bağlantısındaki anahtar ya da siparişi veren tarayıcının
// çerezi → tam bilgi; sipariş sorgulamayla açılan çerez → kişisel bilgiler maskeli.
export async function siparisiErisimleBul(
  no: string,
  anahtar: string | undefined | null,
): Promise<{ siparis: Siparis; maskeli: boolean } | null> {
  if (!/^NQ-\d{6}$/.test(no)) return null;
  if (anahtar) {
    const s = anahtarIleBul(no, anahtar);
    if (s) return { siparis: s, maskeli: false };
  }
  const cerezler = await cookies();
  for (const ad of [`siparis_${no}`, `sorgu_${no}`]) {
    const deger = cerezler.get(ad)?.value;
    const bulunan = deger ? cerezIleBul(no, deger) : null;
    if (bulunan) return { siparis: bulunan.siparis, maskeli: bulunan.tur === "sorgu" };
  }
  return null;
}
