// Form parçaları: etiket üstte, yardım metni altta, hata yardımın yerine geçer (satır yüksekliği sabit).

export const kutuSinifi =
  "w-full rounded-orta border border-cerceve bg-kagit-2 px-3.5 text-base text-murekkep placeholder:text-soluk " +
  "transition-colors duration-[var(--sure-mikro)] hover:border-murekkep-2 " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-murekkep " +
  "aria-[invalid=true]:border-hata aria-[invalid=true]:bg-hata-zemin";

export function Alan({
  ad,
  etiket,
  hata,
  yardim,
  istege = false,
  children,
  className = "",
}: {
  ad: string;
  etiket: string;
  hata?: string;
  yardim?: string;
  istege?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={ad} className="flex items-baseline justify-between gap-3 text-sm font-medium">
        {etiket}
        {istege && <span className="font-normal text-soluk">İsteğe bağlı</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      <p
        id={`${ad}-aciklama`}
        className={`mt-1.5 min-h-5 text-sm ${hata ? "text-hata" : "text-soluk"}`}
        aria-live={hata ? "polite" : undefined}
      >
        {hata ?? yardim ?? ""}
      </p>
    </div>
  );
}

// Alanın erişilebilirlik bağları: açıklama satırı ve geçersizlik durumu.
export function alanBaglari(ad: string, hata?: string) {
  return {
    id: ad,
    name: ad,
    "aria-describedby": `${ad}-aciklama`,
    "aria-invalid": hata ? true : undefined,
  } as const;
}
