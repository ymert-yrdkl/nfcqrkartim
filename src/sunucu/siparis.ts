import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { TICARI } from "@/magaza/ayarlar";
import { GECISLER, type SiparisDurumu } from "@/magaza/siparis-durumu";
import { urunBul, type StokKalemi, type UrunSlug } from "@/magaza/urunler";
import { gizliAnahtar, islem, simdi, vt } from "./db";
import { stogaEkle, stoktanDus } from "./stok";

export type SiparisGirdisi = {
  ad: string;
  telefon: string;
  eposta: string;
  il: string;
  ilce: string;
  adres: string;
  postaKodu: string | null;
  faturaTuru: "bireysel" | "kurumsal";
  firmaUnvani: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  faturaAdresi: string | null;
  siparisNotu: string | null;
};

export type SepetKalemi = { slug: UrunSlug; adet: number };

export type Siparis = {
  id: number;
  no: string;
  durum: SiparisDurumu;
  ad: string;
  telefon: string;
  eposta: string;
  il: string;
  ilce: string;
  adres: string;
  postaKodu: string | null;
  faturaTuru: "bireysel" | "kurumsal";
  firmaUnvani: string | null;
  vergiDairesi: string | null;
  vergiNo: string | null;
  faturaAdresi: string | null;
  siparisNotu: string | null;
  araToplam: number;
  kargo: number;
  toplam: number;
  odemeYontemi: string;
  kargoFirmasi: string | null;
  kargoTakip: string | null;
  olusturma: string;
  guncelleme: string;
  kalemler: { urunSlug: string; urunAdi: string; birimFiyat: number; adet: number; tutar: number }[];
  olaylar: { zaman: string; durum: SiparisDurumu; aciklama: string | null; yapan: string }[];
};

export class StokYetersiz extends Error {
  constructor(public urunler: string[]) {
    super("Stok yetersiz");
  }
}

const ozet = (metin: string) => createHash("sha256").update(metin).digest("hex");

function yeniNo(): string {
  // Sıralı olmayan, tahmin edilmesi zor ama okunabilir numara: NQ-482913
  for (;;) {
    const no = `NQ-${randomInt(100000, 999999)}`;
    const var_ = vt().prepare("SELECT 1 FROM siparis WHERE no = ?").get(no);
    if (!var_) return no;
  }
}

// Sepeti katalogla birleştirir: fiyat ve ad her zaman sunucudaki katalogdan.
export function sepetiHesapla(sepet: SepetKalemi[]) {
  const kalemler = sepet.map((s) => {
    const urun = urunBul(s.slug);
    if (!urun) throw new Error(`Bilinmeyen ürün: ${s.slug}`);
    return { urun, adet: s.adet, tutar: urun.fiyat * s.adet };
  });
  const araToplam = kalemler.reduce((t, k) => t + k.tutar, 0);
  const kargo = TICARI.kargoUcreti;
  return { kalemler, araToplam, kargo, toplam: araToplam + kargo };
}

