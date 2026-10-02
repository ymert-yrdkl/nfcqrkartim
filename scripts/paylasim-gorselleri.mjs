// Paylaşım görseli (src/app/opengraph-image.png) ve ikonlar (apple-icon.png, favicon) üretir.
// Gereken: geliştirme sunucusu açık (npm run dev -- --port 3100), sistemde Google Chrome.
//   node scripts/paylasim-gorselleri.mjs

import { chromium } from "playwright-core";

const kok = process.env.EKRAN_URL ?? "http://localhost:3100";
const t = await chromium.launch({ channel: "chrome" });
try {
  const s = await t.newPage({ viewport: { width: 1200, height: 630 } });
  await s.goto(`${kok}/og-kart`, { waitUntil: "networkidle" });
  await s.waitForTimeout(500);
  await s.screenshot({ path: "src/app/opengraph-image.png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log("kaydedildi: src/app/opengraph-image.png");

  const i = await t.newPage({ viewport: { width: 512, height: 512 } });
  await i.goto(`${kok}/og-kart?tur=ikon`, { waitUntil: "networkidle" });
  await i.screenshot({ path: "scripts/.ikon-512.png", clip: { x: 0, y: 0, width: 512, height: 512 } });
  console.log("kaydedildi: scripts/.ikon-512.png (apple-icon ve favicon bundan üretilir)");
} finally {
  await t.close();
}
