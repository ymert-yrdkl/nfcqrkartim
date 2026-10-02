// Yerel deneme için sahte iyzico sunucusu (gerçek anahtar olmadan kartlı ödeme akışını denemek için).
//
//   node scripts/iyzico-sahte.mjs            (http://localhost:3999)
//   Geliştirme sunucusu şu ortamla açılır:
//     IYZICO_API_KEY=sahte-anahtar IYZICO_SECRET_KEY=sahte-gizli IYZICO_ADRES=http://localhost:3999
//
// Taklit edilenler (docs.iyzico.com'daki biçimle):
//   POST /payment/iyzipos/checkoutform/initialize/auth/ecom   → token + paymentPageUrl (+ imza)
//   GET  /odeme-sayfasi?token=…                                → "Öde" / "Reddet" düğmeli sayfa; tarayıcıyı
//                                                                callbackUrl'e POST (token) ile geri yollar
//   POST /payment/iyzipos/checkoutform/auth/ecom/detail        → ödeme sonucu (+ imza)
// Her istekte IYZWSv2 imzası ve sepet toplamı denetlenir; uymazsa 401/400 döner.

import { createHmac } from "node:crypto";
import http from "node:http";

const PORT = Number(process.env.SAHTE_PORT ?? 3999);
const API_KEY = "sahte-anahtar";
const GIZLI = "sahte-gizli";
const oturumlar = new Map(); // token → { govde, karar }

const hmac = (veri) => createHmac("sha256", GIZLI).update(veri).digest("hex");
const imzaFiyati = (v) => String(Number(v));

function yetkiDogruMu(istek, yol, ham) {
  const baslik = istek.headers.authorization ?? "";
  const rnd = istek.headers["x-iyzi-rnd"];
  if (!baslik.startsWith("IYZWSv2 ") || !rnd) return "başlık eksik";
  const cozulmus = Buffer.from(baslik.slice(8), "base64").toString("utf8");
  const parca = Object.fromEntries(cozulmus.split("&").map((p) => [p.slice(0, p.indexOf(":")), p.slice(p.indexOf(":") + 1)]));
  if (parca.apiKey !== API_KEY) return "apiKey yanlış";
  if (parca.randomKey !== rnd) return "randomKey x-iyzi-rnd ile aynı değil";
  if (parca.signature !== hmac(rnd + yol + ham)) return "imza yanlış";
  return null;
}

function json(yanit, kod, veri) {
  yanit.writeHead(kod, { "Content-Type": "application/json" });
  yanit.end(JSON.stringify(veri));
}

const sunucu = http.createServer(async (istek, yanit) => {
  const url = new URL(istek.url, `http://localhost:${PORT}`);
  let ham = "";
  for await (const parca of istek) ham += parca;

  if (istek.method === "POST" && url.pathname.startsWith("/payment/")) {
    const hata = yetkiDogruMu(istek, url.pathname, ham);
    if (hata) return json(yanit, 401, { status: "failure", errorCode: "1000", errorMessage: `Sahte iyzico: ${hata}` });
  }

  if (istek.method === "POST" && url.pathname === "/payment/iyzipos/checkoutform/initialize/auth/ecom") {
    const g = JSON.parse(ham);
    const sepet = g.basketItems.reduce((t, k) => t + Number(k.price), 0);
    if (Math.abs(sepet - Number(g.price)) > 0.001) {
      return json(yanit, 200, { status: "failure", errorCode: "5025", errorMessage: "Sepet toplamı fiyatla uyuşmuyor" });
    }
    for (const alan of ["callbackUrl", "buyer", "billingAddress", "shippingAddress", "basketId", "conversationId"]) {
      if (!g[alan]) return json(yanit, 200, { status: "failure", errorCode: "11", errorMessage: `${alan} eksik` });
    }
    const token = `sahte-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    oturumlar.set(token, { govde: g, karar: null });
    return json(yanit, 200, {
      status: "success",
      locale: "tr",
      conversationId: g.conversationId,
      token,
      tokenExpireTime: 1800,
      paymentPageUrl: `http://localhost:${PORT}/odeme-sayfasi?token=${token}`,
      signature: hmac([g.conversationId, token].join(":")),
    });
  }

  if (istek.method === "GET" && url.pathname === "/odeme-sayfasi") {
    const token = url.searchParams.get("token");
    const o = oturumlar.get(token);
    if (!o) return json(yanit, 404, { hata: "token yok" });
    yanit.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return yanit.end(`<!doctype html><meta charset="utf-8"><title>Sahte iyzico</title>
      <body style="font-family:system-ui;padding:40px">
      <h1>Sahte iyzico ödeme sayfası</h1><p>Sipariş ${o.govde.basketId} · ${o.govde.price} TL</p>
      <form method="post" action="/karar"><input type="hidden" name="token" value="${token}">
        <button name="karar" value="SUCCESS">Öde</button>
        <button name="karar" value="FAILURE">Reddet</button></form></body>`);
  }

  if (istek.method === "POST" && url.pathname === "/karar") {
    const f = new URLSearchParams(ham);
    const o = oturumlar.get(f.get("token"));
    if (!o) return json(yanit, 404, { hata: "token yok" });
    o.karar = f.get("karar");
    // Gerçek iyzico gibi: tarayıcıyı callbackUrl'e form POST ile yolla.
    yanit.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return yanit.end(`<!doctype html><meta charset="utf-8"><body onload="document.forms[0].submit()">
      <form method="post" action="${o.govde.callbackUrl}"><input type="hidden" name="token" value="${f.get("token")}"></form></body>`);
  }

  if (istek.method === "POST" && url.pathname === "/payment/iyzipos/checkoutform/auth/ecom/detail") {
    const { token } = JSON.parse(ham);
    const o = oturumlar.get(token);
    if (!o) return json(yanit, 200, { status: "failure", errorCode: "5000", errorMessage: "Token bulunamadı" });
    const basarili = o.karar === "SUCCESS";
    // Gerçek iyzico gibi: aynı token için ödeme numarası hep aynı.
    o.odemeNo ??= String(20000000 + Math.floor(Math.random() * 999999));
    const sonuc = {
      status: basarili ? "success" : "failure",
      paymentStatus: basarili ? "SUCCESS" : "FAILURE",
      errorMessage: basarili ? undefined : "Kart limiti yetersiz (sahte)",
      fraudStatus: 1,
      paymentId: basarili ? o.odemeNo : undefined,
      price: Number(o.govde.price),
      paidPrice: Number(o.govde.paidPrice),
      currency: "TRY",
      basketId: o.govde.basketId,
      conversationId: o.govde.conversationId,
      installment: 1,
      lastFourDigits: "0008",
      token,
    };
    sonuc.signature = hmac(
      [sonuc.paymentStatus, sonuc.paymentId, sonuc.currency, sonuc.basketId, sonuc.conversationId, imzaFiyati(sonuc.paidPrice), imzaFiyati(sonuc.price), token].join(":"),
    );
    return json(yanit, 200, sonuc);
  }

  json(yanit, 404, { hata: "bilinmeyen yol" });
});

sunucu.listen(PORT, () => console.log(`Sahte iyzico http://localhost:${PORT}`));
