// Logo: QR'ın köşe gözü (kare içinde kare) + NFC dalgası (iki yay). Renk currentColor.

export function LogoIsaret({ className = "", vurgu = false }: { className?: string; vurgu?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <rect x="2.5" y="12.5" width="17" height="17" rx="4" stroke="currentColor" strokeWidth="3" />
      <rect
        x="7.5"
        y="17.5"
        width="7"
        height="7"
        rx="1.5"
        fill={vurgu ? "var(--color-sinyal)" : "currentColor"}
      />
      <path d="M17.83 7.81A9 9 0 0 1 24.19 14.17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M19.12 2.98A14 14 0 0 1 29.02 12.88" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "", vurgu = false }: { className?: string; vurgu?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoIsaret className="size-7 shrink-0" vurgu={vurgu} />
      <span className="font-baslik text-[1.3rem] leading-none font-bold tracking-[-0.03em]">
        nfcqrkartim
      </span>
    </span>
  );
}
