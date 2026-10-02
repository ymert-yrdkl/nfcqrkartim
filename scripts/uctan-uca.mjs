// Uçtan uca deneme (yerel geliştirme sunucusunda, sistem Chrome'u ile). Yerel veritabanına deneme siparişi yazar.
//
//   node scripts/uctan-uca.mjs
//
// Gereken: `npm run dev -- --port 3100` açık, .env.local içinde YONETICI_SIFRE.
// Denenenler: sepete ekle → ödeme (hatalı, sonra doğru) → onay sayfası (sepet boşalır, "yeni" adresten silinir)
// → yönetim: ödeme alındı → kargoda → iptal edilemez → sorgulama maskeli görünür → stok kaydında çakışma uyarısı.

import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const kok = process.env.EKRAN_URL ?? "http://localhost:3100";
const sifre = readFileSync(".env.local", "utf8").match(/^YONETICI_SIFRE=(.*)$/m)?.[1]?.trim();
if (!sifre) throw new Error(".env.local içinde YONETICI_SIFRE yok");

let hataSayisi = 0;
function dogrula(kosul, mesaj) {
  console.log(`${kosul ? "✓" : "✗"} ${mesaj}`);
  if (!kosul) hataSayisi++;
}

const t = await chromium.launch({ channel: "chrome" });
const konsol = [];
try {
  // --- Müşteri: sipariş ---------------------------------------------------------------------------
  const m = await (await t.newContext({ locale: "tr-TR", viewport: { width: 1280, height: 900 } })).newPage();
  m.on("pageerror", (e) => konsol.push(e.message));
  await m.goto(`${kok}/urun/ikili-set`, { waitUntil: "load" });
  await m.waitForTimeout(1500);
  await m.getByRole("button", { name: "Sepete ekle" }).first().click();
  await m.getByRole("dialog", { name: /Sepetiniz/ }).waitFor();
  dogrula(true, "ikili set sepete eklendi, çekmece açıldı");

  await m.goto(`${kok}/odeme`, { waitUntil: "load" });
  await m.locator("#ad").waitFor();
  // Kartla ödeme açıksa varsayılan kart seçilidir; bu deneme havale akışını sınar.
  await m.locator('input[name="odeme"][value="havale"]').check();
  await m.getByRole("button", { name: /Siparişi tamamla/ }).click();
  await m.getByText(/alanı düzeltmeniz gerekiyor/).waitFor();
  dogrula(!(await m.getByText(/Invalid input|Too big/).count()), "boş formda İngilizce hata yok");

  await m.fill("#ad", "Uçtan Uca Deneme");
  await m.fill("#telefon", "+90 (532) 444 55 66");
  await m.fill("#eposta", "Deneme@Ornek.com");
  await m.selectOption("#il", "Ankara");
  await m.fill("#ilce", "Çankaya");
  await m.fill("#adres", "Deneme Mah. Uzun Sok. No 12 Daire 3");
  await m.getByText("Kurumsal", { exact: true }).click();
  await m.fill("#firmaUnvani", "Deneme Gıda Ltd. Şti.");
  await m.fill("#vergiDairesi", "Kavaklıdere");
  await m.fill("#vergiNo", "1234567890");
  await m.check("#sozlesme");
  await m.getByRole("button", { name: /Siparişi tamamla/ }).click();
  await m.waitForURL(/\/siparis\/NQ-\d{6}/, { timeout: 20000 });
  await m.waitForTimeout(1200);
  const no = m.url().match(/NQ-\d{6}/)[0];
  dogrula(!m.url().includes("yeni=1"), `onay sayfası açıldı (${no}), "yeni" adresten silindi`);
  dogrula((await m.evaluate(() => localStorage.getItem("nfcqrkartim-sepet-v1"))) === "[]", "sepet boşaldı");
  dogrula(await m.getByText("0532 444 55 66").count() > 0, "telefon 0532 444 55 66 biçimine çevrildi, alıcıya tam görünür");

  // --- Yönetim ------------------------------------------------------------------------------------
  const y = await (await t.newContext({ locale: "tr-TR", viewport: { width: 1280, height: 900 } })).newPage();
  await y.goto(`${kok}/yonetim/giris`, { waitUntil: "load" });
  await y.fill("#sifre", sifre);
  await y.getByRole("button", { name: "Giriş yap" }).click();
  await y.waitForURL(`${kok}/yonetim`);
  await y.goto(`${kok}/yonetim/siparis/${no}`, { waitUntil: "load" });
  await y.getByRole("button", { name: "Ödeme alındı, hazırlanıyor" }).click();
  await y.getByRole("button", { name: "Onayla" }).click();
  await y.getByRole("button", { name: "Kargoya verildi" }).waitFor();
  await y.getByRole("button", { name: "Kargoya verildi" }).click();
  await y.fill("input[name=kargoTakip]", "TAKIP-998877");
  await y.getByRole("button", { name: "Onayla" }).click();
  await y.getByRole("button", { name: "Geri al: Hazırlanıyor" }).waitFor();
  dogrula(true, "ödeme alındı → kargoda");
  await y.getByRole("button", { name: "Geri al: Hazırlanıyor" }).click();
  await y.getByRole("button", { name: "Onayla" }).click();
  await y.getByRole("button", { name: "Siparişi iptal et" }).waitFor();
  dogrula(!(await y.getByText("TAKIP-998877").count()), "kargodan geri alınca takip numarası silindi");
  await y.getByRole("button", { name: "Siparişi iptal et" }).click();
  await y.getByRole("button", { name: "Onayla" }).click();
  await y.getByText(/Kargoya verilmiş sipariş iptal edilemez/).waitFor();
  dogrula(true, "kargoya verilmiş sipariş iptal edilemedi");

  // --- Sorgulama: maskeli görünüm ----------------------------------------------------------------
  const s = await (await t.newContext({ locale: "tr-TR", viewport: { width: 390, height: 844 } })).newPage();
  await s.goto(`${kok}/siparis-sorgula`, { waitUntil: "load" });
  await s.fill("#no", no.replace("NQ-", ""));
  await s.fill("#telefon", "5566");
  await s.getByRole("button", { name: "Siparişi göster" }).click();
  await s.waitForURL(new RegExp(`/siparis/${no}$`));
  await s.waitForTimeout(800);
  dogrula(await s.getByText("0532 *** ** 66").count() > 0, "sorguyla açılan sayfada telefon maskeli");
  dogrula(!(await s.getByText("Uzun Sok").count()), "sorguyla açılan sayfada açık adres gizli");
  dogrula(!(await s.getByText("1234567890").count()), "sorguyla açılan sayfada vergi numarası gizli");

  // --- Stok kaydında çakışma ----------------------------------------------------------------------
  await y.goto(`${kok}/yonetim/stok`, { waitUntil: "load" });
  const eski = Number(await y.inputValue("input[name=google]"));
  // Araya başka bir yönetici kaydı girsin: ikinci sekmede değiştir.
  const y2 = await y.context().newPage();
  await y2.goto(`${kok}/yonetim/stok`, { waitUntil: "load" });
  await y2.fill("input[name=google]", String(eski + 1));
  await y2.getByRole("button", { name: "Stoğu kaydet" }).click();
  await y2.getByText("Stok kaydedildi.").waitFor();
  await y.fill("input[name=google]", String(eski + 5));
  await y.getByRole("button", { name: "Stoğu kaydet" }).click();
  await y.getByText(/stoğu siz sayfayı açtıktan sonra değişti/).waitFor();
  dogrula(true, "eski formla stok kaydı çakışma uyarısı verdi");
  await y2.reload({ waitUntil: "load" });
  await y2.fill("input[name=google]", String(eski));
  await y2.getByRole("button", { name: "Stoğu kaydet" }).click();
  await y2.getByText("Stok kaydedildi.").waitFor();
} catch (e) {
  hataSayisi++;
  console.log("✗ beklenmeyen hata:", e.message.split("\n").slice(0, 4).join(" | "));
} finally {
  await t.close();
}
dogrula(konsol.length === 0, `tarayıcı konsolunda hata yok ${konsol.length ? JSON.stringify(konsol) : ""}`);
console.log(hataSayisi === 0 ? "\nHepsi geçti." : `\n${hataSayisi} denetim başarısız.`);
process.exit(hataSayisi === 0 ? 0 : 1);
