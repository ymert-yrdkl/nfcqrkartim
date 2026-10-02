// Tasarım denetimi için ekran görüntüsü (sistemdeki Google Chrome ile).
//
//   node scripts/ekran.mjs <klasör> <yol>[@genişlik][!] ...
//   ör. node scripts/ekran.mjs .ekran / /urunler@390 /urun/ikili-set!
//   "!" ile biten yol yalnız ilk ekranı (viewport) çeker; yoksa sayfanın tamamı.
//
// Ortam: EKRAN_URL (varsayılan http://localhost:3100).

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const [klasor, ...yollar] = process.argv.slice(2);
if (!klasor || yollar.length === 0) {
  console.error("Kullanım: node scripts/ekran.mjs <klasör> <yol>[@genişlik][!] ...");
  process.exit(1);
}
const kok = process.env.EKRAN_URL ?? "http://localhost:3100";
mkdirSync(klasor, { recursive: true });

const tarayici = await chromium.launch({ channel: "chrome" });
try {
  const baglam = await tarayici.newContext({ locale: "tr-TR", deviceScaleFactor: 1 });
  const sayfa = await baglam.newPage();
  for (const girdi of yollar) {
    const yalnizIlk = girdi.endsWith("!");
    const [yol, genislik] = girdi.replace(/!$/, "").split("@");
    const en = Number(genislik ?? 1440);
    await sayfa.setViewportSize({ width: en, height: en < 700 ? 844 : 900 });
    await sayfa.goto(`${kok}${yol}`, { waitUntil: "networkidle" });
    // Ekrana girince beliren öğeleri görünür yap, tembel görselleri yükle.
    await sayfa.evaluate(async () => {
      document.querySelectorAll(".gorun").forEach((e) => e.classList.add("gorundu"));
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await sayfa.waitForLoadState("networkidle");
    await sayfa.waitForTimeout(400);
    const ad = `${yol.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "kok"}-${en}${yalnizIlk ? "-ilk" : ""}.png`;
    await sayfa.screenshot({ path: join(klasor, ad), fullPage: !yalnizIlk });
    console.log("kaydedildi:", join(klasor, ad));
  }
} finally {
  await tarayici.close();
}
