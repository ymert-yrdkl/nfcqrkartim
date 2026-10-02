import { UrunResmi } from "@/bilesenler/UrunResmi";
import { GORSEL } from "@/gorseller";
import { TEKNIK_OZELLIKLER } from "@/magaza/urunler";

export function OzellikTablosu() {
  return (
    <dl className="divide-y divide-cizgi border-y border-cizgi">
      {TEKNIK_OZELLIKLER.map((o) => (
        <div key={o.ad} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
          <dt className="etiket pt-1 text-soluk">{o.ad}</dt>
          <dd>{o.deger}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Ozellikler() {
  return (
    <section aria-labelledby="ozellik-baslik" className="kabuk grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
      <div className="lg:col-span-5">
        <h2 id="ozellik-baslik" className="text-bolum">
          Teknik ayrıntılar
        </h2>
        <p className="mt-4 text-lg text-murekkep-2">
          Kasada, resepsiyonda ya da masada durur. Parlak pleksi yüzeyi nemli bezle silinir.
        </p>
        <figure className="mt-10">
          <UrunResmi gorsel={GORSEL.googleParcalar} sizes="(min-width: 64rem) 30rem, 100vw" className="aspect-[4/5] w-full" />
          <figcaption className="mt-3 text-sm text-soluk">
            Pano, alt kenarındaki tırnakla tabandaki yuvaya oturur.
          </figcaption>
        </figure>
      </div>
      <div className="lg:col-span-7 lg:pt-2">
        <OzellikTablosu />
      </div>
    </section>
  );
}
