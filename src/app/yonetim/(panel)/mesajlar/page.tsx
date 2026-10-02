import { tarihSaat } from "@/magaza/tarih";
import { KONULAR, mesajlariListele } from "@/sunucu/mesaj";
import { yonetimGerekli } from "@/sunucu/yonetim-oturum";
import { mesajiOkunduYap } from "../../eylemler";

export default async function Mesajlar() {
  await yonetimGerekli();
  const mesajlar = mesajlariListele();
  return (
    <>
      <h1 className="font-sans text-3xl font-semibold tracking-tight [font-stretch:100%]">Mesajlar</h1>
      <p className="mt-1 text-murekkep-2">İletişim sayfasından gelen mesajlar. Yanıtı telefon ya da e-postayla verin.</p>

      {mesajlar.length === 0 ? (
        <div className="mt-8 rounded-buyuk border border-cizgi bg-kagit-2 p-8">
          <p className="font-medium">Henüz mesaj yok.</p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {mesajlar.map((m) => (
            <li
              key={m.id}
              className={`rounded-buyuk border bg-kagit-2 p-5 ${m.okundu ? "border-cizgi" : "border-murekkep"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-semibold">
                  {m.ad} <span className="font-normal text-murekkep-2">· {m.iletisim}</span>
                </p>
                <p className="sayilar text-sm text-soluk">{tarihSaat(m.olusturma)}</p>
              </div>
              <p className="etiket mt-2 text-soluk">{KONULAR[m.konu]}</p>
              <p className="mt-2 whitespace-pre-line">{m.metin}</p>
              {!m.okundu && (
                <form action={mesajiOkunduYap} className="mt-3">
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className="h-9 text-sm underline">
                    Okundu olarak işaretle
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
