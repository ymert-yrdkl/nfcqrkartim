import { Plus } from "@phosphor-icons/react/dist/ssr";
import type { Soru } from "@/icerik/sss";

// Konuşur gibi SSS: her soru bir <details>, açılınca yumuşak genişler.
export function SoruListesi({ sorular, baslikSeviyesi = 3 }: { sorular: Soru[]; baslikSeviyesi?: 2 | 3 }) {
  const Baslik = baslikSeviyesi === 2 ? "h2" : "h3";
  return (
    <div className="divide-y divide-cizgi border-y border-cizgi">
      {sorular.map((s) => (
        <details key={s.soru} className="akordeon group">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4">
            <Baslik className="font-sans text-lg font-semibold tracking-normal">{s.soru}</Baslik>
            <span className="arti inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-cerceve group-hover:border-murekkep">
              <Plus size={16} weight="bold" aria-hidden="true" />
            </span>
          </summary>
          <div className="max-w-[65ch] space-y-3 pb-6 text-murekkep-2">
            {s.cevap.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
