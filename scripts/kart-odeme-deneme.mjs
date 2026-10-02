// Kartlı ödeme (iyzico) uçtan uca denemesi, sahte iyzico sunucusuyla. Yerel veritabanına deneme siparişi yazar.
//
//   1) node scripts/iyzico-sahte.mjs
//   2) IYZICO_API_KEY=sahte-anahtar IYZICO_SECRET_KEY=sahte-gizli IYZICO_ADRES=http://localhost:3999 npx next dev --port 3100
//   3) node scripts/kart-odeme-deneme.mjs
//
// Denenenler: başarılı ödeme → "hazırlanıyor", sepet boşalır, stok düşer · reddedilen ödeme → ödeme sayfasına
// döner, hata görünür, sepet durur, sipariş iptal ve stok geri gelir · yarıda kalan ödeme sipariş sayfasından
// tamamlanır · aynı ödemenin webhook'u ikinci kez işlenmez.

import { DatabaseSync } from "node:sqlite";
import { chromium } from "playwright-core";

const kok = process.env.EKRAN_URL ?? "http://localhost:3100";
const db = new DatabaseSync("veri/magaza.sqlite", { readOnly: true });
const stok = () => Object.fromEntries(db.prepare("SELECT kalem, adet FROM stok").all().map((s) => [s.kalem, s.adet]));
const siparis = (no) => db.prepare("SELECT durum, odeme_yontemi, odeme_kimlik, odeme_token FROM siparis WHERE no = ?").get(no);
const olaySayisi = (no) => db.prepare("SELECT COUNT(*) AS n FROM siparis_olayi o JOIN siparis s ON s.id = o.siparis_id WHERE s.no = ?").get(no).n;

let hata = 0;
const dogrula = (kosul, mesaj) => {
  console.log(`${kosul ? "✓" : "✗"} ${mesaj}`);
  if (!kosul) hata++;
};

async function formuDoldur(s) {
  await s.fill("#ad", "Kart Deneme Müşteri");
  await s.fill("#telefon", "0533 222 33 44");
  await s.fill("#eposta", "kart@ornek.com");
  await s.selectOption("#il", "İzmir");
  await s.fill("#ilce", "Konak");
  await s.fill("#adres", "Alsancak Mah. Deneme Cad. No 7 Daire 1");
  await s.check("#sozlesme");
}

async function sepeteEkle(s, slug) {
  await s.goto(`${kok}/urun/${slug}`, { waitUntil: "load" });
  await s.waitForTimeout(1200);
  await s.getByRole("button", { name: "Sepete ekle" }).first().click();
  await s.getByRole("dialog", { name: /Sepetiniz/ }).waitFor();
}

