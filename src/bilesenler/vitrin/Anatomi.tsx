import { UrunResmi } from "@/bilesenler/UrunResmi";
import { GORSEL } from "@/gorseller";
import { ORNEK_KART_KODU } from "@/magaza/ayarlar";

// Açıklamalı ürün görseli: numaralı işaretler görselin üstünde, açıklamalar yanda (mobilde altta).
const PARCALAR = [
  {
    no: 1,
    x: "24%",
    y: "40%",
    baslik: "Telefonu yaklaştırın",
    metin: "NFC çip bu yarının arkasında. Telefon birkaç santim yaklaşınca bağlantı ekranda belirir.",
  },
  {
    no: 2,
    x: "62%",
    y: "45%",
    baslik: "Ya da kamerayla okutun",
    metin: "NFC'si kapalı ya da olmayan telefonlar için QR. Her telefonun kamerası okur.",
  },
  {
    no: 3,
    x: "36.5%",
    y: "80.5%",
    baslik: "Kart kodu",
    metin: `Her panonun altı haneli kendi kodu var (bu örnekte ${ORNEK_KART_KODU.google}). Kurulumda standınızı bu kodla tanırız.`,
  },
  {
    no: 4,
    x: "88%",
    y: "88%",
    baslik: "3 mm pleksi, sağlam taban",
    metin: "100 × 100 mm pano, 100 × 35 mm tabana oturur. Kasada bir kartvizitlikten fazla yer kaplamaz.",
  },
];

export function Anatomi() {
  return (
    <section aria-labelledby="anatomi-baslik" className="kabuk py-20 lg:py-28">
      <div className="max-w-2xl">
        <h2 id="anatomi-baslik" className="text-bolum">
          Dokunan da okutan da aynı sayfaya varır.
        </h2>
        <p className="mt-4 text-lg text-murekkep-2">
          Standın sol yarısında NFC çip, sağ yarısında QR kod var. İkisi de sizin seçtiğiniz bağlantıyı açar.
        </p>
      </div>

      <div className="mt-12 grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <figure className="relative lg:col-span-6">
          <UrunResmi
            gorsel={GORSEL.googleOn}
            sizes="(min-width: 64rem) 40rem, 100vw"
            className="aspect-square w-full"
          />
          {PARCALAR.map((p) => (
            <span
              key={p.no}
              aria-hidden="true"
              className="isaret absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-murekkep font-mono text-sm font-semibold text-sinyal shadow-[0_0_0_4px_var(--color-kagit-2)]"
              style={{ left: p.x, top: p.y, animationDelay: `${p.no * 120}ms` }}
            >
              {p.no}
            </span>
          ))}
        </figure>

        <ol className="divide-y divide-cizgi border-y border-cizgi lg:col-span-6 xl:col-span-5 xl:col-start-8">
          {PARCALAR.map((p) => (
            <li key={p.no} className="grid grid-cols-[2rem_1fr] gap-4 py-5">
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full border border-murekkep font-mono text-sm font-semibold"
              >
                {p.no}
              </span>
              <div>
                <h3 className="font-sans text-base font-semibold">{p.baslik}</h3>
                <p className="mt-1 text-murekkep-2">{p.metin}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
