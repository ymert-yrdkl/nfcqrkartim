import { GORSEL } from "@/gorseller";
import { TICARI } from "@/magaza/ayarlar";
import { tl } from "@/magaza/para";
import { setAvantaji, urunBul, type UrunSlug } from "@/magaza/urunler";
import { UrunKarti } from "./UrunKarti";

export function UrunSecimi({ satilabilir, baslikSeviyesi = 2 }: { satilabilir: Record<UrunSlug, number>; baslikSeviyesi?: 1 | 2 }) {
  const set = urunBul("ikili-set")!;
  const google = urunBul("google-yorum-standi")!;
  const instagram = urunBul("instagram-takip-standi")!;
  const Baslik = baslikSeviyesi === 1 ? "h1" : "h2";

  return (
    <section aria-labelledby="urunler-baslik" className="kabuk py-20 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Baslik id="urunler-baslik" className={baslikSeviyesi === 1 ? "text-dev" : "text-bolum"}>
            Hangisi size uygun?
          </Baslik>
          <p className="mt-4 text-lg text-murekkep-2">
            Tek tek de alabilirsiniz, ikisini birlikte de. Fiyatlara KDV dahil,{" "}
            {TICARI.kargoUcreti === 0 ? "kargo ücretsiz." : "kargo ücreti ödemede yazar."}
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-7 lg:row-span-2">
          <UrunKarti
            urun={set}
            satilabilir={satilabilir[set.slug]}
            gorsel={GORSEL.kafeIkili2}
            buyuk
            sizes="(min-width: 64rem) 46rem, 100vw"
            ek={
              <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-kagit-3 px-3 py-1 text-sm">
                <span aria-hidden="true" className="size-2 rounded-full bg-basari" />
                İki tekliden <strong className="sayilar font-semibold">{tl(setAvantaji())}</strong> daha uygun
              </p>
            }
          />
        </div>
        <div className="lg:col-span-5">
          <UrunKarti urun={google} satilabilir={satilabilir[google.slug]} sizes="(min-width: 64rem) 32rem, 100vw" />
        </div>
        <div className="lg:col-span-5">
          <UrunKarti
            urun={instagram}
            satilabilir={satilabilir[instagram.slug]}
            sizes="(min-width: 64rem) 32rem, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
