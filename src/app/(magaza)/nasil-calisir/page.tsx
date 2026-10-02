import type { Metadata } from "next";
import Link from "next/link";
import { dugmeSinifi } from "@/bilesenler/dugme";
import { UrunResmi } from "@/bilesenler/UrunResmi";
import { YzNotu } from "@/bilesenler/YzNotu";
import { Anatomi } from "@/bilesenler/vitrin/Anatomi";
import { DinamikQr } from "@/bilesenler/vitrin/DinamikQr";
import { Kurulum } from "@/bilesenler/vitrin/Kurulum";
import { Ozellikler } from "@/bilesenler/vitrin/Ozellikler";
import { GORSEL } from "@/gorseller";
import { TICARI } from "@/magaza/ayarlar";

export const metadata: Metadata = {
  title: "Nasıl çalışır",
  description:
    "Müşteriniz telefonunu yaklaştırır ya da QR'ı okutur, Google yorum sayfanız veya Instagram profiliniz açılır. Kurulum ve dinamik QR adım adım.",
  alternates: { canonical: "/nasil-calisir" },
};

const BAGLANTI_REHBERI = [
  {
    baslik: "Google yorum bağlantınız",
    adimlar: [
      "Google'da işletme hesabınızla oturum açın ve işletmenizin adını aratın.",
      "Çıkan yönetim panelinde \"Yorum isteyin\" (ya da \"Daha fazla yorum alın\") düğmesine dokunun.",
      "Gösterilen bağlantıyı kopyalayın. Bu bağlantı müşterinizi doğrudan yıldız verme penceresine götürür.",
    ],
  },
  {
    baslik: "Instagram profil adresiniz",
    adimlar: [
      "Adresiniz instagram.com/ ile kullanıcı adınızın birleşimidir, ör. instagram.com/ornekkafe.",
      "Profilinizde \"Profili paylaş\" ile çıkan bağlantıyı da kullanabilirsiniz.",
      "Kullanıcı adınızı değiştirirseniz standın bağlantısını panelden güncelleyin.",
    ],
  },
];

export default function NasilCalisir() {
  return (
    <>
      <section className="kabuk grid items-end gap-10 pt-10 pb-6 lg:grid-cols-12 lg:pt-14">
        <div className="lg:col-span-7">
          <h1 className="text-dev [font-stretch:84%]">Nasıl çalışır?</h1>
          <p className="mt-5 max-w-[52ch] text-lg text-murekkep-2">
            Müşteriniz telefonunu standa yaklaştırır ya da QR&apos;ı okutur; sizin seçtiğiniz sayfa açılır.
            Müşterinizin uygulama indirmesi ya da işletmenizi araması gerekmez.
          </p>
        </div>
        <figure className="lg:col-span-5">
          <UrunResmi gorsel={GORSEL.googleYakin} oncelikli sizes="(min-width: 64rem) 30rem, 100vw" className="aspect-[4/5] w-full" />
          <figcaption>
            <YzNotu className="mt-3" />
          </figcaption>
        </figure>
      </section>

      <Anatomi />
      <DinamikQr />
      <Kurulum />

      <section aria-labelledby="rehber-baslik" className="kabuk py-20 lg:py-28">
        <h2 id="rehber-baslik" className="max-w-2xl text-bolum">
          Kurulumdan önce bağlantınızı hazırlayın.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          {BAGLANTI_REHBERI.map((r) => (
            <div key={r.baslik}>
              <h3 className="font-sans text-xl font-semibold tracking-tight [font-stretch:100%]">{r.baslik}</h3>
              <ol className="mt-4 space-y-3">
                {r.adimlar.map((a, i) => (
                  <li key={a} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <span className="font-mono text-sm leading-7 text-soluk">{i + 1}.</span>
                    <span className="text-murekkep-2">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <Ozellikler />

      <section className="kabuk pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-buyuk bg-murekkep p-8 text-kagit sm:flex-row sm:items-center sm:p-10">
          <p className="max-w-[30ch] font-baslik text-2xl font-semibold tracking-tight [font-stretch:88%]">
            Standınızı seçin, ödemeden sonra {TICARI.kargoyaVerilis} içinde kargoda.
          </p>
          <Link href="/urunler" className={dugmeSinifi("birincil", "buyuk")}>
            Standları gör
          </Link>
        </div>
      </section>
    </>
  );
}
