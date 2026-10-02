// Düğme sınıfları tek yerde. <button>, <Link> ve <a> aynı görünür.
// birincil: sinyal yeşili dolgu (sayfada tek ana eylem) · koyu: mürekkep dolgu · cizgili: kenarlıklı
// sade: yalnız metin + ok (tipografik bağlantı)

export type DugmeTuru = "birincil" | "koyu" | "cizgili" | "sade" | "gece";
export type DugmeBoyu = "kucuk" | "orta" | "buyuk";

const TEMEL =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none " +
  "transition-[background-color,color,border-color,transform] duration-[var(--sure-mikro)] ease-[var(--ease-cikis)] " +
  "active:translate-y-px disabled:opacity-55 disabled:active:translate-y-0 aria-disabled:opacity-55";

const TUR: Record<DugmeTuru, string> = {
  birincil: "bg-sinyal text-murekkep hover:bg-sinyal-2 rounded-full",
  koyu: "bg-murekkep text-kagit-2 hover:bg-murekkep-2 rounded-full",
  cizgili: "border border-cerceve text-murekkep hover:border-murekkep hover:bg-kagit-3 rounded-full",
  sade: "text-murekkep underline-offset-4 hover:underline decoration-1",
  gece: "border border-gece-cizgi text-kagit hover:border-gece-soluk hover:bg-gece-2 rounded-full",
};

const BOY: Record<DugmeBoyu, string> = {
  kucuk: "h-9 px-4 text-sm",
  orta: "h-11 px-5 text-[0.95rem]",
  buyuk: "h-13 px-7 text-base",
};

export function dugmeSinifi(tur: DugmeTuru = "birincil", boy: DugmeBoyu = "orta", ek = ""): string {
  const boyut = tur === "sade" ? "h-11 text-[0.95rem]" : BOY[boy];
  return `${TEMEL} ${TUR[tur]} ${boyut} ${ek}`.trim();
}
