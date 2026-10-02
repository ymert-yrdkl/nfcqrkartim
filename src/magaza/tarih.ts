// Tarihler her yerde Türkiye saatiyle gösterilir.

const gun = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });
const gunSaat = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});
const kisa = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export const tarih = (iso: string) => gun.format(new Date(iso));
export const tarihSaat = (iso: string) => gunSaat.format(new Date(iso));
export const kisaTarih = (iso: string) => kisa.format(new Date(iso));

export function gunEkle(iso: string, gunSayisi: number): string {
  return new Date(new Date(iso).getTime() + gunSayisi * 86_400_000).toISOString();
}
