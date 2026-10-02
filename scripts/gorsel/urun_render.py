# -*- coding: utf-8 -*-
"""
nfcqrkartim — NFC + QR pleksi stand için stüdyo ürün görselleri (2.5B çizim; yapay zekâ üretimi YOK).

Çalıştırma (proje kökünden):
    python scripts/gorsel/urun_render.py                         # bütün sahneler (src/gorseller/urun/)
    python scripts/gorsel/urun_render.py sahne google-on ikili-ust  # yalnız seçilen sahneler
    python scripts/gorsel/urun_render.py doku-cikar [KAYNAK]      # 04/05 önden render'larından kart dokusu çıkar
    python scripts/gorsel/urun_render.py dogrula [KAYNAK] [CIKTI]  # dokuyla 04/05'i yeniden çiz, farkı ölç

Gereksinim: Python 3.12+, numpy, Pillow, opencv-python. pypdfium2 isteğe bağlı.

Geometri DXF'ten: pano 100x100 mm (üst köşeler R10, altta 50x2.5 mm tırnak), taban 100x35 mm (köşeler R5)
+ 50.2x3.2 mm yuva, 3 mm parlak beyaz pleksi. Koordinatlar mm; y yukarı, z kameradan uzağa.

Kart dokusu (baskı) nereden gelir:
  1. scripts/gorsel/pdf/ altında Google*.pdf / Instagram*.pdf varsa ve pypdfium2 kuruluysa: gerçek baskı PDF'i.
  2. Yoksa scripts/gorsel/doku/google.png, instagram.png: eski render.py'nin önden kare çıktılarından
     (04-google-onden-kare.jpg, 05-instagram-onden-kare.jpg) perspektif + ışık tersine çevrilerek çıkarılmış doku
     (`doku-cikar` komutu). Baskı yeniden çizilmez, yalnız geri açılır.

Çıktılar: src/gorseller/urun/*.png (RGBA, zemin şeffaf, gölge alfa kanalında) ve
src/gorseller/urun/kagit/*.jpg (kâğıt zeminli sürümler, sosyal medya için).
"""
import glob
import math
import os
import sys
import time

import cv2
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

BURASI = os.path.dirname(os.path.abspath(__file__))
PROJE = os.path.dirname(os.path.dirname(BURASI))
DOKU_KLASOR = os.path.join(BURASI, "doku")
PDF_KLASOR = os.path.join(BURASI, "pdf")
CIKTI = os.path.join(PROJE, "src", "gorseller", "urun")
KAGIT_CIKTI = os.path.join(CIKTI, "kagit")
# eski render.py çıktılarının durduğu klasör (yalnız okunur)
ESKI_KAYNAK = os.path.join(os.path.expanduser("~"), "OneDrive", "Masaüstü", "Urun-Fotograflari")

KARTLAR = {
    # ad: (PDF ad öneki, eski önden kare render)
    "google": ("Google", "04-google-onden-kare.jpg"),
    "instagram": ("Instagram", "05-instagram-onden-kare.jpg"),
}

T = 3.0            # levha kalınlığı (mm)
DOKU_PX = 2048     # kart dokusunun kenarı (piksel; 100 mm)

BEYAZ = (246, 246, 244)        # parlak beyaz pleksi yüzü
KENAR = (228, 232, 232)        # pleksi kesim kenarı: hafif soğuk ton
YUVA_ESKI = (150, 152, 154)    # takılı hâlde pano ile yuva arasındaki ince boşluk
YUVA_KOYU = (46, 48, 52)       # boş yuva (patlatılmış görünüm)
ISIK = (-0.45, 0.75, -0.5)     # sol-üst-önden gelen ışık


