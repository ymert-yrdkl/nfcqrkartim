import Image from "next/image";
import type { Gorsel } from "@/gorseller";

// Ürün görseli çerçevesi. Şeffaf render'lar stüdyo degradesinde bütünüyle görünür, sahne görselleri
// kırpılarak doldurur (odak noktası ürünün üstünde kalır). Çerçeve ürünün silueti gibi: yalnız üst köşeler yuvarlak.
export function UrunResmi({
  gorsel,
  sizes,
  className = "",
  oncelikli = false,
  kose = "stand",
}: {
  gorsel: Gorsel;
  sizes: string;
  className?: string;
  oncelikli?: boolean;
  kose?: "stand" | "orta" | "yok";
}) {
  const koseSinifi = kose === "stand" ? "stand-kosesi" : kose === "orta" ? "rounded-orta" : "";
  return (
    <div className={`relative overflow-hidden ${gorsel.zemin === "seffaf" ? "studyo-zemin" : "bg-kagit-3"} ${koseSinifi} ${className}`}>
      <Image
        src={gorsel.src}
        alt={gorsel.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        fetchPriority={oncelikli ? "high" : undefined}
        loading={oncelikli ? "eager" : "lazy"}
        className={gorsel.zemin === "seffaf" ? "object-contain" : "object-cover"}
        style={{ objectPosition: gorsel.odak ?? "50% 50%" }}
      />
    </div>
  );
}
