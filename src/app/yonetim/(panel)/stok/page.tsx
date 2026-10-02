import { URUNLER, satilabilirAdet } from "@/magaza/urunler";
import { stokOkuSenkron } from "@/sunucu/stok";
import { yonetimGerekli } from "@/sunucu/yonetim-oturum";
import { StokFormu } from "./StokFormu";

export default async function Stok() {
  await yonetimGerekli();
  const stok = stokOkuSenkron();
  return (
    <>
      <h1 className="font-sans text-3xl font-semibold tracking-tight [font-stretch:100%]">Stok</h1>
      <p className="mt-1 max-w-[60ch] text-murekkep-2">
        Stok pano türüne göre tutulur. İkili set bir Google ve bir Instagram panosu düşer. Sipariş verilince stok
        düşer, iptal edilince geri eklenir.
      </p>

      <StokFormu google={stok.google} instagram={stok.instagram} />

      <h2 className="mt-12 font-sans text-lg font-semibold [font-stretch:100%]">Şu an satılabilir</h2>
      <ul className="mt-3 max-w-xl divide-y divide-cizgi border-y border-cizgi">
        {URUNLER.map((u) => (
          <li key={u.slug} className="flex justify-between py-3">
            <span>{u.ad}</span>
            <span className="sayilar font-medium">{satilabilirAdet(u, stok)} adet</span>
          </li>
        ))}
      </ul>
    </>
  );
}
