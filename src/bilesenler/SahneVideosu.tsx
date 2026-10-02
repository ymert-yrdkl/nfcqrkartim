"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";

// Sessiz, döngülü dikey sahne videosu. Yalnız ekrandayken oynar; "hareketi azalt" tercihinde kendiliğinden
// başlamaz. Durdur/oynat düğmesi her zaman var (otomatik hareket 5 saniyeden uzun).
export function SahneVideosu({
  src,
  poster,
  etiket,
  odak = "50% 50%",
  className = "",
}: {
  src: string;
  poster: string;
  etiket: string;
  odak?: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [oynuyor, setOynuyor] = useState(false);
  const kullaniciDurdurdu = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gozcu = new IntersectionObserver(
      ([g]) => {
        if (g.isIntersecting && !azalt && !kullaniciDurdurdu.current) v.play().catch(() => {});
        else if (!g.isIntersecting) v.pause();
      },
      { threshold: 0.35 },
    );
    gozcu.observe(v);
    return () => gozcu.disconnect();
  }, []);

  function degistir() {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      kullaniciDurdurdu.current = false;
      v.play().catch(() => {});
    } else {
      kullaniciDurdurdu.current = true;
      v.pause();
    }
  }

  return (
    <div className={`relative overflow-hidden bg-kagit-3 ${className}`}>
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={etiket}
        onPlay={() => setOynuyor(true)}
        onPause={() => setOynuyor(false)}
        className="size-full object-cover"
        style={{ objectPosition: odak }}
      />
      <button
        type="button"
        onClick={degistir}
        className="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center rounded-full bg-kagit-2/90 text-murekkep backdrop-blur-sm hover:bg-kagit-2"
        aria-label={oynuyor ? "Videoyu durdur" : "Videoyu oynat"}
      >
        {oynuyor ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
      </button>
    </div>
  );
}