const t = await chromium.launch({ channel: "chrome" });
try {
  const s = await (await t.newContext({ locale: "tr-TR", viewport: { width: 1280, height: 900 } })).newPage();

  // 1) Başarılı ödeme
  const once = stok();
  await sepeteEkle(s, "google-yorum-standi");
  await s.goto(`${kok}/odeme`, { waitUntil: "load" });
  await s.locator("#ad").waitFor(); // form sepet tarayıcıdan okununca çizilir
  dogrula(await s.getByText("Kredi / banka kartı").isVisible(), "ödeme sayfasında kart seçeneği görünüyor");
  await formuDoldur(s);
  await s.getByRole("button", { name: /Kartla öde/ }).click();
  await s.waitForURL(/localhost:3999\/odeme-sayfasi/, { timeout: 20000 });
  dogrula(true, "iyzico (sahte) ödeme sayfasına gidildi");
  await s.getByRole("button", { name: "Öde" }).click();
  await s.waitForURL(/\/siparis\/NQ-\d{6}/, { timeout: 20000 });
  await s.waitForTimeout(1200);
  const no1 = s.url().match(/NQ-\d{6}/)[0];
  dogrula(await s.getByText(/Ödemeniz alındı, siparişiniz hazırlanıyor/).count() > 0, `${no1}: "ödemeniz alındı" görünüyor`);
  const k1 = siparis(no1);
  dogrula(k1.durum === "hazirlaniyor" && k1.odeme_yontemi === "kart" && k1.odeme_kimlik, `${no1}: durum hazırlanıyor, ödeme no kayıtlı`);
  dogrula((await s.evaluate(() => localStorage.getItem("nfcqrkartim-sepet-v1"))) === "[]", "başarılı ödemeden sonra sepet boşaldı");
  dogrula(stok().google === once.google - 1, "Google stoğu 1 düştü");

  // 1b) Aynı ödemenin webhook'u tekrar gelir: ikinci kez işlenmez
  const olayOnce = olaySayisi(no1);
  const w = await fetch(`${kok}/api/odeme/iyzico/bildirim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: k1.odeme_token, status: "SUCCESS", iyziEventType: "CHECKOUT_FORM_AUTH", paymentConversationId: no1 }),
  });
  dogrula(w.ok && olaySayisi(no1) === olayOnce, "tekrar gelen webhook 200 döndü, sipariş geçmişi değişmedi");

  // 2) Reddedilen ödeme
  const once2 = stok();
  await sepeteEkle(s, "instagram-takip-standi");
  await s.goto(`${kok}/odeme`, { waitUntil: "load" });
  await formuDoldur(s);
  await s.getByRole("button", { name: /Kartla öde/ }).click();
  await s.waitForURL(/localhost:3999\/odeme-sayfasi/, { timeout: 20000 });
  await s.getByRole("button", { name: "Reddet" }).click();
  await s.waitForURL(/\/odeme\?odeme=basarisiz/, { timeout: 20000 });
  await s.waitForTimeout(1000);
  dogrula(await s.getByText("Kartla ödeme tamamlanmadı.").count() > 0, "reddedilince ödeme sayfasına dönüldü, hata görünüyor");
  dogrula(await s.getByText(/Kart limiti yetersiz/).count() > 0, "iyzico'nun nedeni gösteriliyor");
  await s.locator("#ad").waitFor();
  await s.waitForTimeout(400);
  dogrula((await s.inputValue("#ad")) === "Kart Deneme Müşteri" && (await s.inputValue("#ilce")) === "Konak", "reddedilince form bilgileri geri dolduruldu");
  const sepet = JSON.parse(await s.evaluate(() => localStorage.getItem("nfcqrkartim-sepet-v1")));
  dogrula(sepet.length === 1, "reddedilen ödemeden sonra sepet duruyor");
  dogrula(stok().instagram === once2.instagram, "reddedilen siparişin stoğu geri geldi");
  const no2 = db.prepare("SELECT no FROM siparis WHERE odeme_yontemi = 'kart' ORDER BY id DESC LIMIT 1").get().no;
  dogrula(siparis(no2).durum === "iptal", `${no2}: reddedilen sipariş iptal edildi`);

  // 3) Yarıda bırakılan ödeme, sipariş sayfasından tamamlanır
  await s.goto(`${kok}/odeme`, { waitUntil: "load" });
  await formuDoldur(s);
  await s.getByRole("button", { name: /Kartla öde/ }).click();
  await s.waitForURL(/localhost:3999\/odeme-sayfasi/, { timeout: 20000 });
  const no3 = db.prepare("SELECT no FROM siparis WHERE odeme_yontemi = 'kart' ORDER BY id DESC LIMIT 1").get().no;
  await s.goto(`${kok}/siparis/${no3}`, { waitUntil: "load" }); // müşteri geri döndü, ödemeden
  await s.getByRole("button", { name: "Kartla ödemeyi tamamla" }).click();
  await s.waitForURL(/localhost:3999\/odeme-sayfasi/, { timeout: 20000 });
  await s.getByRole("button", { name: "Öde" }).click();
  await s.waitForURL(new RegExp(`/siparis/${no3}`), { timeout: 20000 });
  await s.waitForTimeout(800);
  dogrula(siparis(no3).durum === "hazirlaniyor", `${no3}: yarıda kalan ödeme sipariş sayfasından tamamlandı`);
} catch (e) {
  hata++;
  console.log("✗ beklenmeyen hata:", e.message.split("\n").slice(0, 4).join(" | "));
} finally {
  await t.close();
}
console.log(hata === 0 ? "\nHepsi geçti." : `\n${hata} denetim başarısız.`);
process.exit(hata === 0 ? 0 : 1);
