// Para her yerde kuruş (tam sayı) olarak tutulur; yalnız gösterirken TL'ye çevrilir.

const tamSayi = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const kesirli = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 54900 -> "549 TL", 54950 -> "549,50 TL"
export function tl(kurus: number): string {
  const lira = kurus / 100;
  const metin = Number.isInteger(lira) ? tamSayi.format(lira) : kesirli.format(lira);
  return `${metin} TL`;
}

// Havale açıklaması ve IBAN ekranı için her zaman iki ondalık: "949,00"
export function tlKesirli(kurus: number): string {
  return `${kesirli.format(kurus / 100)} TL`;
}
