import { YonlendirmeOrnegi } from "./YonlendirmeOrnegi";

const GERCEKLER = [
  { baslik: "Yeniden baskı yok", metin: "Adres değişince stand olduğu gibi kalır." },
  { baslik: "Uygulama yok", metin: "Ne siz ne müşteriniz bir şey indirir." },
  { baslik: "Her stand ayrı", metin: "Setteki iki standın kodu da bağlantısı da ayrıdır." },
];

export function DinamikQr() {
  return (
    <section aria-labelledby="dinamik-baslik" className="koyu bg-gece text-kagit">
      <div className="kabuk grid gap-12 py-20 lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-28">
        <div className="lg:col-span-6">
          <p className="etiket text-sinyal">Dinamik QR</p>
          <h2 id="dinamik-baslik" className="mt-4 text-bolum">
            Baskı aynı kalır, açılan sayfayı siz değiştirirsiniz.
          </h2>
          <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-gece-soluk">
            QR ve NFC bir kez basılır. Hangi sayfayı açacağını kurulum panelinden seçersiniz: bugün Google
            yorumlarınız, kampanya haftasında menünüz. Değişiklik bir sonraki okutmada geçerli olur.
          </p>
        </div>
        <div className="lg:col-span-6">
          <YonlendirmeOrnegi />
        </div>

        <dl className="grid gap-px overflow-hidden rounded-orta bg-gece-cizgi sm:grid-cols-3 lg:col-span-12">
          {GERCEKLER.map((g) => (
            <div key={g.baslik} className="bg-gece p-5 sm:p-6">
              <dt className="font-semibold">{g.baslik}</dt>
              <dd className="mt-1 text-gece-soluk">{g.metin}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
