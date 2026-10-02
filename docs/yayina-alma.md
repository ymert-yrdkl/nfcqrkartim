# Yayına alma (Coolify, nfcqrkartimcom.ahmcloud.com)

Sunucu Ahmet'in; aşağıdaki adımlar Yusuf ve Ahmet'in onayıyla yapılır.

## 1. Kod
GitHub'da özel bir depo açın (öneri: `ymert-yrdkl/nfcqrkartim`) ve gönderin:

```bash
git remote add origin git@github.com:ymert-yrdkl/nfcqrkartim.git
git push -u origin main
```

## 2. Coolify kaynağı
En kolayı **Dockerfile** yapı paketi:
1. Yeni kaynak → özel depo (deploy key) → dal `main` → Build Pack: **Dockerfile**.
2. Port: **3000**. Alan adı: `https://nfcqrkartimcom.ahmcloud.com`.
3. **Kalıcı depolama:** hedef yol `/veri` (siparişler, stok ve mesajlar buradaki SQLite dosyasında). Bu
   eklenmezse her dağıtımda bütün siparişler silinir.
4. Ortam değişkenleri:
   - `YONETICI_SIFRE` = uzun bir şifre (yönetim paneli `/yonetim`)
   - `OTURUM_GIZLI` = en az 32 karakter rastgele (`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`)
   - `SITE_ADRESI` = `https://nfcqrkartimcom.ahmcloud.com`
   - `ARAMA_MOTORU_ACIK` = `0` (demo; gerçek alan adında `1`)
5. Sağlık kontrolü: `/api/saglik` (imajın içinde HEALTHCHECK de var).

Alternatif: depodaki `docker-compose.yml` ile "Docker Compose" kaynağı; alan adı `magaza` servisine
`https://nfcqrkartimcom.ahmcloud.com:3000` olarak verilir, birim (`magaza-veri`) dosyada tanımlı.

## 3. DNS
`nfcqrkartimcom.ahmcloud.com` için Hostinger'da A kaydı → Coolify sunucusunun IP'si (ahmcloud.com'un diğer alt
alanlarıyla aynı).

## 4. Yedek
Tek dosya: birimdeki `/veri/magaza.sqlite` (+ `-wal`, `-shm`). Coolify'ın birim yedeği ya da günlük kopya yeterli.

## Notlar
- Görsel iyileştirme için sharp'ın yerel kütüphaneleri Dockerfile'da açıkça kopyalanıyor (standalone izleyicisi
  kaçırıyor; yerelde doğrulandı: aynı görsel 605 KB PNG yerine 17 KB AVIF).
- `node:sqlite` Node 24'te deneysel uyarısı verir; imajda `NODE_OPTIONS=--disable-warning=ExperimentalWarning`.
