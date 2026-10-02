import "server-only";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

// Mağaza veritabanı: tek SQLite dosyası (Node'un yerleşik node:sqlite modülü).
// Dosya yeri VERI_KOKU ortam değişkeninden; Docker'da bu klasör kalıcı birime (volume) bağlanır.

const KOK = process.env.VERI_KOKU ?? path.join(process.cwd(), "veri");

// Şema değişiklikleri sırayla eklenir; uygulanan sürüm PRAGMA user_version'da tutulur.
// Eski bir adımı DEĞİŞTİRMEYİN, yeni adım ekleyin.
const GOCLER: string[] = [
  // 1: ilk şema
  `
  CREATE TABLE ayar (
    anahtar TEXT PRIMARY KEY,
    deger TEXT NOT NULL
  );

  CREATE TABLE stok (
    kalem TEXT PRIMARY KEY CHECK (kalem IN ('google', 'instagram')),
    adet INTEGER NOT NULL CHECK (adet >= 0),
    guncelleme TEXT NOT NULL
  );
  INSERT INTO stok (kalem, adet, guncelleme) VALUES
    ('google', 40, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    ('instagram', 40, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

  CREATE TABLE siparis (
    id INTEGER PRIMARY KEY,
    no TEXT NOT NULL UNIQUE,
    erisim_ozet TEXT NOT NULL,
    durum TEXT NOT NULL CHECK (durum IN ('odeme_bekliyor', 'hazirlaniyor', 'kargoda', 'teslim_edildi', 'iptal')),
    ad TEXT NOT NULL,
    telefon TEXT NOT NULL,
    eposta TEXT NOT NULL,
    il TEXT NOT NULL,
    ilce TEXT NOT NULL,
    adres TEXT NOT NULL,
    posta_kodu TEXT,
    fatura_turu TEXT NOT NULL CHECK (fatura_turu IN ('bireysel', 'kurumsal')),
    firma_unvani TEXT,
    vergi_dairesi TEXT,
    vergi_no TEXT,
    fatura_adresi TEXT,
    siparis_notu TEXT,
    ara_toplam INTEGER NOT NULL,
    kargo INTEGER NOT NULL,
    toplam INTEGER NOT NULL,
    odeme_yontemi TEXT NOT NULL DEFAULT 'havale',
    kargo_firmasi TEXT,
    kargo_takip TEXT,
    sozlesme_onay_zamani TEXT NOT NULL,
    ip TEXT,
    olusturma TEXT NOT NULL,
    guncelleme TEXT NOT NULL
  );
  CREATE INDEX siparis_durum ON siparis (durum, olusturma);

  CREATE TABLE siparis_kalemi (
    id INTEGER PRIMARY KEY,
    siparis_id INTEGER NOT NULL REFERENCES siparis (id),
    urun_slug TEXT NOT NULL,
    urun_adi TEXT NOT NULL,
    birim_fiyat INTEGER NOT NULL,
    adet INTEGER NOT NULL CHECK (adet > 0),
    tutar INTEGER NOT NULL
  );
  CREATE INDEX siparis_kalemi_siparis ON siparis_kalemi (siparis_id);

  CREATE TABLE siparis_olayi (
    id INTEGER PRIMARY KEY,
    siparis_id INTEGER NOT NULL REFERENCES siparis (id),
    zaman TEXT NOT NULL,
    durum TEXT NOT NULL,
    aciklama TEXT,
    yapan TEXT NOT NULL CHECK (yapan IN ('musteri', 'yonetici', 'sistem'))
  );
  CREATE INDEX siparis_olayi_siparis ON siparis_olayi (siparis_id, zaman);
  `,
  // 2: iletişim formu mesajları
  `
  CREATE TABLE mesaj (
    id INTEGER PRIMARY KEY,
    ad TEXT NOT NULL,
    iletisim TEXT NOT NULL,
    konu TEXT NOT NULL CHECK (konu IN ('soru', 'toplu', 'siparis', 'diger')),
    metin TEXT NOT NULL,
    ip TEXT,
    okundu INTEGER NOT NULL DEFAULT 0,
    olusturma TEXT NOT NULL
  );
  CREATE INDEX mesaj_olusturma ON mesaj (okundu, olusturma);
  `,
];

function ac(): DatabaseSync {
  mkdirSync(KOK, { recursive: true });
  const db = new DatabaseSync(path.join(KOK, "magaza.sqlite"));
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

  const { user_version: surum } = db.prepare("PRAGMA user_version").get() as { user_version: number };
  for (let i = surum; i < GOCLER.length; i++) {
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(GOCLER[i]);
      db.exec(`PRAGMA user_version = ${i + 1}`);
      db.exec("COMMIT");
    } catch (hata) {
      db.exec("ROLLBACK");
      throw hata;
    }
  }
  return db;
}

// Bağlantı ilk kullanımda açılır (derleme sırasında dosya oluşmasın diye).
// Geliştirmede sıcak yenileme modülü yeniden yükler; bağlantı globalde tek kalsın.
const kuresel = globalThis as unknown as { __magazaDb?: DatabaseSync };
export function vt(): DatabaseSync {
  kuresel.__magazaDb ??= ac();
  return kuresel.__magazaDb;
}

// Fonksiyonu tek bir yazma işleminde (transaction) çalıştırır; hata olursa hepsini geri alır.
export function islem<T>(fn: () => T): T {
  const db = vt();
  db.exec("BEGIN IMMEDIATE");
  try {
    const sonuc = fn();
    db.exec("COMMIT");
    return sonuc;
  } catch (hata) {
    db.exec("ROLLBACK");
    throw hata;
  }
}

export function simdi(): string {
  return new Date().toISOString();
}

// Çerez imzalama anahtarı: OTURUM_GIZLI verilmemişse ilk açılışta üretilip veritabanında saklanır.
export function gizliAnahtar(): string {
  if (process.env.OTURUM_GIZLI && process.env.OTURUM_GIZLI.length >= 32) return process.env.OTURUM_GIZLI;
  const db = vt();
  const satir = db.prepare("SELECT deger FROM ayar WHERE anahtar = 'gizli'").get() as { deger: string } | undefined;
  if (satir) return satir.deger;
  const yeni = randomBytes(32).toString("base64url");
  db.prepare("INSERT OR IGNORE INTO ayar (anahtar, deger) VALUES ('gizli', ?)").run(yeni);
  return (db.prepare("SELECT deger FROM ayar WHERE anahtar = 'gizli'").get() as { deger: string }).deger;
}