// Siparişi tek işlemde oluşturur: stok düşer, sipariş + kalemler + ilk olay yazılır.
// Dönen erişim anahtarı yalnız bir kez görünür (bağlantıya eklenir); veritabanında özeti durur.
export function siparisOlustur(girdi: SiparisGirdisi, sepet: SepetKalemi[], ip: string | null) {
  const hesap = sepetiHesapla(sepet);
  const anahtar = randomBytes(18).toString("base64url");

  return islem(() => {
    // Stok kalemi başına toplam ihtiyaç (ikili set iki kalemden düşer).
    const ihtiyac: Partial<Record<StokKalemi, number>> = {};
    for (const k of hesap.kalemler) {
      for (const s of k.urun.stok) ihtiyac[s.kalem] = (ihtiyac[s.kalem] ?? 0) + s.adet * k.adet;
    }
    const yetersiz: StokKalemi[] = [];
    for (const [kalem, adet] of Object.entries(ihtiyac) as [StokKalemi, number][]) {
      if (!stoktanDus(kalem, adet)) yetersiz.push(kalem);
    }
    if (yetersiz.length > 0) {
      const adlar = hesap.kalemler
        .filter((k) => k.urun.stok.some((s) => yetersiz.includes(s.kalem)))
        .map((k) => k.urun.ad);
      throw new StokYetersiz(adlar);
    }

    const zaman = simdi();
    const no = yeniNo();
    const db = vt();
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO siparis (no, erisim_ozet, durum, ad, telefon, eposta, il, ilce, adres, posta_kodu,
          fatura_turu, firma_unvani, vergi_dairesi, vergi_no, fatura_adresi, siparis_notu,
          ara_toplam, kargo, toplam, odeme_yontemi, sozlesme_onay_zamani, ip, olusturma, guncelleme)
         VALUES (?, ?, 'odeme_bekliyor', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'havale', ?, ?, ?, ?)`,
      )
      .run(
        no,
        ozet(anahtar),
        girdi.ad,
        girdi.telefon,
        girdi.eposta,
        girdi.il,
        girdi.ilce,
        girdi.adres,
        girdi.postaKodu,
        girdi.faturaTuru,
        girdi.firmaUnvani,
        girdi.vergiDairesi,
        girdi.vergiNo,
        girdi.faturaAdresi,
        girdi.siparisNotu,
        hesap.araToplam,
        hesap.kargo,
        hesap.toplam,
        zaman,
        ip,
        zaman,
        zaman,
      );
    const kalemEkle = db.prepare(
      `INSERT INTO siparis_kalemi (siparis_id, urun_slug, urun_adi, birim_fiyat, adet, tutar) VALUES (?, ?, ?, ?, ?, ?)`,
    );
    for (const k of hesap.kalemler) {
      kalemEkle.run(lastInsertRowid, k.urun.slug, k.urun.ad, k.urun.fiyat, k.adet, k.tutar);
    }
    olayEkle(Number(lastInsertRowid), "odeme_bekliyor", "Sipariş alındı.", "musteri", zaman);
    return { no, anahtar };
  });
}

function olayEkle(siparisId: number, durum: SiparisDurumu, aciklama: string | null, yapan: string, zaman = simdi()) {
  vt()
    .prepare(`INSERT INTO siparis_olayi (siparis_id, zaman, durum, aciklama, yapan) VALUES (?, ?, ?, ?, ?)`)
    .run(siparisId, zaman, durum, aciklama, yapan);
}

type SiparisSatiri = {
  id: number;
  no: string;
  erisim_ozet: string;
  durum: SiparisDurumu;
  ad: string;
  telefon: string;
  eposta: string;
  il: string;
  ilce: string;
  adres: string;
  posta_kodu: string | null;
  fatura_turu: "bireysel" | "kurumsal";
  firma_unvani: string | null;
  vergi_dairesi: string | null;
  vergi_no: string | null;
  fatura_adresi: string | null;
  siparis_notu: string | null;
  ara_toplam: number;
  kargo: number;
  toplam: number;
  odeme_yontemi: string;
  kargo_firmasi: string | null;
  kargo_takip: string | null;
  olusturma: string;
  guncelleme: string;
};

function satirdanSiparis(s: SiparisSatiri): Siparis {
  const db = vt();
  const kalemler = db
    .prepare(
      `SELECT urun_slug AS urunSlug, urun_adi AS urunAdi, birim_fiyat AS birimFiyat, adet, tutar
       FROM siparis_kalemi WHERE siparis_id = ? ORDER BY id`,
    )
    .all(s.id) as Siparis["kalemler"];
  const olaylar = db
    .prepare(`SELECT zaman, durum, aciklama, yapan FROM siparis_olayi WHERE siparis_id = ? ORDER BY zaman, id`)
    .all(s.id) as Siparis["olaylar"];
  return {
    id: s.id,
    no: s.no,
    durum: s.durum,
    ad: s.ad,
    telefon: s.telefon,
    eposta: s.eposta,
    il: s.il,
    ilce: s.ilce,
    adres: s.adres,
    postaKodu: s.posta_kodu,
    faturaTuru: s.fatura_turu,
    firmaUnvani: s.firma_unvani,
    vergiDairesi: s.vergi_dairesi,
    vergiNo: s.vergi_no,
    faturaAdresi: s.fatura_adresi,
    siparisNotu: s.siparis_notu,
    araToplam: s.ara_toplam,
    kargo: s.kargo,
    toplam: s.toplam,
    odemeYontemi: s.odeme_yontemi,
    kargoFirmasi: s.kargo_firmasi,
    kargoTakip: s.kargo_takip,
    olusturma: s.olusturma,
    guncelleme: s.guncelleme,
    kalemler,
    olaylar,
  };
}

function satirBul(no: string): SiparisSatiri | undefined {
  return vt().prepare("SELECT * FROM siparis WHERE no = ?").get(no) as SiparisSatiri | undefined;
}

// --- Müşteri erişimi -------------------------------------------------------------------------
// Sipariş sayfası iki yolla açılır: (1) onay bağlantısındaki anahtar (?t=...), (2) sipariş sorgulamadan
// sonra verilen imzalı çerez. Sipariş numarası tek başına yetmez.

export function anahtarIleBul(no: string, anahtar: string): Siparis | null {
  const satir = satirBul(no);
  if (!satir) return null;
  const a = Buffer.from(ozet(anahtar), "hex");
  const b = Buffer.from(satir.erisim_ozet, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return satirdanSiparis(satir);
}

export function erisimImzasi(no: string): string {
  return createHmac("sha256", gizliAnahtar()).update(`siparis:${no}`).digest("base64url");
}

export function imzaIleBul(no: string, imza: string): Siparis | null {
  const beklenen = Buffer.from(erisimImzasi(no));
  const gelen = Buffer.from(imza);
  if (beklenen.length !== gelen.length || !timingSafeEqual(beklenen, gelen)) return null;
  const satir = satirBul(no);
  return satir ? satirdanSiparis(satir) : null;
}

// Sipariş sorgulama: numara + telefonun son 4 hanesi.
export function sorgula(no: string, telefonSon4: string): Siparis | null {
  const satir = satirBul(no);
  if (!satir) return null;
  const rakamlar = satir.telefon.replace(/\D/g, "");
  if (!rakamlar.endsWith(telefonSon4)) return null;
  return satirdanSiparis(satir);
}

// --- Yönetim -------------------------------------------------------------------------------------

export function yonetimBul(no: string): Siparis | null {
  const satir = satirBul(no);
  return satir ? satirdanSiparis(satir) : null;
}

export type SiparisOzeti = {
  no: string;
  durum: SiparisDurumu;
  ad: string;
  il: string;
  toplam: number;
  adet: number;
  olusturma: string;
};

export function siparisleriListele(durum: SiparisDurumu | "hepsi"): SiparisOzeti[] {
  const kosul = durum === "hepsi" ? "" : "WHERE s.durum = ?";
  const sorgu = vt().prepare(
    `SELECT s.no, s.durum, s.ad, s.il, s.toplam, s.olusturma,
            (SELECT COALESCE(SUM(adet), 0) FROM siparis_kalemi k WHERE k.siparis_id = s.id) AS adet
     FROM siparis s ${kosul} ORDER BY s.olusturma DESC LIMIT 500`,
  );
  return (durum === "hepsi" ? sorgu.all() : sorgu.all(durum)) as SiparisOzeti[];
}

export function durumSayilari(): Record<SiparisDurumu, number> {
  const satirlar = vt().prepare("SELECT durum, COUNT(*) AS sayi FROM siparis GROUP BY durum").all() as {
    durum: SiparisDurumu;
    sayi: number;
  }[];
  const sonuc: Record<SiparisDurumu, number> = {
    odeme_bekliyor: 0,
    hazirlaniyor: 0,
    kargoda: 0,
    teslim_edildi: 0,
    iptal: 0,
  };
  for (const s of satirlar) sonuc[s.durum] = s.sayi;
  return sonuc;
}

// Durum değişikliği. İptalde stok geri eklenir. Kargoya verirken takip numarası yazılabilir.
export function durumDegistir(
  no: string,
  yeni: SiparisDurumu,
  ek: { aciklama?: string | null; kargoFirmasi?: string | null; kargoTakip?: string | null },
) {
  return islem(() => {
    const satir = satirBul(no);
    if (!satir) throw new Error("Sipariş bulunamadı");
    if (!GECISLER[satir.durum].includes(yeni)) {
      throw new Error(`"${satir.durum}" durumundan "${yeni}" durumuna geçilemez`);
    }
    const zaman = simdi();
    if (yeni === "iptal") {
      const kalemler = vt()
        .prepare("SELECT urun_slug, adet FROM siparis_kalemi WHERE siparis_id = ?")
        .all(satir.id) as { urun_slug: string; adet: number }[];
      for (const k of kalemler) {
        const urun = urunBul(k.urun_slug);
        if (!urun) continue;
        for (const s of urun.stok) stogaEkle(s.kalem, s.adet * k.adet);
      }
    }
    vt()
      .prepare(
        `UPDATE siparis SET durum = ?, guncelleme = ?,
           kargo_firmasi = COALESCE(?, kargo_firmasi), kargo_takip = COALESCE(?, kargo_takip)
         WHERE id = ?`,
      )
      .run(yeni, zaman, ek.kargoFirmasi ?? null, ek.kargoTakip ?? null, satir.id);
    olayEkle(satir.id, yeni, ek.aciklama ?? null, "yonetici", zaman);
  });
}
