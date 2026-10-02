import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { KURULUM_PANELI } from "@/magaza/ayarlar";

export const KURULUM_ADIMLARI = [
  { baslik: "Panoyu tabana takın", metin: "Pano, tabandaki yuvaya oturur. Alet gerekmez." },
  {
    baslik: "Kendi telefonunuzla okutun",
    metin: "Stand henüz kurulmadığı için kurulum sayfası açılır ve sizi giriş yapmaya çağırır.",
  },
  {
    baslik: "Bağlantınızı seçin",
    metin: "Google yorum bağlantınızı ya da Instagram profil adresinizi yapıştırıp kaydedin.",
  },
  { baslik: "Kasaya koyun", metin: "Bir kez daha okutun. Artık sizin sayfanız açılıyor." },
];

export function Kurulum({ baslikSeviyesi = 2 }: { baslikSeviyesi?: 2 | 3 }) {
  const Baslik = baslikSeviyesi === 2 ? "h2" : "h3";
  return (
    <section aria-labelledby="kurulum-baslik" className="border-y border-cizgi bg-kagit-2">
      <div className="kabuk py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Baslik id="kurulum-baslik" className="text-bolum">
              Kutudan kasaya dört adım.
            </Baslik>
            <p className="mt-4 text-lg text-murekkep-2">Kurulum birkaç dakika sürer, teknik bilgi gerekmez.</p>
          </div>
          <a href={KURULUM_PANELI} className={dugmeSinifi("cizgili", "orta", "gap-1.5")}>
            Kurulum panelini aç
            <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-orta bg-cizgi sm:grid-cols-2 lg:grid-cols-4">
          {KURULUM_ADIMLARI.map((a, i) => (
            <li key={a.baslik} className="bg-kagit-2 p-6 pb-8">
              <span className="block font-baslik text-5xl leading-none font-semibold tracking-tight text-cizgi-koyu" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-12 font-sans text-lg font-semibold">{a.baslik}</h3>
              <p className="mt-2 text-murekkep-2">{a.metin}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