# ── geometri ────────────────────────────────────────────────────────
def _bol(p, adim):
    """Uzun düz kenarları `adim` mm'lik parçalara böl (kenar şeridinde yumuşak ışık geçişi için)."""
    if not adim:
        return p
    q = []
    for i in range(len(p)):
        (x0, y0), (x1, y1) = p[i], p[(i + 1) % len(p)]
        q.append((x0, y0))
        n = int(math.hypot(x1 - x0, y1 - y0) // adim)
        for k in range(1, n):
            t = k / n
            q.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    return q


def pano_hat(n=14, tirnak=False, adim=None):
    """Pano ön yüz hattı (x, y): alt kenar y=0, üst köşeler R10.
    tirnak=True: alttaki 50x2.5 mm tırnak da çizilir (takılıyken tabanın içinde kaldığı için normalde görünmez)."""
    p = [(-50, 0)]
    if tirnak:
        p += [(-25, 0), (-25, -2.5), (25, -2.5), (25, 0)]
    p += [(50, 0), (50, 90)]
    for i in range(n + 1):
        a = math.radians(0 + 90 * i / n)
        p.append((40 + 10 * math.cos(a), 90 + 10 * math.sin(a)))
    for i in range(n + 1):
        a = math.radians(90 + 90 * i / n)
        p.append((-40 + 10 * math.cos(a), 90 + 10 * math.sin(a)))
    return _bol(p, adim)


def taban_hat(n=8):
    """Taban üst görünüş hattı (x, z), 100x35, R5."""
    p = []
    for cx, cz, a0 in ((45, -12.5, -90), (45, 12.5, 0), (-45, 12.5, 90), (-45, -12.5, 180)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            p.append((cx + 5 * math.cos(a), cz + 5 * math.sin(a)))
    return p


class Kamera:
    """İğne deliği kamera. (ox, oy): optik merkez kaydırması (görüntüyü kırpmaya eşdeğer; perspektifi değiştirmez)."""

    def __init__(self, konum, hedef, f, W, H, ox=0.0, oy=0.0):
        self.c = np.array(konum, float)
        fw = np.array(hedef, float) - self.c
        fw /= np.linalg.norm(fw)
        r = np.cross([0, 1, 0], fw)
        r /= np.linalg.norm(r)
        u = np.cross(fw, r)
        self.R = np.stack([r, u, fw])
        self.f, self.W, self.H, self.ox, self.oy = f, W, H, ox, oy

    def normal_koord(self, X):
        v = self.R @ (np.array(X, float) - self.c)
        return v[0] / v[2], -v[1] / v[2]

    def p(self, X):
        v = self.R @ (np.array(X, float) - self.c)
        return (self.W / 2 + self.ox + self.f * v[0] / v[2], self.H / 2 + self.oy - self.f * v[1] / v[2])

    def derinlik(self, X):
        return float(self.R[2] @ (np.array(X, float) - self.c))


def dunya(nesne, X):
    """Nesne yerel koordinatı -> dünya (y ekseni etrafında dönüş + öteleme)."""
    x, y, z = X
    a = math.radians(nesne["aci"])
    ox, oy, oz = nesne["konum"]
    return (ox + x * math.cos(a) + z * math.sin(a), oy + y, oz - x * math.sin(a) + z * math.cos(a))


def homografi(src, dst):
    """dst (çıktı) -> src (girdi) PIL PERSPECTIVE katsayıları."""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        b += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


def renk(c, k):
    return tuple(max(0, min(255, int(v * k))) for v in c)


def isik_carpan(normal, isik=ISIK):
    L = np.array(isik, float)
    L /= np.linalg.norm(L)
    return 0.72 + 0.28 * max(0.0, float(np.dot(normal, L)))


def parla_alani(on, size):
    """Parlak pleksi ışığı (eski render.py ile birebir): ön yüzün ekran kutusuna göre üstten-sola hafif ışık,
    alta-sağa çok hafif koyulma. Tam görüntü boyunda `ek` dizisi döner (sonuç: doku*0.975 + 255*ek)."""
    W, H = size
    x0, y0 = min(p[0] for p in on), min(p[1] for p in on)
    x1, y1 = max(p[0] for p in on), max(p[1] for p in on)
    gy = np.linspace(0, 1, max(1, int(y1 - y0)))[:, None]
    gx = np.linspace(0, 1, max(1, int(x1 - x0)))[None, :]
    parla = np.clip(0.10 - 0.16 * (gx * 0.6 + gy * 0.4) + 0.05 * np.exp(-((gx - 0.18) * 7 - (gy - 0.1) * 3) ** 2),
                    -0.05, 0.14)
    ek = np.zeros((H, W), np.float32)
    ek[int(y0):int(y0) + parla.shape[0], int(x0):int(x0) + parla.shape[1]] = \
        parla[:H - int(y0), :W - int(x0)]
    return ek


# ── kart dokusu ─────────────────────────────────────────────────────
def kart_doku_pdf(pdf_yolu, px=DOKU_PX):
    """PDF'i (104 mm, 2 mm taşma) render et, 100x100 mm alanı kırp (eski render.py ile aynı)."""
    import pypdfium2 as pdfium
    p = pdfium.PdfDocument(pdf_yolu)[0]
    w_mm = p.get_size()[0] * 25.4 / 72
    sc = px / 100 * w_mm / (p.get_size()[0])
    img = p.render(scale=sc).to_pil().convert("RGB")
    k = img.width / w_mm
    b = (w_mm - 100) / 2 + 0.6              # kesim çizgisi kenarda görünmesin diye 0,6 mm içeriden kırp
    return img.crop((round(b * k), round(b * k), round((w_mm - b) * k), round((w_mm - b) * k))).resize(
        (px, px), Image.LANCZOS)


def doku_yukle(ad):
    """Önce scripts/gorsel/pdf/ altındaki baskı PDF'i (pypdfium2 varsa), yoksa çıkarılmış doku PNG'si."""
    onek = KARTLAR[ad][0]
    pdfler = sorted(glob.glob(os.path.join(PDF_KLASOR, onek + "*.pdf")))
    if pdfler:
        try:
            import pypdfium2  # noqa: F401
            print(f"  doku: {os.path.basename(pdfler[0])} (PDF)")
            return kart_doku_pdf(pdfler[0])
        except ImportError:
            pass
    yol = os.path.join(DOKU_KLASOR, ad + ".png")
    if not os.path.exists(yol):
        sys.exit(f"Doku yok: {yol}\nÖnce: python scripts/gorsel/urun_render.py doku-cikar")
    return Image.open(yol).convert("RGB")


# eski render.py'nin önden kare sahnesi (04/05): sahne([tek(G, 0)], (0, 70, -330), (0, 52, 0), 3700, W=H=2160), SS=2
ESKI_ON = dict(konum=(0, 70, -330), hedef=(0, 52, 0), f=3700, W=2160, H=2160, SS=2)


def doku_cikar(kaynak_jpg, S=DOKU_PX, kenar_mm=0.5):
    """Eski önden render'dan 100x100 mm kart yüzünü geri aç.
    1) Ön yüz köşelerini aynı kamerayla 4320 uzayında izdüşür, 2'ye böl (LANCZOS küçültme sürekli koordinatı yarılar).
    2) Eklenen ışığı geri al: gözlenen = doku*0.975 + 255*ek (0-255'e kırpılmış, tamsayıya kesilmiş).
       ek alanı 4320'de yeniden hesaplanıp 2160'a indirilir; doku = (gözlenen + 0.5 - 255*ek) / 0.975.
       Işığın 255'te kırptığı (doymuş) beyazlarda tersine çevirme griye kayar: oralarda değer 255'e çekilir.
    3) Ters homografiyle S x S dokuya örnekle; dış 0.5 mm halka ve R10 köşe dışları (zemin karışan pikseller)
       içerideki beyaz kart kenarıyla doldurulur (baskı içeriği kenardan en az 3 mm içeride)."""
    c = ESKI_ON
    SS = c["SS"]
    W2, H2 = c["W"] * SS, c["H"] * SS
    cam = Kamera(c["konum"], c["hedef"], c["f"] * SS, W2, H2)
    n = dict(aci=0, konum=(0, 0, 0))
    zf = -T / 2
    kose = np.array([cam.p(dunya(n, q)) for q in ((-50, T + 100, zf), (50, T + 100, zf), (50, T, zf), (-50, T, zf))])
    kose_k = kose / SS                                                       # 2160 görüntüde sürekli koordinat
    on = [cam.p(dunya(n, (x, y + T, zf))) for x, y in pano_hat()]
    ek = parla_alani(on, (W2, H2))
    ek_k = np.asarray(Image.fromarray(ek, "F").resize((c["W"], c["H"]), Image.LANCZOS), np.float32)

    gozlenen = np.asarray(Image.open(kaynak_jpg).convert("RGB"), np.float32)
    ters = (gozlenen + 0.5 - 255 * ek_k[..., None]) / 0.975
    # doymuş beyaz: gözlenen ~255 ve ışık > 0.025 (255*0.975 + 255*ek >= 255) → gerçek değer 255'e yakın
    doygunluk = np.clip((gozlenen - 249) / 6, 0, 1) * np.clip((ek_k[..., None] - 0.02) / 0.01, 0, 1)
    ters = ters + doygunluk * np.maximum(0, 255 - ters)
    ters = np.clip(ters, 0, 255)

    # doku pikseli (i+0.5) -> görüntü sürekli koord. -> görüntü piksel indisi (-0.5)
    Hm = cv2.getPerspectiveTransform(np.float32([[0, 0], [S, 0], [S, S], [0, S]]), np.float32(kose_k))
    Ta = np.array([[1, 0, 0.5], [0, 1, 0.5], [0, 0, 1]])
    Tb = np.array([[1, 0, -0.5], [0, 1, -0.5], [0, 0, 1]])
    M = Tb @ Hm @ Ta
    doku = cv2.warpPerspective(ters, M, (S, S), flags=cv2.INTER_LANCZOS4 | cv2.WARP_INVERSE_MAP,
                               borderMode=cv2.BORDER_REPLICATE)
    doku = np.clip(doku, 0, 255)

    # geçerli bölge: R10 üst köşeli kare, kenar_mm içeri çekilmiş
    k = S / 100.0
    X = (np.arange(S) + 0.5) / k
    XX, YY = np.meshgrid(X, X)                     # YY: üstten mm (kart koordinatı, y aşağı)
    e = kenar_mm
    gecerli = (XX > e) & (XX < 100 - e) & (YY > e) & (YY < 100 - e)
    for cx in (10, 90):
        kosede = (np.abs(XX - cx) <= 10) & (YY < 10) & ((XX < 10) if cx == 10 else (XX > 90))
        gecerli &= ~kosede | (np.hypot(XX - cx, YY - 10) < 10 - e)
    doku8 = np.round(doku).astype(np.uint8)
    doldur = (~gecerli).astype(np.uint8) * 255
    doku8 = cv2.inpaint(doku8, doldur, 4, cv2.INPAINT_TELEA)
    return Image.fromarray(doku8), dict(kose_2160=kose_k.tolist())


# ── çizim ───────────────────────────────────────────────────────────
class Tuval:
    """Ürün çizimi: RGB görüntü + kapsama maskesi (ürünün olduğu yerde 255)."""

    def __init__(self, img, kapsam=None):
        self.img, self.kapsam = img, kapsam
        self.d = ImageDraw.Draw(img)
        self.dk = ImageDraw.Draw(kapsam) if kapsam is not None else None

    def poligon(self, pts, fill, outline=None, width=1):
        self.d.polygon(pts, fill=fill, outline=outline, width=width)
        if self.dk is not None:
            self.dk.polygon(pts, fill=255, outline=255 if outline is not None else None, width=width)


def ciz_nesne(tv, cam, nesne, eski=False):
    """Bir standı çiz. nesne: doku, aci, konum; isteğe bağlı kaldir (pano yüksekliği, mm) ve patlat (tırnak + boş yuva).
    eski=True: eski render.py ile birebir aynı çizim (doğrulama için)."""
    img = tv.img
    a = math.radians(nesne["aci"])
    rot = lambda n: np.array([n[0] * math.cos(a) + n[2] * math.sin(a), n[1], -n[0] * math.sin(a) + n[2] * math.cos(a)])
    kaldir = nesne.get("kaldir", 0.0)
    patlat = nesne.get("patlat", False)

    # --- taban: yan yüzler (arkadan öne), sonra üst yüz
    th = taban_hat() if eski else taban_hat(16)
    yan = []
    for i in range(len(th)):
        (x0, z0), (x1, z1) = th[i], th[(i + 1) % len(th)]
        P = [dunya(nesne, q) for q in ((x0, 0, z0), (x1, 0, z1), (x1, T, z1), (x0, T, z0))]
        nrm = rot(np.array([z1 - z0, 0, -(x1 - x0)]) / (math.hypot(x1 - x0, z1 - z0) + 1e-9))
        yan.append((cam.derinlik(np.mean(P, 0)), P, nrm))
    for dep, P, nrm in sorted(yan, key=lambda t: -t[0]):
        if np.dot(nrm, np.array(cam.c) - np.array(P[0])) > 0:
            tv.poligon([cam.p(q) for q in P], fill=renk(KENAR, isik_carpan(nrm) * 0.97))
    ust = [cam.p(dunya(nesne, (x, T, z))) for x, z in th]
    tv.poligon(ust, fill=renk(BEYAZ, isik_carpan(np.array([0, 1, 0])) * 1.0))
    yuva = ((-25.1, -1.6), (25.1, -1.6), (25.1, 1.6), (-25.1, 1.6))
    yv = [cam.p(dunya(nesne, (x, T, z))) for x, z in yuva]
    if not patlat:
        tv.poligon(yv, fill=YUVA_ESKI)               # pano ile arasında ince koyu boşluk
    else:
        # boş yuva: koyu açıklık + içeride görünen arka duvar (gölgede) → ince koyu boşluk
        tv.poligon(yv, fill=YUVA_KOYU)
        duvar = [cam.p(dunya(nesne, q)) for q in ((-25.1, T, 1.6), (25.1, T, 1.6), (25.1, 0.6, 1.6), (-25.1, 0.6, 1.6))]
        m = Image.new("L", img.size, 0)
        ImageDraw.Draw(m).polygon(yv, fill=255)
        m2 = Image.new("L", img.size, 0)
        ImageDraw.Draw(m2).polygon(duvar, fill=255)
        m = ImageChops.multiply(m, m2)
        img.paste(Image.new("RGB", img.size, renk(KENAR, 0.42)), (0, 0), m)

    # --- pano: kenar şeritleri, sonra baskılı ön yüz
    ph = pano_hat() if eski else pano_hat(n=28, tirnak=patlat, adim=2.0)
    yb = T + kaldir                                   # pano alt kenarının dünya yüksekliği
    zf, zb = -T / 2, T / 2
    for i in range(len(ph)):
        (x0, y0), (x1, y1) = ph[i], ph[(i + 1) % len(ph)]
        P = [dunya(nesne, q) for q in ((x0, y0 + yb, zf), (x1, y1 + yb, zf), (x1, y1 + yb, zb), (x0, y0 + yb, zb))]
        nrm = rot(np.array([y1 - y0, -(x1 - x0), 0]) / (math.hypot(x1 - x0, y1 - y0) + 1e-9))
        k = isik_carpan(nrm)
        if eski:
            tv.poligon([cam.p(q) for q in P], fill=renk(KENAR, k))
            continue
        # parlak (alevle cilalanmış) kesim kenarı: üstte açık, altta hafif koyu; kalınlığın ortasında ince parlama,
        # arka kenara doğru hafif koyulma. Önce şeridin tamamı, sonra üstüne bantlar (boşluk kalmaz).
        h = ((y0 + y1) / 2 + 2.5) / 102.5
        k *= 0.94 + 0.08 * h ** 1.5
        tv.poligon([cam.p(q) for q in P], fill=renk(KENAR, k))
        for z0, z1, kat in ((0.30, 0.52, 1.075), (0.72, 1.0, 0.95)):
            Q = [dunya(nesne, q) for q in ((x0, y0 + yb, zf + T * z0), (x1, y1 + yb, zf + T * z0),
                                           (x1, y1 + yb, zf + T * z1), (x0, y0 + yb, zf + T * z1))]
            tv.poligon([cam.p(q) for q in Q], fill=renk(KENAR, k * kat))
    on = [cam.p(dunya(nesne, (x, y + yb, zf))) for x, y in ph]
    tv.poligon(on, fill=BEYAZ, outline=BEYAZ, width=3)   # kenar şeridinin ön yüz sınırına sızmasını önler

    # doku: kart 100x100 -> ön yüz (-50..50, yb..yb+100); tırnak baskısız kalır
    baski = on if eski else [cam.p(dunya(nesne, (x, y + yb, zf))) for x, y in pano_hat(n=28, adim=2.0)]
    kose2 = [cam.p(dunya(nesne, q)) for q in ((-50, yb + 100, zf), (50, yb + 100, zf), (50, yb, zf), (-50, yb, zf))]
    x0, y0 = min(p[0] for p in baski), min(p[1] for p in baski)
    x1, y1 = max(p[0] for p in baski), max(p[1] for p in baski)
    bx0, by0 = max(0, int(x0)), max(0, int(y0))
    bx1, by1 = min(img.width, int(x0) + int(x1 - x0) + 3), min(img.height, int(y0) + int(y1 - y0) + 3)
    bw, bh = bx1 - bx0, by1 - by0
    doku = nesne["doku"]
    if not eski:
        # ekrandaki boyuttan çok büyük dokuyu önce küçült (dönüşüm BICUBIC'i örtüşme yapmasın)
        ekran = max(math.dist(kose2[i], kose2[(i + 1) % 4]) for i in range(4))
        if doku.width > 1.4 * ekran:
            doku = doku.resize((round(1.2 * ekran),) * 2, Image.LANCZOS)
    s = doku.width
    coef = homografi([(0, 0), (s, 0), (s, s), (0, s)], [(x - bx0, y - by0) for x, y in kose2])
    tex = doku.transform((bw, bh), Image.PERSPECTIVE, coef, Image.BICUBIC, fillcolor=(255, 255, 255))
    maske = Image.new("L", (bw, bh), 0)
    ImageDraw.Draw(maske).polygon([(x - bx0, y - by0) for x, y in baski], fill=255)
    # parlak pleksi ışığı (eski betikle aynı alan, aynı formül)
    ek = parla_alani([(x - bx0, y - by0) for x, y in baski], (bw, bh)) if (bx0, by0) == (int(x0), int(y0)) else \
        parla_alani(baski, img.size)[by0:by1, bx0:bx1]
    tex_np = np.asarray(tex).astype(np.float32) * 0.975 + 255 * ek[..., None]
    tex = Image.fromarray(np.clip(tex_np, 0, 255).astype(np.uint8))
    img.paste(tex, (bx0, by0), maske)


# ── eski sahne (doğrulama için, render.py ile birebir) ──────────────
def _eski_siluet(cam, nesne, size):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    Lx, Lz = 0.42, 0.55
    ph = pano_hat()
    pts = []
    for x, y in ph:
        h = y + T
        pts.append(cam.p(dunya(nesne, (x + Lx * h, 0, Lz * h))))
    for x, y in ph[::-1]:
        pts.append(cam.p(dunya(nesne, (x, 0, 0))))
    d.polygon(pts, fill=255)
    d.polygon([cam.p(dunya(nesne, (x, 0, z))) for x, z in taban_hat()], fill=255)
    return m


def _eski_taban_maske(cam, n, size):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon([cam.p(dunya(n, (x * 1.02, 0, z * 1.1))) for x, z in taban_hat()], fill=255)
    return m


def eski_sahne(nesneler, konum, hedef, f, W, H, SS=2, zemin=((243, 244, 246), (222, 225, 229))):
    W2, H2 = W * SS, H * SS
    cam = Kamera(konum, hedef, f * SS, W2, H2)
    g = np.linspace(0, 1, H2)[:, None, None]
    c0, c1 = np.array(zemin[0]), np.array(zemin[1])
    bg = (c0 * (1 - g) + c1 * g) * np.ones((1, W2, 1))
    img = Image.fromarray(bg.astype(np.uint8))
    for yaricap, guc in ((70, 0.20), (14, 0.30)):
        m = Image.new("L", (W2, H2), 0)
        for n in nesneler:
            m = ImageChops.lighter(m, _eski_siluet(cam, n, (W2, H2)) if yaricap > 20 else
                                   _eski_taban_maske(cam, n, (W2, H2)))
        m = m.filter(ImageFilter.GaussianBlur(yaricap * SS / 2))
        golge = Image.new("RGB", (W2, H2), (40, 44, 50))
        img = Image.composite(golge, img, m.point(lambda v: int(v * guc)))
    for n in sorted(nesneler, key=lambda n: -cam.derinlik(dunya(n, (0, 50, 0)))):
        ciz_nesne(Tuval(img), cam, n, eski=True)
    return img.resize((W, H), Image.LANCZOS)


# ── komutlar ────────────────────────────────────────────────────────
def komut_doku_cikar(kaynak=ESKI_KAYNAK):
    os.makedirs(DOKU_KLASOR, exist_ok=True)
    for ad, (_, jpg) in KARTLAR.items():
        doku, bilgi = doku_cikar(os.path.join(kaynak, jpg))
        yol = os.path.join(DOKU_KLASOR, ad + ".png")
        doku.save(yol, optimize=True)
        print(yol, doku.size, "köşeler (2160):", [tuple(round(v, 2) for v in p) for p in bilgi["kose_2160"]])


def komut_dogrula(kaynak=ESKI_KAYNAK, cikti=None):
    """Çıkarılan dokuyla eski önden sahneyi birebir aynı parametrelerle yeniden çiz ve orijinalle karşılaştır."""
    c = ESKI_ON
    for ad, (_, jpg) in KARTLAR.items():
        doku = Image.open(os.path.join(DOKU_KLASOR, ad + ".png")).convert("RGB")
        yeni = eski_sahne([dict(doku=doku, aci=0, konum=(0, 0, 0))], c["konum"], c["hedef"], c["f"], c["W"], c["H"],
                          SS=c["SS"])
        orj = np.asarray(Image.open(os.path.join(kaynak, jpg)).convert("RGB"), np.float32)
        yn = np.asarray(yeni, np.float32)
        fark = np.abs(orj - yn)
        # pano ön yüzü bölgesi
        cam = Kamera(c["konum"], c["hedef"], c["f"], c["W"], c["H"])
        on = [cam.p(dunya(dict(aci=0, konum=(0, 0, 0)), (x, y + T, -T / 2))) for x, y in pano_hat()]
        m = Image.new("L", (c["W"], c["H"]), 0)
        ImageDraw.Draw(m).polygon(on, fill=255)
        m = np.asarray(m.filter(ImageFilter.MinFilter(9))) > 0        # kenardan 4 px içerisi
        print(f"{ad}: ortalama mutlak fark tüm görüntü {fark.mean():.3f}, pano yüzü {fark[m].mean():.3f}, "
              f"pano yüzü %99 {np.percentile(fark[m].max(-1), 99):.1f}, en büyük {fark[m].max():.0f} (0-255)")
        if cikti:
            os.makedirs(cikti, exist_ok=True)
            yeni.save(os.path.join(cikti, f"dogrula-{ad}-yeni.png"))
            Image.fromarray(np.clip(fark.max(-1) * 8, 0, 255).astype(np.uint8)).save(
                os.path.join(cikti, f"dogrula-{ad}-fark-x8.png"))


# ── yeni sahneler: şeffaf zemin ─────────────────────────────────────
SS = 3                                  # süper örnekleme (çizim SS kat büyükte yapılır, alfa ön çarpımlı küçültülür)
GOLGE_YON = (0.42, 0.55)                # gölge kayması (dünya x, z) / yükseklik: ışık sol-üst-önden
GOLGE_PNG = (34, 36, 40)                # şeffaf PNG'de gölge tonu (nötr koyu)
GOLGE_KAGIT = (52, 50, 40)              # kâğıt zeminde sıcak koyu gölge
KAGIT_ZEMIN = ((0xF4, 0xF4, 0xEE), (0xE6, 0xE5, 0xDC))
# gölge güçleri: pano (yönlü, yükseklikle açılır), taban kısa gölgesi, geniş ortam gölgesi, dar temas gölgesi
GOLGE_GUC = dict(pano=0.30, taban=0.20, ortam=0.12, temas=0.36)


def pano_yb(nesne):
    return T + nesne.get("kaldir", 0.0)


def urun_noktalari(nesne):
    """Kadraj için ürünün bütün köşe noktaları (dünya)."""
    pts = []
    for x, z in taban_hat():
        pts += [dunya(nesne, (x, 0, z)), dunya(nesne, (x, T, z))]
    yb = pano_yb(nesne)
    for x, y in pano_hat(tirnak=nesne.get("patlat", False)):
        pts += [dunya(nesne, (x, y + yb, -T / 2)), dunya(nesne, (x, y + yb, T / 2))]
    return pts


def _bant(poly, ya, yb):
    """Poligonu ya <= y <= yb bandına kırp (Sutherland-Hodgman, iki yatay yarı düzlem)."""
    def kirp(p, sinir, alt):
        out = []
        for i in range(len(p)):
            a, b = p[i], p[(i + 1) % len(p)]
            ia = a[1] >= sinir if alt else a[1] <= sinir
            ib = b[1] >= sinir if alt else b[1] <= sinir
            if ia:
                out.append(a)
            if ia != ib:
                t = (sinir - a[1]) / (b[1] - a[1])
                out.append((a[0] + t * (b[0] - a[0]), sinir))
        return out
    p = kirp(poly, ya, True)
    return kirp(p, yb, False) if len(p) >= 3 else []


def golge_parcalari(nesne):
    """Zemine (y=0) düşen gölge parçaları: (katman, dünya poligonları (birleşimi), sigma mm, güç).
    Pano gölgesi yükseklik bantlarına bölünür: yere yakın kısım koyu ve keskin, yukarısı açık ve yumuşak
    (gerçek gölgede yarı gölge yükseklikle genişler). Taban: kısa gölge, geniş ortam gölgesi, dar temas."""
    Lx, Lz = GOLGE_YON
    yb = pano_yb(nesne)
    hat = pano_hat(tirnak=nesne.get("patlat", False))
    y0, y1, N = min(y for _, y in hat), 100.0, 8
    out = []
    for i in range(N):
        bant = _bant(hat, y0 + (y1 - y0) * i / N, y0 + (y1 - y0) * (i + 1) / N)
        if len(bant) < 3:
            continue
        h = yb + y0 + (y1 - y0) * (i + 0.5) / N                 # bandın yerden yüksekliği (mm)
        poly = []
        for x, y in bant:
            X = dunya(nesne, (x, y + yb, 0))
            poly.append((X[0] + Lx * X[1], 0, X[2] + Lz * X[1]))
        out.append(("pano", [poly], 1.4 + 0.085 * h, GOLGE_GUC["pano"] * max(0.30, 1 - 0.62 * h / 105)))
    taban = [dunya(nesne, (x, 0, z)) for x, z in taban_hat()]
    kisa = [(X[0] + Lx * T, 0, X[2] + Lz * T) for X in taban]
    temas = [dunya(nesne, (x * 1.02, 0, z * 1.1)) for x, z in taban_hat()]
    out += [("taban", [taban, kisa], 2.2, GOLGE_GUC["taban"]), ("ortam", [taban], 8.0, GOLGE_GUC["ortam"]),
            ("temas", [temas], 0.9, GOLGE_GUC["temas"])]
    return out


def golge_ciz(cam, nesneler, W, H, mm):
    """Gölge alfası (son boyutta, float). Geniş bulanıklıklar düşük çözünürlükte çizilip büyütülür."""
    toplam = np.zeros((H, W), np.float32)
    for n in nesneler:
        katman = {}
        for ad, polys, sigma, guc in golge_parcalari(n):
            s = sigma * mm                                          # piksel
            k = max(1, int(s // 6))                                 # alt örnekleme katı (sigma >= 6 px kalsın)
            w, h = -(-W // k), -(-H // k)
            m = Image.new("L", (w, h), 0)
            for poly in polys:
                ImageDraw.Draw(m).polygon([((x + 0.5) / k - 0.5, (y + 0.5) / k - 0.5)
                                           for x, y in (cam.p(q) for q in poly)], fill=255)
            a = cv2.GaussianBlur(np.asarray(m, np.float32) / 255.0, (0, 0), s / k)
            if k > 1:
                a = cv2.resize(a, (w * k, h * k), interpolation=cv2.INTER_CUBIC)[:H, :W]
            katman[ad] = katman.get(ad, 0) + guc * a
        for a in katman.values():
            toplam = 1 - (1 - toplam) * (1 - np.clip(a, 0, 1))
    return toplam


def kenar_sondurme(W, H, oran=0.055):
    """Gölgeyi kadraj kenarına varmadan yumuşakça söndüren pencere (kenarda 0, içeride 1)."""
    d = oran * min(W, H)
    ss = lambda t: (lambda c: c * c * (3 - 2 * c))(np.clip(t, 0, 1))
    x, y = np.arange(W) + 0.5, np.arange(H) + 0.5
    return (ss(np.minimum(y, H - y) / d)[:, None] * ss(np.minimum(x, W - x) / d)[None, :]).astype(np.float32)


def kadraj(sahne, nesneler):
    """Odak uzaklığı f ve optik merkez kaydırması (ox, oy): ürün kutusu kenarlardan en az `kenar` (oran) içeride
    ve ortalı (`kaydir` ile ince ayar). `genislik` verilirse ürün genişliği W'nin o oranı olur; yoksa sığan en büyük f.
    Gölge kadraja göre hesaplanmaz; kenara yaklaşırsa yumuşakça söner."""
    W, H = sahne["W"], sahne["H"]
    kenar = sahne.get("kenar", 0.08)
    cam0 = Kamera(sahne["kamera"], sahne["hedef"], 1.0, W, H)
    U = np.array([cam0.normal_koord(p) for n in nesneler for p in urun_noktalari(n)])
    d = float(np.mean([cam0.derinlik(p) for n in nesneler for p in urun_noktalari(n)]))
    Umin, Umax = U.min(0), U.max(0)
    if sahne.get("genislik"):
        f = sahne["genislik"] * W / (Umax[0] - Umin[0])
    else:
        f = min(W * (1 - 2 * kenar) / (Umax[0] - Umin[0]), H * (1 - 2 * kenar) / (Umax[1] - Umin[1]))
    kay = sahne.get("kaydir", (0, 0))
    ox = -f * (Umin[0] + Umax[0]) / 2 + kay[0] * W
    oy = -f * (Umin[1] + Umax[1]) / 2 + kay[1] * H
    return f, ox, oy, d


def ciz_sahne(sahne, dokular):
    """Bir sahneyi çiz: (ürün ön çarpımlı RGB, ürün alfası, gölge alfası) — hepsi son boyutta float32."""
    W, H = sahne["W"], sahne["H"]
    nesneler = [dict(doku=dokular[k], aci=a, konum=konum, **ek) for k, a, konum, ek in sahne["nesneler"]]
    f, ox, oy, d = kadraj(sahne, nesneler)

    # gölgeler: son boyutta (yumuşak oldukları için süper örnekleme gerekmez)
    cam1 = Kamera(sahne["kamera"], sahne["hedef"], f, W, H, ox, oy)
    golge = golge_ciz(cam1, nesneler, W, H, f / d) * kenar_sondurme(W, H)

    # ürün: SS kat büyükte çiz
    W2, H2 = W * SS, H * SS
    cam = Kamera(sahne["kamera"], sahne["hedef"], f * SS, W2, H2, ox * SS, oy * SS)
    img = Image.new("RGB", (W2, H2), (0, 0, 0))
    kapsam = Image.new("L", (W2, H2), 0)
    tv = Tuval(img, kapsam)
    for n in sorted(nesneler, key=lambda n: -cam.derinlik(dunya(n, (0, 50, 0)))):
        ciz_nesne(tv, cam, n)
    # kapsam ikili (0/255) ve kapsam dışı siyah → RGB zaten ön çarpımlı; kutu süzgeciyle küçült (halka/taşma yok)
    P = cv2.resize(np.asarray(img, np.float32), (W, H), interpolation=cv2.INTER_AREA)
    A = cv2.resize(np.asarray(kapsam, np.float32) / 255.0, (W, H), interpolation=cv2.INTER_AREA)
    del img, kapsam, tv
    return P, A, golge


def png_yaz(P, A, golge, yol):
    """Şeffaf zemin: ürün opak, gölge yarı saydam koyu ton. Ön çarpımlı birleştirme, sonra düz alfaya çevir."""
    g = golge * (1 - A)
    At = A + g
    Cp = P + np.array(GOLGE_PNG, np.float32) * g[..., None]
    C = np.where(At[..., None] > 1e-6, Cp / np.maximum(At, 1e-6)[..., None], np.array(GOLGE_PNG, np.float32))
    rgba = np.dstack([np.clip(np.round(C), 0, 255), np.clip(np.round(At * 255), 0, 255)]).astype(np.uint8)
    rgba[rgba[..., 3] == 0, :3] = GOLGE_PNG                    # tamamen saydam piksellerde sabit renk
    Image.fromarray(rgba, "RGBA").save(yol, optimize=True)
    return rgba


def kagit_yaz(P, A, golge, yol):
    H, W = A.shape
    g = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    c0, c1 = np.array(KAGIT_ZEMIN[0], np.float32), np.array(KAGIT_ZEMIN[1], np.float32)
    zemin = (c0 * (1 - g) + c1 * g) * np.ones((1, W, 1), np.float32)
    zemin = zemin * (1 - golge[..., None]) + np.array(GOLGE_KAGIT, np.float32) * golge[..., None]
    out = P + zemin * (1 - A[..., None])
    Image.fromarray(np.clip(np.round(out), 0, 255).astype(np.uint8)).save(yol, quality=92, subsampling=0,
                                                                          optimize=True)


def kenar_payi(rgba):
    """Ürün (alfa > 0.5) ve görünür gölge (alfa >= 2/255) kutusunun kenarlara uzaklığı (%: sol, üst, sağ, alt)."""
    H, W = rgba.shape[:2]
    out = {}
    for ad, esik in (("urun", 128), ("golge", 2)):
        ys, xs = np.where(rgba[..., 3] >= esik)
        out[ad] = tuple(round(float(v) * 100, 1) for v in
                        (xs.min() / W, ys.min() / H, (W - 1 - xs.max()) / W, (H - 1 - ys.max()) / H))
    return out


def S_(ad, W, H, nesneler, kamera, hedef, **k):
    return dict(ad=ad, W=W, H=H, nesneler=nesneler, kamera=kamera, hedef=hedef, **k)


# nesne: (kart, aci, konum, ek seçenekler)
SAHNELER = [
    S_("ikili-hero", 2400, 1800, [("google", -16, (-57, 0, -4), {}), ("instagram", 16, (57, 0, 18), {})],
       kamera=(0, 80, -390), hedef=(0, 50, 8), genislik=0.75, kagit=True),
    S_("google-34", 1800, 2250, [("google", -24, (0, 0, 0), {})],
       kamera=(-150, 125, -300), hedef=(0, 50, 0), kenar=0.08, kagit=True),
    S_("instagram-34", 1800, 2250, [("instagram", 24, (0, 0, 0), {})],
       kamera=(150, 125, -300), hedef=(0, 50, 0), kenar=0.08, kagit=True),
    S_("google-on", 2000, 2000, [("google", 0, (0, 0, 0), {})],
       kamera=(0, 70, -330), hedef=(0, 52, 0), kenar=0.09),
    S_("instagram-on", 2000, 2000, [("instagram", 0, (0, 0, 0), {})],
       kamera=(0, 70, -330), hedef=(0, 52, 0), kenar=0.09),
    S_("google-yan", 1800, 1800, [("google", -68, (0, 0, 0), {})],
       kamera=(-25, 105, -340), hedef=(0, 52, 0), kenar=0.08),
    S_("ikili-ust", 2400, 1800, [("google", -8, (-58, 0, 0), {}), ("instagram", 8, (58, 0, 0), {})],
       kamera=(0, 470, -483), hedef=(0, 35, 0), kenar=0.08, kagit=True),
    S_("google-parcalar", 1800, 2250, [("google", -24, (0, 0, 0), dict(kaldir=45.0, patlat=True))],
       kamera=(-150, 160, -300), hedef=(0, 70, 0), kenar=0.08),
    S_("instagram-34-sol", 1800, 2250, [("instagram", -24, (0, 0, 0), {})],
       kamera=(-150, 125, -300), hedef=(0, 50, 0), kenar=0.08),
]


def komut_sahneler(secilen=None):
    os.makedirs(CIKTI, exist_ok=True)
    os.makedirs(KAGIT_CIKTI, exist_ok=True)
    dokular = {ad: doku_yukle(ad) for ad in KARTLAR}
    for sahne in SAHNELER:
        if secilen and sahne["ad"] not in secilen:
            continue
        t0 = time.time()
        P, A, golge = ciz_sahne(sahne, dokular)
        yol = os.path.join(CIKTI, sahne["ad"] + ".png")
        rgba = png_yaz(P, A, golge, yol)
        pay = kenar_payi(rgba)
        print(f"{yol}  {sahne['W']}x{sahne['H']}  {os.path.getsize(yol) // 1024} KB  {time.time() - t0:.1f} sn  "
              f"ürün payı (sol,üst,sağ,alt) {pay['urun']} %  gölge payı {pay['golge']} %  "
              f"kenarda en büyük alfa {int(max(rgba[0, :, 3].max(), rgba[-1, :, 3].max(), rgba[:, 0, 3].max(), rgba[:, -1, 3].max()))}")
        if sahne.get("kagit"):
            yk = os.path.join(KAGIT_CIKTI, sahne["ad"] + ".jpg")
            kagit_yaz(P, A, golge, yk)
            print(f"{yk}  {os.path.getsize(yk) // 1024} KB")


if __name__ == "__main__":
    arg = sys.argv[1:]
    if arg and arg[0] == "doku-cikar":
        komut_doku_cikar(*arg[1:2])
    elif arg and arg[0] == "dogrula":
        komut_dogrula(*arg[1:3])
    elif arg and arg[0] == "sahne":
        komut_sahneler(set(arg[1:]))
    else:
        komut_sahneler()
