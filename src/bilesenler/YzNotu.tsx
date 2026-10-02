import { YZ_NOTU } from "@/gorseller";

export function YzNotu({ className = "" }: { className?: string }) {
  return <p className={`text-xs text-soluk ${className}`}>{YZ_NOTU}</p>;
}
