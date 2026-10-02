"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PanelMenusu({ okunmamis }: { okunmamis: number }) {
  const yol = usePathname();
  const baglantilar = [
    { href: "/yonetim", ad: "Siparişler", aktif: yol === "/yonetim" || yol.startsWith("/yonetim/siparis") },
    { href: "/yonetim/stok", ad: "Stok", aktif: yol === "/yonetim/stok" },
    { href: "/yonetim/mesajlar", ad: okunmamis > 0 ? `Mesajlar (${okunmamis})` : "Mesajlar", aktif: yol === "/yonetim/mesajlar" },
  ];
  return (
    <nav aria-label="Yönetim menüsü">
      <ul className="flex gap-1">
        {baglantilar.map((b) => (
          <li key={b.href}>
            <Link
              href={b.href}
              aria-current={b.aktif ? "page" : undefined}
              className="inline-flex h-11 items-center rounded-full px-3 text-sm text-murekkep-2 hover:text-murekkep aria-[current=page]:bg-kagit-3 aria-[current=page]:font-semibold aria-[current=page]:text-murekkep"
            >
              {b.ad}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
