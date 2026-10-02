// nfcqrkartim yasal metinleri. TASLAKTIR: hukukçu incelemesinden geçmeden yayımlanmaz.
// {{...}} yer tutucuları yayından önce gerçek bilgilerle doldurulur.
// `notlar` alanı sitede gösterilmez; hukukçuya ve işletmeye sorulacak noktaları tutar.

export type YasalBlok =
  | string // paragraf
  | { tur: "liste"; maddeler: string[] } // madde işaretli liste
  | { tur: "sirali"; maddeler: string[] } // numaralı liste
  | { tur: "tablo"; basliklar: string[]; satirlar: string[][] };

export type YasalBolum = { baslik: string; bloklar: YasalBlok[] };

export type YasalBelge = {
  slug: string; // URL parçası, küçük harf-tire, Türkçe karaktersiz
  baslik: string; // sayfa başlığı
  kisaBaslik: string; // alt bilgi bağlantısı için (en çok 3 kelime)
  ozet: string; // 1-2 cümle, sayfanın başında ve meta açıklamada
  bolumler: YasalBolum[];
  notlar: string[]; // hukukçuya notlar (sitede gösterilmez)
};

// ---------------------------------------------------------------------------
// Birden çok belgede aynen tekrar eden bloklar
// ---------------------------------------------------------------------------

const SATICI_BILGILERI: YasalBlok = {
  tur: "tablo",
  basliklar: ["Bilgi", "Satıcı"],
  satirlar: [
    ["Unvan", "{{SATICI_UNVAN}}"],
    ["Adres", "{{SATICI_ADRES}}"],
    ["Telefon", "{{SATICI_TELEFON}}"],
    ["E-posta", "{{SATICI_EPOSTA}}"],
    ["KEP adresi (kayıtlı elektronik posta)", "{{SATICI_KEP}}"],
    ["MERSİS numarası (Merkezi Sicil Kayıt Sistemi numarası)", "{{SATICI_MERSIS}}"],
    ["Vergi dairesi", "{{SATICI_VERGI_DAIRESI}}"],
    ["Vergi numarası", "{{SATICI_VERGI_NO}}"],
    ["İnternet sitesi", "{{SITE_ADRESI}}"],
  ],
};

const URUN_NITELIKLERI: YasalBlok = {
  tur: "liste",
  maddeler: [
    "Ürün, işletmenin kasasına ya da masasına konmak için yapılmış 100 × 100 mm boyutunda bir pleksi standdır. Stand, 3 mm kalınlığında parlak beyaz pleksi bir pano ile 100 × 35 mm boyutunda bir tabandan oluşur.",
    "Panoda bir NFC çipi (telefon yaklaştırılınca okunan temassız çip) ve dinamik bir QR kod (yönlendirdiği adres sonradan değiştirilebilen kare kod) bulunur.",
    "Modeller: Google yorum standı, Instagram takip standı ve ikisini birlikte içeren ikili set. Siparişinizdeki model ve adet sipariş özetinde yazar.",
    "Her standın kendine ait bir kart kodu vardır. QR kod ve NFC çipi, bu kodla https://ahmcloud.com/q/KOD biçimindeki bir yönlendirme adresine gider.",
    "Kartı kendi bağlantınıza (örneğin işletmenizin Google yorum sayfasına ya da Instagram profiline) https://ahmcloud.com/kart adresindeki kurulum panelinden, bir hesapla giriş yaparak siz bağlarsınız. Bağlantıyı istediğiniz zaman aynı panelden değiştirebilirsiniz.",
    "Yönlendirme hizmeti ürünle birlikte verilir. Hizmetin süresi ve kapsamı: {{YONLENDIRME_HIZMET_SURESI}}.",
    "Kartın çalışması için yönlendirme hizmetinin sürmesi ve okutan telefonun internete bağlı olması gerekir. Yönlendirme hizmeti sona ererse QR kod ve NFC çipi sizin bağlantınıza yönlendirmez.",
    "NFC ile okutmak için telefonun NFC özelliğinin bulunması ve açık olması gerekir. NFC özelliği olmayan telefonlarda QR kod, telefonun kamerasıyla okutulabilir.",
    "Ürün kişiye özel üretilmez. Baskısı bütün alıcılar için aynıdır; işletmenizin adı ya da logosu ürüne basılmaz.",
  ],
};

const CAYMA_BILDIRIM_KANALLARI: YasalBlok = {
  tur: "liste",
  maddeler: [
    "E-posta: {{SATICI_EPOSTA}}",
    "KEP (kayıtlı elektronik posta): {{SATICI_KEP}}",
    "Posta: {{SATICI_UNVAN}}, {{SATICI_ADRES}}",
  ],
};

const TUKETICI_UYUSMAZLIK: string =
  "Uyuşmazlık durumunda, Ticaret Bakanlığınca her yıl belirlenen parasal sınırlar içinde yerleşim yerinizdeki ya da tüketici işlemini yaptığınız yerdeki Tüketici Hakem Heyetine (belirli tutarın altındaki tüketici uyuşmazlıklarına bakan kurul), bu sınırları aşan uyuşmazlıklarda Tüketici Mahkemesine başvurabilirsiniz. Tüketici Mahkemesinde dava açmadan önce, kanunun öngördüğü durumlarda arabulucuya (tarafları uzlaştırmaya çalışan tarafsız kişi) başvurmanız gerekir.";

// ---------------------------------------------------------------------------
// 1. Ön bilgilendirme formu
// ---------------------------------------------------------------------------

const ON_BILGILENDIRME: YasalBelge = {
  slug: "on-bilgilendirme",
  baslik: "Ön bilgilendirme formu",
  kisaBaslik: "Ön bilgilendirme",
  ozet: "Siparişinizi vermeden önce satıcıyı, ürünü, toplam bedeli, ödeme ve teslimat koşullarını ve cayma hakkınızı bu formdan öğrenirsiniz. Siparişinize özgü bilgiler ödeme sayfasındaki sipariş özetinde yer alır.",
  bolumler: [
    {
      baslik: "Bu form ne işe yarar",
      bloklar: [
        "Bu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği (Resmî Gazete, 27.11.2014) ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca, siparişinizi vermeden önce size verilmesi gereken bilgileri içerir.",
        "Bu sitede yaptığınız alışveriş bir mesafeli sözleşmedir (satıcıyla yüz yüze gelmeden, internet gibi bir uzaktan iletişim aracıyla kurulan sözleşme).",
        "Siparişinize özgü bilgiler (ürün, adet, birim fiyat, KDV dahil toplam bedel, kargo ücreti, ödeme yöntemi, teslimat ve fatura bilgileri) ödeme sayfasında ve sipariş onay sayfasında gösterilen sipariş özetinde yer alır. Sipariş özeti bu formun ayrılmaz parçasıdır.",
        "Ödeme sayfasındaki onay kutusunu işaretleyerek bu formu okuduğunuzu ve bilgilendirildiğinizi teyit edersiniz. Siparişi onayladığınızda ödeme yükümlülüğü altına girersiniz.",
      ],
    },
    {
      baslik: "Satıcı",
      bloklar: [
        SATICI_BILGILERI,
        "Soru, talep ve şikâyetlerinizi bu iletişim bilgileri üzerinden iletebilirsiniz.",
      ],
    },
    {
      baslik: "Alıcı",
      bloklar: [
        "Alıcı, ödeme sayfasında adını, telefonunu, e-posta adresini, teslimat ve fatura bilgilerini girerek sipariş veren kişidir. Bu bilgiler sipariş özetinde gösterilir. Bu formda alıcıya “siz” diye hitap edilir.",
      ],
    },
    {
      baslik: "Ürünün temel nitelikleri",
      bloklar: [
        URUN_NITELIKLERI,
        "Sitedeki görseller ürünü tanıtmak içindir. Ekran ve ışık farkları nedeniyle renklerde küçük farklılıklar görülebilir.",
      ],
    },
    {
      baslik: "Fiyat ve toplam bedel",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Fiyatlar Türk lirası olarak ve KDV (katma değer vergisi) dahil gösterilir.",
            "Birim fiyat, adet, kargo ücreti ve KDV dahil toplam bedel sipariş özetinde ayrı ayrı yazar.",
            "Sipariş özetinde gösterilmeyen bir ücret sizden istenmez.",
            "Siparişinize, siparişi onayladığınız andaki fiyat uygulanır. Sonradan yapılan fiyat değişiklikleri siparişinizi etkilemez.",
          ],
        },
      ],
    },
    {
      baslik: "Ödeme",
      bloklar: [
        "Ödemeyi, ödeme sayfasında sunulan yöntemlerden biriyle yaparsınız.",
        "Kredi ya da banka kartıyla ödemede ödeme, lisanslı ödeme kuruluşu iyzico'nun (İyzi Ödeme ve Elektronik Para Hizmetleri A.Ş.) güvenli ödeme sayfasında alınır. Kart bilgileriniz satıcıya iletilmez. Taksit seçenekleri ve varsa taksit farkı bu sayfada, ödemeden önce gösterilir. Ödeme onaylanmazsa ya da 45 dakika içinde tamamlanmazsa sipariş iptal edilir.",
        "Havale ya da EFT seçerseniz, siparişinizi onayladıktan sonra satıcının banka hesap bilgileri (IBAN) sipariş onay sayfasında gösterilir. Ödemenin siparişinizle eşleşmesi için ödeme açıklamasına sipariş numaranızı yazın.",
        "Havale ya da EFT ile ödemeniz {{ODEME_SURESI_GUN}} gün içinde satıcının hesabına ulaşmazsa sipariş iptal edilir. Bu durumda taraflar birbirinden bir şey isteyemez.",
        "Satıcı sizden ayrıca teminat (güvence olarak alınan para ya da belge) istemez.",
      ],
    },
    {
      baslik: "Teslimat",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Teslimat yalnız Türkiye içindeki adreslere yapılır.",
            "Ürün, sipariş özetindeki teslimat adresine {{KARGO_FIRMASI}} ile gönderilir.",
            "Ürün, ödemenizin onaylanmasından sonra {{KARGOYA_VERILIS_IS_GUNU}} iş günü içinde kargoya verilir.",
            "Teslim süresi, siparişinizin satıcıya ulaştığı tarihten itibaren hiçbir durumda 30 günü geçemez.",
            "Kargo ücreti varsa sipariş özetinde ayrıca gösterilir.",
            "Ürün size ya da belirttiğiniz kişiye teslim edilene kadar oluşan kayıp ve hasardan satıcı sorumludur.",
          ],
        },
        "Ayrıntılar Kargo ve teslimat sayfasındadır.",
      ],
    },
    {
      baslik: "Cayma hakkı",
      bloklar: [
        "Cayma hakkı, gerekçe göstermeden ve cezai şart (sözleşmeden dönen tarafın ödediği ceza bedeli) ödemeden sözleşmeden dönme hakkıdır.",
        {
          tur: "liste",
          maddeler: [
            "Süre: Ürünü sizin ya da belirttiğiniz kişinin teslim aldığı günden itibaren 14 gündür. Ürün teslim edilmeden önce de cayabilirsiniz.",
            "İstisna yok: Bu ürün kişiye özel üretilmez; bu nedenle kişiye özel ürünlere ilişkin cayma hakkı istisnası uygulanmaz. Kartı kurup kendi bağlantınıza bağlamış olmanız da cayma hakkınızı ortadan kaldırmaz.",
            "Bildirim: Cayma kararınızı süre bitmeden yazılı olarak ya da kalıcı veri saklayıcısıyla (e-posta gibi, bilgiyi değiştirmeden saklamanıza ve yeniden açmanıza imkân veren araç) aşağıdaki adreslerden birine bildirirsiniz.",
          ],
        },
        CAYMA_BILDIRIM_KANALLARI,
        {
          tur: "liste",
          maddeler: [
            "Ürünün geri gönderilmesi: Bildiriminizden itibaren 10 gün içinde ürünü {{KARGO_FIRMASI}} ile şu adrese gönderirsiniz: {{IADE_ADRESI}}.",
            "İade kargo ücreti: {{IADE_KARGO_KIMDE}}.",
            "Para iadesi: Satıcı, cayma bildiriminizin kendisine ulaştığı tarihten itibaren 14 gün içinde, varsa kargo ücreti dahil ödediğiniz bütün tutarı, ödeme yönteminize uygun biçimde, tek seferde ve sizden masraf kesmeden iade eder.",
            "Kurulumu yapılmış kart: İade edilen kartın bağlantısı sıfırlanır; kart bundan sonra sizin bağlantınıza yönlendirmez. Cayma hakkını kullandığınızda yönlendirme hizmeti de sona erer.",
            "Ürünün durumu: Ürünü işleyişine, teknik özelliklerine ve kullanım amacına uygun biçimde kurmanız ve denemeniz nedeniyle oluşan değişiklik ve bozulmalardan sorumlu değilsiniz.",
          ],
        },
        "Adım adım anlatım ve örnek cayma bildirimi İade ve cayma hakkı sayfasındadır.",
      ],
    },
    {
      baslik: "Kurumsal alıcılar",
      bloklar: [
        "Ürünü ticari ya da mesleki amaçla, bir işletme adına satın alan tacirler (ticari işletmeyi işleten kişi ya da şirket) tüketici sayılmaz. Bu alıcılar için cayma hakkı tüketici mevzuatından doğmaz.",
        "Satıcı, ticari politika olarak kurumsal alıcılara da teslimden itibaren 14 gün içinde iade imkânı tanır. Bu politikanın ayrıntıları: {{KURUMSAL_IADE_POLITIKASI}}.",
      ],
    },
    {
      baslik: "Ayıplı ürün",
      bloklar: [
        "Ayıplı ürün, sözleşmeye uygun olmayan, kusurlu ya da hasarlı üründür. Ürün ayıplı çıkarsa 6502 sayılı Kanun uyarınca şu haklardan birini seçebilirsiniz:",
        {
          tur: "liste",
          maddeler: [
            "Sözleşmeden dönme (ürünü geri verip ödediğiniz bedeli geri alma)",
            "Ayıp oranında bedelden indirim",
            "Ücretsiz onarım",
            "Ürünün ayıpsız bir benzeriyle değiştirilmesi",
          ],
        },
        "Ayıplı ürünün gönderim masrafını satıcı karşılar. Ayıplı üründen sorumluluk, ayıp sonradan ortaya çıksa bile teslim tarihinden itibaren iki yıllık zamanaşımı süresine (hakkın mahkemede istenebileceği yasal süre) tabidir.",
      ],
    },
    {
      baslik: "Şikâyet ve uyuşmazlık",
      bloklar: [
        "Şikâyetlerinizi önce satıcının yukarıdaki iletişim bilgilerine iletebilirsiniz.",
        TUKETICI_UYUSMAZLIK,
      ],
    },
    {
      baslik: "Sözleşme örneği ve güncelleme",
      bloklar: [
        "Siparişinizi onayladıktan sonra bu form ve mesafeli satış sözleşmesi, sipariş özetiyle birlikte, en geç ürün teslim edilmeden önce e-posta adresinize gönderilir.",
        "Siparişinize, siparişi onayladığınız anda yürürlükte olan metin uygulanır.",
        "Son güncelleme: {{GUNCELLEME_TARIHI}}.",
      ],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli: Siparişe özgü bilgiler (ürün, adet, birim fiyat, toplam, kargo, ödeme, teslimat ve fatura) form metnine yazılmıyor, ödeme sayfasındaki sipariş özetine atıfla veriliyor. Mesafeli Sözleşmeler Yönetmeliği m.5 (ön bilgilendirme) için bu yöntem yeterli mi, yoksa siparişe özgü değerlerin form metnine basılıp sipariş sonrası e-postayla gönderilmesi mi gerekir?",
    "Hukukçu teyit etmeli: Yönetmeliğin 27.11.2014 tarihli ilk metninden sonraki değişiklikleri (varsa) ön bilgilendirme içeriğine, cayma ve iade sürelerine yansıtılmalı. Metindeki 10 günlük geri gönderme, 14 günlük para iadesi ve 30 günlük teslim süreleri bu açıdan kontrol edilmeli.",
    "Hukukçu teyit etmeli: Satıcı iade için taşıyıcı ({{KARGO_FIRMASI}}) belirttiği için, Yönetmelik uyarınca tüketiciden iade kargo masrafı istenemeyeceği anlaşılıyor. {{IADE_KARGO_KIMDE}} tüketiciler için “satıcı” olarak mı doldurulmalı; tüketici başka bir kargo firması kullanırsa ne olur?",
    "Hukukçu teyit etmeli: Sipariş onay düğmesinin metni. Düğmenin ödeme yükümlülüğü doğduğunu açıkça belirtmesi (örneğin “Siparişi onayla, ödeme yükümlülüğünü kabul ediyorum”) gerekiyor mu?",
    "Hukukçu teyit etmeli: Yönlendirme hizmeti sona erdiğinde ürünün işlevini yitirmesi “temel nitelik” olarak yazıldı. {{YONLENDIRME_HIZMET_SURESI}} doldurulurken hizmetin ücretli olup olmadığı, süre sonunda yenileme ücreti olup olmayacağı ve bunun ne zaman bildirileceği de açıkça yazılmalı. (src/magaza/ayarlar.ts içindeki “bağlantıyı değiştirmek için ayrıca ücret ödemezsiniz” cümlesi de onay bekliyor; ikisi aynı olmalı.)",
    "Hukukçu teyit etmeli: Ürün Garanti Belgesi Yönetmeliği ekindeki listeye giriyor mu? Metinde garanti vaadi yok, yalnız ayıplı mal hükümleri var.",
    "Hukukçu teyit etmeli: Satıcı şahıs işletmesiyse MERSİS numarası olmayabilir; bu durumda tablodaki satır kaldırılmalı ya da sicil bilgisi yazılmalı. Elektronik Ticaret Bilgi Sistemi (ETBİS) kaydı ve sitede gösterilmesi de kontrol edilmeli.",
    "Hukukçu teyit etmeli: Ödeme süresinde ödeme gelmezse siparişin iptal edileceği yazıldı. Kısmi ödeme ya da süre geçtikten sonra gelen ödeme için ne yapılacağı (iade süresi ve yöntemi) eklenmeli mi?",
    "İşletme teyit etmeli: Form ve sözleşme örneğinin teslimden önce e-postayla gönderildiği yazıldı (Yönetmelik bunu ister). Sitenin sipariş sonrası bu e-postayı gerçekten gönderdiği doğrulanmalı. Banka bilgisi henüz tanımlı değilken onay sayfası IBAN göstermiyor; yayından önce IBAN tanımlanmalı.",
  ],
};

// ---------------------------------------------------------------------------
// 2. Mesafeli satış sözleşmesi
// ---------------------------------------------------------------------------

const MESAFELI_SATIS: YasalBelge = {
  slug: "mesafeli-satis",
  baslik: "Mesafeli satış sözleşmesi",
  kisaBaslik: "Mesafeli satış",
  ozet: "Bu sözleşme, sitede verdiğiniz siparişle satıcı ile sizin aranızda kurulur. Ürün, bedel, ödeme, teslimat, cayma ve iade konusundaki karşılıklı hak ve yükümlülükleri düzenler.",
  bolumler: [
    {
      baslik: "1. Taraflar",
      bloklar: [
        "Satıcı:",
        SATICI_BILGILERI,
        "Alıcı: Ödeme sayfasında adını, iletişim, teslimat ve fatura bilgilerini girerek sipariş veren kişidir. Alıcının bilgileri sipariş özetinde yer alır. Bu sözleşmede alıcıya “siz” diye hitap edilir.",
      ],
    },
    {
      baslik: "2. Tanımlar",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Sipariş özeti: Ürün, adet, birim fiyat, KDV dahil toplam bedel, kargo ücreti, ödeme yöntemi, teslimat ve fatura bilgilerinin gösterildiği, ödeme sayfasında ve sipariş onay sayfasında yer alan özet. Sipariş özeti bu sözleşmenin ayrılmaz parçasıdır.",
            "Tüketici: Ticari ya da mesleki olmayan amaçlarla hareket eden gerçek ya da tüzel kişi.",
            "Tacir: Ticari işletmeyi kendi adına işleten kişi ya da şirket.",
            "Kart: Siparişe konu, NFC çipli ve QR kodlu pleksi stand.",
            "Kart kodu: Her karta ait, karttaki QR kodun ve NFC çipinin gittiği yönlendirme adresini belirleyen kod.",
            "Kurulum paneli: Kartın bağlantısını belirlediğiniz ve değiştirdiğiniz, https://ahmcloud.com/kart adresindeki panel.",
            "Yönlendirme hizmeti: Kartı okutan kişiyi, kurulum panelinde belirlediğiniz bağlantıya yönlendiren hizmet.",
            "Kalıcı veri saklayıcısı: E-posta gibi, bilgiyi değiştirmeden saklamanıza ve yeniden açmanıza imkân veren araç.",
          ],
        },
      ],
    },
    {
      baslik: "3. Sözleşmenin konusu ve dayanağı",
      bloklar: [
        "Bu sözleşmenin konusu, nitelikleri ve satış bedeli sipariş özetinde yazan kartın size satılması ve teslim edilmesi ile kartla birlikte verilen yönlendirme hizmetidir.",
        "Sözleşmeye 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği (Resmî Gazete, 27.11.2014) ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uygulanır.",
        "Alıcı tacir ise tüketici mevzuatı yerine 6098 sayılı Türk Borçlar Kanunu ve 6102 sayılı Türk Ticaret Kanunu hükümleri uygulanır. Bu durumda satıcının bu sözleşmede ticari politika olarak tanıdığı haklar saklıdır (geçerliliğini korur).",
      ],
    },
    {
      baslik: "4. Ürün",
      bloklar: [URUN_NITELIKLERI],
    },
    {
      baslik: "5. Bedel, ödeme ve fatura",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Satış bedeli, sipariş özetinde KDV (katma değer vergisi) dahil olarak yazan toplam bedeldir. Kargo ücreti varsa sipariş özetinde ayrıca gösterilir. Sipariş özetinde gösterilmeyen bir ücret sizden istenmez.",
            "Ödemeyi, ödeme sayfasında sunulan yöntemlerden biriyle yaparsınız.",
            "Kartla ödemede ödeme, lisanslı ödeme kuruluşu iyzico'nun güvenli ödeme sayfasında alınır; kart bilgileriniz satıcıya iletilmez. Cayma ya da iade durumunda bedel, ödemenin yapıldığı karta iade edilir.",
            "Havale ya da EFT ile ödemede satıcının banka hesap bilgileri (IBAN) sipariş onay sayfasında gösterilir. Ödeme açıklamasına sipariş numaranızı yazmanız gerekir.",
            "Satıcı, sipariş özetindeki fatura bilgilerine göre fatura düzenler. Bireysel faturada ad soyad ve adres kullanılır; T.C. kimlik numarası istenmez. Kurumsal faturada firma unvanı, vergi dairesi ve vergi numarası kullanılır.",
            "Fatura bilgilerinin doğru ve eksiksiz girilmesi sizin sorumluluğunuzdadır.",
          ],
        },
      ],
    },
    {
      baslik: "6. Sözleşmenin kurulması",
      bloklar: [
        "Sözleşme, ödeme sayfasında ön bilgilendirme formunu ve bu sözleşmeyi onay kutusuyla kabul edip siparişi onayladığınız anda kurulur. Siparişi onayladığınızda ödeme yükümlülüğü altına girersiniz.",
        "Havale ya da EFT ile ödemede ödemeniz {{ODEME_SURESI_GUN}} gün içinde satıcının hesabına ulaşmazsa sipariş iptal edilir ve sözleşme kendiliğinden sona erer. Bu durumda taraflar birbirinden bir şey isteyemez.",
        "Satıcı, siparişinizin alındığını gecikmeden sipariş onay sayfasında ve e-postayla bildirir. Bu sözleşmenin ve ön bilgilendirme formunun bir örneği, en geç ürün teslim edilmeden önce e-posta adresinize gönderilir. Sözleşme metni satıcı tarafından sipariş kaydıyla birlikte saklanır.",
      ],
    },
    {
      baslik: "7. Teslimat",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Teslimat yalnız Türkiye içindeki adreslere, {{KARGO_FIRMASI}} ile yapılır.",
            "Ürün, ödemenizin onaylanmasından sonra {{KARGOYA_VERILIS_IS_GUNU}} iş günü içinde kargoya verilir.",
            "Teslim süresi, siparişinizin satıcıya ulaştığı tarihten itibaren hiçbir durumda 30 günü geçemez. Ürün bu süre içinde teslim edilmezse sözleşmeyi feshedebilirsiniz (tek taraflı olarak sona erdirebilirsiniz).",
            "Ürün sipariş özetindeki teslimat adresine, size ya da belirttiğiniz kişiye teslim edilir. Ürün teslim edilene kadar oluşan kayıp ve hasardan satıcı sorumludur.",
            "Satıcı, siparişin yerine getirilmesinin imkânsız hâle geldiğini öğrenirse bunu öğrendiği tarihten itibaren 3 gün içinde size yazılı olarak ya da kalıcı veri saklayıcısıyla bildirir ve varsa kargo ücreti dahil ödediğiniz bütün tutarı bildirim tarihinden itibaren en geç 14 gün içinde iade eder.",
          ],
        },
        "Ayrıntılar Kargo ve teslimat sayfasındadır.",
      ],
    },
    {
      baslik: "8. Yönlendirme hizmeti",
      bloklar: [
        "Yönlendirme hizmeti kartla birlikte verilir. Hizmetin süresi ve kapsamı: {{YONLENDIRME_HIZMET_SURESI}}.",
        "Kartı kurulum panelinden kendi bağlantınıza bağlarsınız ve bağlantıyı istediğiniz zaman değiştirebilirsiniz. Kartın bağlandığı bağlantının ve açılan sayfanın içeriğinden siz sorumlusunuz. Kart hukuka aykırı bir bağlantıya yönlendirilemez.",
        "Yönlendirme hizmetinin kullanımına, kesinti ve bakım durumlarına ve kötüye kullanımda kartın askıya alınmasına (yönlendirmenin geçici olarak durdurulmasına) ilişkin ayrıntılar Kullanım koşulları sayfasındadır. Kullanım koşulları bu sözleşmenin parçasıdır; çelişki olursa bu sözleşme ve tüketici mevzuatı uygulanır.",
      ],
    },
    {
      baslik: "9. Cayma hakkı",
      bloklar: [
        "Cayma hakkı, gerekçe göstermeden ve cezai şart (sözleşmeden dönen tarafın ödediği ceza bedeli) ödemeden sözleşmeden dönme hakkıdır.",
        {
          tur: "liste",
          maddeler: [
            "Ürünü sizin ya da belirttiğiniz kişinin teslim aldığı günden itibaren 14 gün içinde cayma hakkınızı kullanabilirsiniz. Tek siparişteki ürünler ayrı ayrı teslim edilirse süre, son ürünün teslim alındığı gün başlar. Ürün teslim edilmeden önce de cayabilirsiniz.",
            "Ürün kişiye özel üretilmediği için cayma hakkının istisnaları bu sözleşmeye uygulanmaz. Kartı kurup kendi bağlantınıza bağlamış olmanız cayma hakkınızı ortadan kaldırmaz.",
            "Cayma bildiriminizi süre bitmeden yazılı olarak ya da kalıcı veri saklayıcısıyla, aşağıdaki adreslerden birine gönderirsiniz. Bildirimin süre içinde gönderilmesi yeterlidir.",
          ],
        },
        CAYMA_BILDIRIM_KANALLARI,
        {
          tur: "liste",
          maddeler: [
            "Bildiriminizden itibaren 10 gün içinde ürünü {{KARGO_FIRMASI}} ile {{IADE_ADRESI}} adresine geri gönderirsiniz. İade kargo ücreti: {{IADE_KARGO_KIMDE}}.",
            "Satıcı, cayma bildiriminizin kendisine ulaştığı tarihten itibaren 14 gün içinde, varsa kargo ücreti dahil ödediğiniz bütün tutarı, ödeme yönteminize uygun biçimde, tek seferde ve sizden masraf kesmeden iade eder. Havale ya da EFT ile yapılan ödemeler, bildirdiğiniz IBAN'a iade edilir.",
            "Ürünü işleyişine, teknik özelliklerine ve kullanım amacına uygun biçimde kurmanız ve denemeniz nedeniyle oluşan değişiklik ve bozulmalardan sorumlu değilsiniz.",
            "Cayma hakkını kullandığınızda yönlendirme hizmeti de sona erer ve iade edilen kartın bağlantısı sıfırlanır.",
          ],
        },
        "Adım adım anlatım ve örnek cayma bildirimi İade ve cayma hakkı sayfasındadır.",
      ],
    },
    {
      baslik: "10. Ayıplı ürün",
      bloklar: [
        "Ayıplı ürün, sözleşmeye uygun olmayan, kusurlu ya da hasarlı üründür. Ürün ayıplı çıkarsa 6502 sayılı Kanun uyarınca sözleşmeden dönme, ayıp oranında bedelden indirim, ücretsiz onarım ya da ürünün ayıpsız bir benzeriyle değiştirilmesi haklarından birini seçebilirsiniz.",
        "Ayıplı ürünün gönderim masrafını satıcı karşılar. Satıcı talebinizi kanunda belirtilen süreler içinde yerine getirir.",
        "Ayıplı üründen sorumluluk, ayıp sonradan ortaya çıksa bile teslim tarihinden itibaren iki yıllık zamanaşımı süresine (hakkın mahkemede istenebileceği yasal süre) tabidir.",
      ],
    },
    {
      baslik: "11. Kurumsal alıcılar",
      bloklar: [
        "Kartı ticari ya da mesleki amaçla satın alan tacirler tüketici sayılmaz; cayma hakkı bu alıcılar için tüketici mevzuatından doğmaz.",
        "Satıcı, ticari politika olarak kurumsal alıcılara da teslimden itibaren 14 gün içinde iade imkânı tanır. Bu politikanın ayrıntıları: {{KURUMSAL_IADE_POLITIKASI}}.",
        "Kurumsal alıcılar, ayıpları Türk Ticaret Kanunu'nda tacirler için öngörülen inceleme ve bildirim süreleri içinde satıcıya bildirir.",
      ],
    },
    {
      baslik: "12. Kişisel veriler",
      bloklar: [
        "Siparişiniz için verdiğiniz kişisel veriler, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca ve KVKK aydınlatma metninde anlatıldığı şekilde işlenir.",
      ],
    },
    {
      baslik: "13. Mücbir sebep",
      bloklar: [
        "Mücbir sebep, tarafların kontrolü dışında gelişen ve önlenemeyen olaydır (örneğin doğal afet, salgın, savaş, genel grev, kargo ya da iletişim altyapısında yaygın kesinti). Mücbir sebep nedeniyle yükümlülüğün zamanında yerine getirilememesinden taraflar sorumlu tutulmaz.",
        "Satıcı böyle bir durumu size gecikmeden bildirir. Mücbir sebep, teslimatın 30 günlük yasal süreyi aşmasına yol açarsa siparişi iptal edebilir ve ödediğiniz bütün tutarı geri alabilirsiniz.",
      ],
    },
    {
      baslik: "14. Uyuşmazlıkların çözümü",
      bloklar: [
        "Bu sözleşmeye Türk hukuku uygulanır.",
        TUKETICI_UYUSMAZLIK,
        "Alıcı tacir ise uyuşmazlıklarda genel yetki kuralları uygulanır.",
      ],
    },
    {
      baslik: "15. Bildirimler ve deliller",
      bloklar: [
        "Taraflar birbirine bu sözleşmedeki ve sipariş özetindeki iletişim bilgileri üzerinden bildirim yapar. İletişim bilgileriniz değişirse satıcıya bildirmeniz gerekir.",
        "Uyuşmazlıkta taraflar kanunda öngörülen her türlü delile başvurabilir. Satıcının sipariş, onay ve yazışma kayıtları da bu deliller arasındadır.",
      ],
    },
    {
      baslik: "16. Yürürlük",
      bloklar: [
        "Bu sözleşme, ödeme sayfasında elektronik ortamda onaylandığı anda yürürlüğe girer. Sözleşmenin dili Türkçedir.",
        "Siparişinize, siparişi onayladığınız anda yürürlükte olan metin uygulanır.",
        "Son güncelleme: {{GUNCELLEME_TARIHI}}.",
      ],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli (önemli): Ürün işletmelerde kullanılmak üzere satılıyor. 6502 sayılı Kanun m.3'teki tüketici tanımı ticari ya da mesleki olmayan amaçla hareket edeni kapsar; bireysel fatura isteyen esnafın tüketici sayılıp sayılmayacağı tartışmalı. Metin, alıcı tüketici sayılmasa bile aynı hakları ticari politika olarak tanıyacak şekilde kuruldu. Bu yaklaşım ve “tacir” ayrımının faturadaki seçime (bireysel/kurumsal) bağlanıp bağlanmayacağı değerlendirilmeli.",
    "Hukukçu teyit etmeli: Sözleşmenin sipariş onayıyla kurulduğu ve ödeme süresinde ödeme gelmezse kendiliğinden sona erdiği (bozucu şart) yazıldı. Havaleli satışta bu kurgu uygun mu?",
    "Hukukçu teyit etmeli: İfanın imkânsızlaşmasında 3 gün içinde bildirim ve 14 gün içinde iade; 30 gün içinde teslim edilmezse tüketicinin feshedebileceği yazıldı. Yönetmelikteki güncel hükümle karşılaştırılmalı.",
    "Hukukçu teyit etmeli: Tüketici mahkemesinde dava öncesi arabuluculuğun dava şartı olduğu (6502 m.73/A) genel cümleyle yazıldı; kapsamı ve istisnaları kontrol edilmeli. Hakem heyeti tutarları bilerek yazılmadı.",
    "Hukukçu teyit etmeli: Mücbir sebep, deliller ve sorumluluk cümleleri 6502 m.5 (haksız şart) açısından incelenmeli. Delil maddesi tüketicinin ispat imkânını kısıtlamayacak şekilde genel tutuldu.",
    "Hukukçu teyit etmeli: Kurumsal (tacir) alıcılar için yetkili mahkeme şartı eklenmek istenirse şehir için yer tutucu listede yok; şimdilik “genel yetki kuralları” yazıldı.",
    "Hukukçu teyit etmeli: Kurumsal alıcılar için ayıp ihbarı TTK m.23'teki sürelere (açık ayıpta 2 gün, açık olmayan ayıpta 8 gün içinde inceleme ve ihbar) atıfla genel yazıldı; süreler metne açıkça yazılmalı mı?",
    "Hukukçu teyit etmeli: Ayıplı malda satıcının talebi yerine getirme süresi (6502 m.11) metne sayı olarak yazılmadı, “kanunda belirtilen süreler” denildi.",
    "Muhasebe teyit etmeli: Bireysel faturada T.C. kimlik numarası istenmiyor. e-Arşiv faturada kimlik numarası alanının nasıl doldurulacağı ve bunun tutar sınırları muhasebeciyle doğrulanmalı. Faturanın alıcıya nasıl iletileceği (e-posta ya da paket içi) belirlenip 5. maddeye eklenebilir.",
    "Hukukçu teyit etmeli: Kullanım koşullarının sözleşmenin parçası sayılması ve çelişkide bu sözleşmenin öncelikli olması kurgusu uygun mu?",
  ],
};

// ---------------------------------------------------------------------------
// 3. İade ve cayma hakkı
// ---------------------------------------------------------------------------

const IADE_VE_CAYMA: YasalBelge = {
  slug: "iade-ve-cayma",
  baslik: "İade ve cayma hakkı",
  kisaBaslik: "İade ve cayma",
  ozet: "Ürünü teslim aldığınız günden itibaren 14 gün içinde gerekçe göstermeden iade edebilirsiniz. Bu sayfada iadenin adımlarını ve kullanabileceğiniz örnek cayma bildirimini bulursunuz.",
  bolumler: [
    {
      baslik: "Kısaca",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Süre: Ürünü teslim aldığınız günden itibaren 14 gün.",
            "Gerekçe: Gerekmez.",
            "Bildirim: E-posta, KEP ya da posta ile, yazılı olarak.",
            "Ürünün geri gönderilmesi: Bildiriminizden itibaren en geç 10 gün içinde, {{KARGO_FIRMASI}} ile.",
            "İade kargo ücreti: {{IADE_KARGO_KIMDE}}.",
            "Para iadesi: Bildiriminiz bize ulaştıktan sonra en geç 14 gün içinde.",
          ],
        },
      ],
    },
    {
      baslik: "Cayma hakkı nedir",
      bloklar: [
        "Cayma hakkı, internetten aldığınız ürünü gerekçe göstermeden ve cezai şart (sözleşmeden dönen tarafın ödediği ceza bedeli) ödemeden geri vererek sözleşmeden dönme hakkıdır. Bu hak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nden doğar.",
        "Ürünlerimiz kişiye özel üretilmez. Bu nedenle kişiye özel ürünler için öngörülen cayma hakkı istisnası uygulanmaz. Kartı kurmuş ve kendi bağlantınıza bağlamış olsanız da cayma hakkınız devam eder.",
        "Süre, ürünü sizin ya da belirttiğiniz kişinin teslim aldığı gün başlar. Tek siparişteki ürünler ayrı ayrı teslim edilirse süre, son ürünün teslim alındığı gün başlar. Ürün size ulaşmadan önce de cayma hakkınızı kullanabilirsiniz.",
        "Bildiriminizi 14 günlük süre bitmeden göndermeniz yeterlidir.",
      ],
    },
    {
      baslik: "Adım adım iade",
      bloklar: [
        {
          tur: "sirali",
          maddeler: [
            "Cayma bildiriminizi hazırlayın. Aşağıdaki örnek metni kullanabilir ya da kendi cümlelerinizle yazabilirsiniz. Sipariş numaranızı ve para iadesi için IBAN'ınızı eklemeniz işlemi hızlandırır.",
            "Bildirimi 14 gün içinde şu yollardan biriyle gönderin: e-postayla {{SATICI_EPOSTA}} adresine, KEP (kayıtlı elektronik posta) ile {{SATICI_KEP}} adresine ya da postayla {{SATICI_UNVAN}}, {{SATICI_ADRES}} adresine. E-postayı siparişte kullandığınız adresten göndermeniz, siparişinizi bulmamızı kolaylaştırır.",
            "Bildiriminizin bize ulaştığını size e-postayla bildirir, ürünü nasıl göndereceğinizi yazarız.",
            "Ürünü bildiriminizden itibaren en geç 10 gün içinde {{KARGO_FIRMASI}} ile şu adrese gönderin: {{IADE_ADRESI}}. Paketin üzerine ya da içine sipariş numaranızı yazın. İade kargo ücreti: {{IADE_KARGO_KIMDE}}.",
            "Kartı kendi bağlantınıza bağladıysanız, iade edilen kartın bağlantısı sıfırlanır. Bundan sonra kartı okutan kişiler sizin sayfanıza gitmez; kartı masanızdan ya da kasanızdan kaldırmayı unutmayın.",
            "Bildiriminiz bize ulaştıktan sonra en geç 14 gün içinde, varsa kargo ücreti dahil ödediğiniz bütün tutarı iade ederiz. Havale ya da EFT ile ödediyseniz tutar, bildirdiğiniz IBAN'a gönderilir. İade tek seferde yapılır ve sizden masraf kesilmez.",
          ],
        },
      ],
    },
    {
      baslik: "Ürünün durumu ve ambalaj",
      bloklar: [
        "Ürünü işleyişine, teknik özelliklerine ve kullanım amacına uygun biçimde kurmanız ve denemeniz nedeniyle oluşan değişiklik ve bozulmalardan sorumlu değilsiniz.",
        "Ürünü mümkünse kutusuyla ve kargoda zarar görmeyecek şekilde paketleyin. Kutunun açılmış olması cayma hakkınızı ortadan kaldırmaz.",
        "Kargo fişini, ürün bize ulaşana kadar saklamanızı öneririz.",
      ],
    },
    {
      baslik: "Örnek cayma bildirimi",
      bloklar: [
        "Aşağıdaki metni kopyalayıp noktalı yerleri doldurarak kullanabilirsiniz. Bu örneği kullanmak zorunlu değildir; cayma kararınızı açıkça belirten her yazılı bildirim geçerlidir.",
        "Kime: {{SATICI_UNVAN}}, {{SATICI_ADRES}}, {{SATICI_EPOSTA}}",
        "Konu: Cayma bildirimi",
        "Aşağıda bilgileri yazan siparişime ilişkin mesafeli satış sözleşmesinden cayıyorum. Ürünü (ürünleri) geri göndereceğim.",
        {
          tur: "liste",
          maddeler: [
            "Sipariş numarası: ..........",
            "Sipariş tarihi: ..........",
            "Ürünü teslim aldığım tarih: ..........",
            "Ürün ve adet: ..........",
            "Ad soyad: ..........",
            "Adres: ..........",
            "Telefon ve e-posta: ..........",
            "Para iadesi için IBAN ve hesap sahibinin adı: ..........",
            "Bildirim tarihi: ..........",
            "İmza (yalnız kâğıtla gönderiyorsanız): ..........",
          ],
        },
      ],
    },
    {
      baslik: "Ayıplı, hasarlı ya da yanlış ürün",
      bloklar: [
        "Ürün kusurlu, kargoda hasar görmüş ya da siparişinizden farklı çıkarsa bu durum cayma hakkından ayrıdır ve 14 günlük süreyle sınırlı değildir. Durumu fotoğrafla birlikte {{SATICI_EPOSTA}} adresine ya da {{SATICI_TELEFON}} numarasına bildirin.",
        "Ayıplı ürün (sözleşmeye uygun olmayan, kusurlu ya da hasarlı ürün) için 6502 sayılı Kanun uyarınca sözleşmeden dönme, bedelden indirim, ücretsiz onarım ya da ayıpsız bir benzeriyle değiştirme haklarından birini seçebilirsiniz. Ayıplı ürünün gönderim masrafını satıcı karşılar.",
        "Teslim sırasında paketin hasarlı olduğunu fark ederseniz kargo görevlisine hasar tespit tutanağı (hasarı kayda geçiren belge) tutturmanızı öneririz. Tutanak tutturmamış olmanız yasal haklarınızı ortadan kaldırmaz.",
      ],
    },
    {
      baslik: "Kurumsal alıcılar",
      bloklar: [
        "Ürünü bir işletme adına, ticari ya da mesleki amaçla alan tacirler (ticari işletmeyi işleten kişi ya da şirket) tüketici sayılmaz. Cayma hakkı bu alıcılar için tüketici mevzuatından doğmaz.",
        "Satıcı yine de ticari politika olarak kurumsal alıcılara da teslimden itibaren 14 gün içinde iade imkânı tanır. Bu politikanın ayrıntıları: {{KURUMSAL_IADE_POLITIKASI}}. Kurumsal alıcılar iade için bu sayfadaki adımları izleyebilir.",
      ],
    },
    {
      baslik: "İletişim ve güncelleme",
      bloklar: [
        "İade ile ilgili sorularınız için: {{SATICI_EPOSTA}}, {{SATICI_TELEFON}}.",
        "Son güncelleme: {{GUNCELLEME_TARIHI}}.",
      ],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli: Tüketicinin cayma bildiriminden itibaren 10 gün içinde ürünü geri göndermesi yükümlülüğü Yönetmelikteki güncel hükümle karşılaştırılmalı.",
    "Hukukçu teyit etmeli: Mesafeli Sözleşmeler Yönetmeliği'nde zorunlu bir cayma formu örneği bulunup bulunmadığı kontrol edilmeli; varsa örnek metin ona uydurulmalı.",
    "Hukukçu teyit etmeli: Olağan kullanım dışında hasar görmüş ürün için bedelden kesinti yapılıp yapılmayacağı. Metinde kesinti öngörülmedi; yalnız olağan kullanımdan doğan bozulmadan tüketicinin sorumlu olmadığı yazıldı.",
    "Hukukçu teyit etmeli: İkili set tek ürün olarak mı satılıyor? Setin yalnız bir standının iade edilmesi (kısmi cayma) mümkün olacaksa bedelin nasıl hesaplanacağı yazılmalı.",
    "Hukukçu teyit etmeli: İade kargo ücreti için ön bilgilendirme formundaki nota bakın (taşıyıcı belirtildiğinde tüketiciden iade masrafı istenememesi).",
    "İşletme teyit etmeli: “Bildiriminizin ulaştığını e-postayla bildirir, ürünü nasıl göndereceğinizi yazarız” (örneğin anlaşmalı iade kodu) bir operasyon taahhüdüdür; uygulamada karşılığı olmalı.",
    "İşletme teyit etmeli: İade edilen kartın bağlantısının ne zaman sıfırlanacağı (bildirim anında mı, kart ulaştığında mı) belirlenmeli; metinde zaman verilmedi.",
    "Hukukçu teyit etmeli: Para iadesi için IBAN isteniyor; bu bilgi KVKK aydınlatma metnine eklendi.",
  ],
};

// ---------------------------------------------------------------------------
// 4. Kargo ve teslimat
// ---------------------------------------------------------------------------

const KARGO_VE_TESLIMAT: YasalBelge = {
  slug: "kargo-ve-teslimat",
  baslik: "Kargo ve teslimat",
  kisaBaslik: "Kargo ve teslimat",
  ozet: "Siparişiniz Türkiye içindeki adreslere {{KARGO_FIRMASI}} ile gönderilir. Bu sayfada kargoya veriliş süresini, kargo ücretini ve teslim alırken dikkat etmeniz gerekenleri bulursunuz.",
  bolumler: [
    {
      baslik: "Teslimat bölgesi",
      bloklar: [
        "Yalnız Türkiye içindeki adreslere gönderim yapıyoruz. Yurt dışına gönderim yoktur.",
      ],
    },
    {
      baslik: "Kargoya veriliş ve teslim süresi",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Siparişiniz, ödemeniz onaylandıktan sonra {{KARGOYA_VERILIS_IS_GUNU}} iş günü içinde {{KARGO_FIRMASI}} ile kargoya verilir. İş günü, hafta sonu ve resmî tatiller dışındaki günlerdir.",
            "Havale ya da EFT ile ödemede bu süre, ödemenizin hesabımıza ulaşıp siparişinizle eşleştirildiği günden itibaren işler.",
            "Kargoya verildikten sonraki teslim süresi, bulunduğunuz yere ve kargo firmasının dağıtım planına göre değişir.",
            "Yasal azami süre: Teslimat, siparişinizin bize ulaştığı tarihten itibaren hiçbir durumda 30 günü geçemez.",
          ],
        },
      ],
    },
    {
      baslik: "Kargo ücreti",
      bloklar: [
        "Kargo ücreti varsa sipariş özetinde ayrıca gösterilir ve toplam bedele eklenir. Sipariş özetinde gösterilmeyen bir kargo ücreti sizden istenmez; teslimatta kargo görevlisine ayrıca ödeme yapmazsınız.",
      ],
    },
    {
      baslik: "Kargo takibi",
      bloklar: [
        "Siparişiniz kargoya verildiğinde kargo takip bilgisi sipariş sayfanızda gösterilir. Takip bilgisiyle gönderinizin durumunu kargo firmasının sitesinden izleyebilirsiniz.",
      ],
    },
    {
      baslik: "Teslim alırken",
      bloklar: [
        "Paketi teslim alırken dışını kontrol edin. Ezik, yırtık ya da ıslak bir paket varsa kargo görevlisine hasar tespit tutanağı (hasarı kayda geçiren belge) tutturmanızı öneririz.",
        "Tutanak tutturmamış olmanız yasal haklarınızı ortadan kaldırmaz. Hasarı, eksik ya da yanlış ürünü fark ettiğinizde fotoğrafla birlikte {{SATICI_EPOSTA}} adresine bildirin.",
        "Ürün size ya da belirttiğiniz kişiye teslim edilene kadar oluşan kayıp ve hasardan satıcı sorumludur.",
      ],
    },
    {
      baslik: "Teslim edilemeyen gönderiler",
      bloklar: [
        "Adreste kimse bulunamazsa kargo firması kendi kurallarına göre gönderiyi şubede bekletir ya da yeniden teslim etmeye çalışır. Gönderi teslim alınmadan bize geri dönerse sizinle iletişime geçeriz.",
        "Teslimat adresinizi değiştirmek isterseniz ürün kargoya verilmeden önce {{SATICI_EPOSTA}} adresine ya da {{SATICI_TELEFON}} numarasına bildirin.",
      ],
    },
    {
      baslik: "Gecikme ve teslim edilememe",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Siparişinizi belirtilen sürede kargoya veremeyeceğimizi öğrenirsek size gecikmeden bildiririz.",
            "Ürünün teslimi imkânsız hâle gelirse bunu öğrendiğimiz tarihten itibaren 3 gün içinde size yazılı olarak ya da e-postayla bildirir, varsa kargo ücreti dahil ödediğiniz bütün tutarı en geç 14 gün içinde iade ederiz.",
            "Ürün 30 günlük yasal süre içinde teslim edilmezse sözleşmeyi feshedebilirsiniz (tek taraflı olarak sona erdirebilirsiniz).",
          ],
        },
      ],
    },
    {
      baslik: "Güncelleme",
      bloklar: ["Son güncelleme: {{GUNCELLEME_TARIHI}}."],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli: “İş günü” hafta sonu ve resmî tatiller hariç diye tanımlandı. Cumartesinin iş günü sayılıp sayılmayacağı netleştirilmeli.",
    "Hukukçu teyit etmeli: 30 günlük azami süre siparişin ulaştığı tarihten başlatıldı. Havale ile ödemede ödeme gecikirse sürenin başlangıcı (sipariş tarihi mi, ödeme tarihi mi) değerlendirilmeli; kargoya veriliş süresi ödeme onayından başlatıldı.",
    "Hukukçu teyit etmeli: Hasar tespit tutanağı yalnız öneri olarak yazıldı ve hakları kısıtlamadığı belirtildi.",
    "İşletme teyit etmeli: Kargo ücreti şu an ücretsiz; bu bilgi metne sabit yazılmadı, “sipariş özetinde gösterilir” denildi. Sipariş özetinde kargo satırı “Ücretsiz” olarak görünmeli.",
    "İşletme teyit etmeli: Kodda takip numarası sipariş kaydına yazılıyor; metin “sipariş sayfanızda gösterilir” diyor. Ayrıca e-posta ya da SMS ile bildirilecekse eklenmeli. Teslim edilemeyip geri dönen gönderinin yeniden gönderim ücretinin kimde olacağı belirlenmeli; metinde ücret konusu yazılmadı.",
  ],
};

// ---------------------------------------------------------------------------
// 5. KVKK aydınlatma metni
// ---------------------------------------------------------------------------

const KVKK: YasalBelge = {
  slug: "kvkk",
  baslik: "KVKK aydınlatma metni",
  kisaBaslik: "KVKK aydınlatma",
  ozet: "Sipariş verdiğinizde ve bizimle yazıştığınızda hangi kişisel verilerinizi, hangi amaçla ve hangi hukuki sebeple işlediğimizi, kimlere aktardığımızı ve haklarınızı bu metinde anlatıyoruz.",
  bolumler: [
    {
      baslik: "Veri sorumlusu",
      bloklar: [
        "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.",
        "Veri sorumlusu (kişisel verilerinizin hangi amaçla ve nasıl işleneceğine karar veren kişi): {{SATICI_UNVAN}}, {{SATICI_ADRES}}. İletişim: {{SATICI_EPOSTA}}, {{SATICI_TELEFON}}, KEP (kayıtlı elektronik posta): {{SATICI_KEP}}.",
        "Kişisel veri, kimliği belirli ya da belirlenebilir bir kişiye ait her türlü bilgidir. İşleme, bu verilerin elde edilmesi, kaydedilmesi, saklanması, kullanılması, aktarılması ve silinmesi gibi her türlü işlemdir.",
      ],
    },
    {
      baslik: "İşlediğimiz kişisel veriler",
      bloklar: [
        {
          tur: "tablo",
          basliklar: ["Veri grubu", "Veriler"],
          satirlar: [
            ["Kimlik ve iletişim", "Ad soyad, telefon numarası, e-posta adresi"],
            ["Teslimat", "İl, ilçe, açık adres, posta kodu"],
            [
              "Fatura",
              "Bireysel faturada ad soyad ve adres; kurumsal faturada firma unvanı, vergi dairesi, vergi numarası ve adres. T.C. kimlik numarası istenmez.",
            ],
            [
              "Sipariş",
              "Sipariş edilen ürün ve adet, sipariş notu, sipariş ve ödeme durumu, kargo takip bilgisi",
            ],
            [
              "Ödeme ve iade",
              "Kartla ödemede iyzico'nun bildirdiği ödeme numarası, taksit sayısı ve kartın son dört hanesi (kart numarasının tamamı ve güvenlik kodu satıcıya ulaşmaz); havale ya da EFT ile ödemede banka hesap hareketinde görünen gönderen adı ve IBAN; cayma ya da iade durumunda para iadesi için bildirdiğiniz IBAN ve hesap sahibinin adı",
            ],
            [
              "İşlem güvenliği",
              "Siparişi verdiğiniz andaki IP adresi ve işlem zamanı, ön bilgilendirme formu ve sözleşmeyi onayladığınız zaman",
            ],
            [
              "Kurulum paneli",
              "Panele giriş için kullandığınız hesap bilgisi (örneğin e-posta adresi), kart kodu ve karta bağladığınız bağlantı adresi",
            ],
            [
              "Yazışmalar",
              "E-posta, telefon ya da WhatsApp üzerinden bize ilettiğiniz talep, şikâyet ve cayma bildirimlerinin içeriği",
            ],
          ],
        },
        "Kartla ödeme sunulursa kart bilgileriniz ödeme kuruluşunun güvenli sayfasında işlenir; kart numaranızı biz görmeyiz ve saklamayız.",
        "Sipariş notuna ya da yazışmalara sağlık bilgisi gibi özel nitelikli kişisel veri (KVKK m.6'da sayılan, açığa çıkması ayrımcılığa yol açabilecek veriler) yazmamanızı rica ederiz. Bu tür verilere ihtiyacımız yoktur.",
      ],
    },
    {
      baslik: "Verileri nasıl topluyoruz",
      bloklar: [
        "Kişisel verilerinizi elektronik ortamda şu yollarla topluyoruz: ödeme sayfasındaki formu doldurduğunuzda, kurulum panelini kullandığınızda, bize e-posta, telefon ya da WhatsApp ile ulaştığınızda ve siteyi kullanırken sunucu kayıtları aracılığıyla otomatik olarak. Ödeme bilgisini banka hesap hareketlerimizden, gönderinin durumunu kargo firmasından alıyoruz.",
      ],
    },
    {
      baslik: "Amaçlar ve hukuki sebepler",
      bloklar: [
        "Kişisel verilerinizi aşağıdaki amaçlarla ve KVKK m.5/2'de sayılan hukuki sebeplere dayanarak işliyoruz. Hukuki sebep, kanunun veri işlemeye izin verdiği durumdur.",
        {
          tur: "tablo",
          basliklar: ["Amaç", "Hukuki sebep (KVKK m.5/2)"],
          satirlar: [
            [
              "Siparişinizi almak, sözleşmeyi kurmak ve ürünü hazırlamak",
              "Sözleşmenin kurulması ve ifasıyla (yerine getirilmesiyle) doğrudan ilgili olması (c bendi)",
            ],
            [
              "Ödemenizi siparişinizle eşleştirmek ve takip etmek",
              "Sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması (c bendi)",
            ],
            [
              "Ürünü kargoya vermek ve size teslim etmek",
              "Sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması (c bendi)",
            ],
            [
              "Fatura düzenlemek, muhasebe ve vergi kayıtlarını tutmak",
              "Kanunlarda açıkça öngörülmesi (a bendi) ve hukuki yükümlülüğümüzü yerine getirmek için zorunlu olması (ç bendi)",
            ],
            [
              "Ön bilgilendirme ve sözleşme onayınızı kayıt altına almak",
              "Hukuki yükümlülüğümüzü yerine getirmek için zorunlu olması (ç bendi); bir hakkın tesisi, kullanılması ya da korunması için zorunlu olması (e bendi)",
            ],
            [
              "Cayma, iade ve ayıplı ürün taleplerini yürütmek, para iadesi yapmak",
              "Sözleşmenin ifasıyla doğrudan ilgili olması (c bendi); hukuki yükümlülük (ç bendi)",
            ],
            [
              "Kurulum panelini ve yönlendirme hizmetini sunmak",
              "Sözleşmenin kurulması ve ifasıyla doğrudan ilgili olması (c bendi)",
            ],
            [
              "Talep ve şikâyetlerinize yanıt vermek",
              "Sözleşmenin ifasıyla doğrudan ilgili olması (c bendi); temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (haklı ve dengeli çıkarımız) için zorunlu olması (f bendi)",
            ],
            [
              "Site ve sistem güvenliğini sağlamak, dolandırıcılığı ve kötüye kullanımı önlemek",
              "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz için zorunlu olması (f bendi)",
            ],
            [
              "Uyuşmazlıklarda haklarımızı korumak",
              "Bir hakkın tesisi, kullanılması ya da korunması için zorunlu olması (e bendi)",
            ],
            [
              "Yetkili kamu kurumlarının kanuna dayalı taleplerini karşılamak",
              "Hukuki yükümlülüğümüzü yerine getirmek için zorunlu olması (ç bendi)",
            ],
          ],
        },
        "Size reklam ya da kampanya amaçlı ticari elektronik ileti (e-posta, SMS gibi) göndermiyoruz. İleride göndermek istersek önce ayrıca onayınızı alırız.",
        "Kişisel verilerinizi yalnız otomatik sistemlerle analiz ederek hakkınızda karar vermiyoruz.",
      ],
    },
    {
      baslik: "Kişisel verilerin aktarılması",
      bloklar: [
        "Kişisel verilerinizi yalnız aşağıdaki amaçlar için gereken ölçüde ve KVKK m.8 ile m.9'daki şartlara uygun olarak aktarıyoruz. Verilerinizi satmıyoruz ve reklam amacıyla kimseyle paylaşmıyoruz.",
        {
          tur: "tablo",
          basliklar: ["Kime", "Hangi veriler, hangi amaçla"],
          satirlar: [
            [
              "Kargo firması ({{KARGO_FIRMASI}})",
              "Ad soyad, telefon, teslimat adresi; ürünün size teslimi",
            ],
            [
              "Bankalar ve ödeme kuruluşları (kartla ödemede iyzico)",
              "Ödemenin alınması, dolandırıcılık denetimi ve para iadesi için gereken bilgiler: ad soyad, telefon, e-posta, teslimat ve fatura adresi, IP adresi, sipariş tutarı ve ürünler. Kart bilgileri doğrudan iyzico'ya girilir, satıcıya ulaşmaz.",
            ],
            [
              "Muhasebe ve e-fatura hizmeti sağlayıcıları",
              "Fatura bilgileri ve sipariş tutarı; fatura düzenlenmesi ve yasal kayıtların tutulması",
            ],
            [
              "Barındırma (sunucu) hizmeti sağlayıcısı ({{SUNUCU_KONUMU}})",
              "Sitede ve kurulum panelinde tutulan veriler; sitenin çalışması ve verilerin saklanması",
            ],
            [
              "Yetkili kamu kurum ve kuruluşları, yargı mercileri",
              "Kanunen istenen bilgiler; hukuki yükümlülüklerin yerine getirilmesi ve uyuşmazlıkların çözümü",
            ],
            [
              "WhatsApp hizmetini sunan Meta şirketleri",
              "Yalnız WhatsApp üzerinden yazışmayı seçerseniz: telefon numaranız ve yazışma içeriği",
            ],
          ],
        },
      ],
    },
    {
      baslik: "Yurt dışına aktarım ve WhatsApp",
      bloklar: [
        "WhatsApp, yurt dışında yerleşik Meta şirketlerinin sunduğu bir hizmettir. Bize WhatsApp üzerinden yazmanız tamamen isteğe bağlıdır; aynı talepleri e-posta ya da telefonla da iletebilirsiniz.",
        "WhatsApp'tan yazmayı seçerseniz telefon numaranız ve yazışmanın içeriği yurt dışındaki sunuculara aktarılabilir. Bu aktarım KVKK m.9'da sayılan şartlardan birine dayanılarak yapılır. Gereken durumlarda açık rızanız (belirli bir konuya ilişkin, bilgilendirilmeye dayanan ve özgür iradeyle verilen onay) WhatsApp yazışması başlamadan önce ayrıca alınır.",
        "Barındırma hizmeti sağlayıcısının sunucuları yurt dışındaysa bu aktarım da KVKK m.9'daki şartlara uygun olarak yapılır. Sunucu konumu: {{SUNUCU_KONUMU}}.",
      ],
    },
    {
      baslik: "Saklama süreleri",
      bloklar: [
        {
          tur: "tablo",
          basliklar: ["Kayıt", "Saklama süresi"],
          satirlar: [
            [
              "Sipariş, sözleşme, ön bilgilendirme onayı, fatura ve muhasebe kayıtları",
              "Türk Ticaret Kanunu ve Vergi Usul Kanunu'ndaki saklama süreleri boyunca; bu sürelerin en uzunu olan 10 yıl",
            ],
            [
              "Siparişe bağlı IP adresi ve işlem zamanı",
              "Sözleşmenin kanıtı olarak, sipariş kaydıyla aynı süre",
            ],
            [
              "Siparişle ilgili cayma, iade ve şikâyet yazışmaları",
              "İlgili sipariş kaydıyla aynı süre",
            ],
            [
              "Siparişe dönüşmeyen e-posta, telefon ve WhatsApp yazışmaları",
              "Talebiniz sonuçlanıp saklama amacı ortadan kalkınca",
            ],
            [
              "Kurulum paneli hesabı ve kart bağlantısı",
              "Yönlendirme hizmeti sürdüğü sürece; hizmet sona erince ya da kart iade edilince bağlantı sıfırlanır",
            ],
            [
              "Güvenlik amaçlı sunucu kayıtları",
              "Güvenlik amacı için gereken süre boyunca",
            ],
          ],
        },
        "Süre dolunca ya da işleme amacı ortadan kalkınca verileriniz silinir, yok edilir ya da anonim hâle getirilir (hiç kimseyle ilişkilendirilemeyecek hâle getirilir).",
      ],
    },
    {
      baslik: "Haklarınız",
      bloklar: [
        "KVKK m.11 uyarınca şu haklara sahipsiniz:",
        {
          tur: "liste",
          maddeler: [
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi isteme",
            "İşlenme amacını ve verilerin bu amaca uygun kullanılıp kullanılmadığını öğrenme",
            "Verilerin yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilme",
            "Eksik ya da yanlış işlenmişse düzeltilmesini isteme",
            "KVKK m.7'deki şartlar çerçevesinde silinmesini ya da yok edilmesini isteme",
            "Düzeltme, silme ya da yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
            "Verilerin yalnız otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz etme",
            "Kanuna aykırı işleme nedeniyle zarara uğrarsanız zararın giderilmesini isteme",
          ],
        },
      ],
    },
    {
      baslik: "Başvuru yolu",
      bloklar: [
        "Haklarınızı kullanmak için başvurunuzu Türkçe ve yazılı olarak şu yollardan biriyle iletebilirsiniz:",
        {
          tur: "liste",
          maddeler: [
            "Postayla ya da elden, ıslak imzalı dilekçeyle: {{SATICI_ADRES}}",
            "KEP, güvenli elektronik imza ya da mobil imza ile: {{SATICI_KEP}}",
            "Siparişte kullandığınız ve sistemimizde kayıtlı e-posta adresinizden: {{SATICI_EPOSTA}}",
          ],
        },
        "Başvurunuzda adınızı ve soyadınızı, Türk vatandaşıysanız T.C. kimlik numaranızı (yabancıysanız uyruğunuzu ve pasaport numaranızı), tebligat adresinizi, varsa e-posta adresinizi ve telefon numaranızı ve talebinizi açıkça yazın. Bu bilgiler, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ gereği istenir ve yalnız başvurunuzu yanıtlamak için kullanılır.",
        "Başvurunuzu en geç 30 gün içinde ücretsiz olarak yanıtlarız. İşlem ayrıca bir maliyet gerektirirse Kişisel Verileri Koruma Kurulunun belirlediği tarifedeki ücret istenebilir.",
        "Başvurunuz reddedilirse, yanıtı yetersiz bulursanız ya da süresinde yanıt verilmezse; yanıtı öğrendiğiniz tarihten itibaren 30 gün ve her durumda başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kuruluna şikâyette bulunabilirsiniz.",
      ],
    },
    {
      baslik: "Güncelleme",
      bloklar: [
        "Bu metni gerektiğinde güncelleriz. Güncel metin her zaman bu sayfadadır.",
        "Son güncelleme: {{GUNCELLEME_TARIHI}}.",
      ],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli (önemli): WhatsApp yazışmaları Meta üzerinden yurt dışına aktarılıyor. 7499 sayılı Kanunla değişen KVKK m.9 (1 Haziran 2024'ten beri) yeterlilik kararı, uygun güvence (standart sözleşme vb.) ya da arızi (ara sıra, süreklilik taşımayan) aktarım istisnalarını öngörüyor. Meta ile standart sözleşme imzalamak pratikte mümkün görünmüyor. Hangi dayanağa (arızi aktarımda açık rıza mı, sözleşmenin ifası için zorunluluk mu) dayanılacağı belirlenmeli. Yer tutucu listesinde bu konu için alan olmadığından metin genel yazıldı. Açık rıza alınacaksa aydınlatma metninden ayrı bir rıza metni ve WhatsApp bağlantısının yanında rıza adımı gerekir.",
    "Hukukçu teyit etmeli: {{SUNUCU_KONUMU}} yurt dışıysa m.9 kapsamında aktarım dayanağı (standart sözleşme ve imzadan sonra 5 iş günü içinde Kurula bildirim) gerekir. Yurt içiyse “yurt dışına aktarım” bölümündeki sunucu cümlesi kaldırılabilir.",
    "Hukukçu teyit etmeli: Kargo, banka, muhasebe ve barındırma sağlayıcılarının veri işleyen (veri sorumlusu adına veri işleyen) mi, ayrı veri sorumlusu mu olduğu belirlenmeli; veri işleyenlerle KVKK m.12'ye uygun sözleşme yapılmalı. Sipariş e-postaları için ayrı bir e-posta gönderim hizmeti kullanılıyorsa aktarım tablosuna eklenmeli.",
    "Hukukçu teyit etmeli: Kurulum paneli (ahmcloud.com/kart) ve yönlendirme sunucusu (ahmcloud.com/q) satıcıdan farklı bir kişi tarafından işletiliyorsa, o kişinin rolü (veri işleyen ya da ayrı veri sorumlusu) ve sözleşmesi belirlenmeli. Panelde gerçekte tutulan veriler (hesap bilgisi, şifre özeti, okutma sayısı vb.) teyit edilip tabloya yansıtılmalı.",
    "Hukukçu teyit etmeli: Yönlendirme sunucusu, kartı okutan üçüncü kişilerin (alıcının müşterilerinin) IP adresini ya da cihaz bilgisini kaydediyorsa bu kişiler için ayrı bir aydınlatma ve veri sorumlusunun kim olduğu belirlenmeli. Bu metin yalnız alıcıları kapsıyor.",
    "Hukukçu teyit etmeli: Saklama süreleri. TTK m.82 (10 yıl) ve VUK m.253 (5 yıl) birlikte düşünülerek “en uzunu 10 yıl” yazıldı. Ayrıca Mesafeli Sözleşmeler Yönetmeliği'ndeki satıcı kayıt saklama yükümlülüğü kontrol edilmeli. Güvenlik amaçlı sunucu kayıtları için somut bir süre (örneğin ay ya da yıl olarak) belirlenmeli; şu an “gereken süre” yazıyor.",
    "Hukukçu teyit etmeli: VERBİS kayıt yükümlülüğü ya da muafiyeti (çalışan sayısı ve yıllık mali bilanço eşikleri) kontrol edilmeli; kayıt gerekiyorsa kişisel veri saklama ve imha politikası hazırlanmalı.",
    "Hukukçu teyit etmeli: Aydınlatma metni ödeme sayfasında onay kutusuyla “kabul” ettirilmemeli; bağlantı olarak sunulmalı ve açık rıza metniyle birleştirilmemeli (Kurul uygulaması).",
    "Hukukçu teyit etmeli: Başvuru Tebliği T.C. kimlik numarasını başvuruda ister; sipariş sırasında istenmediği, yalnız başvuruda kimlik doğrulama için alındığı yazıldı.",
    "İşletme teyit etmeli: Kartla ödeme (iyzico, PayTR) eklendiğinde ödeme kuruluşunun adı aktarım tablosuna eklenmeli ve “kart numaranızı görmeyiz” cümlesi entegrasyon biçimine göre doğrulanmalı. İleride ticari elektronik ileti gönderilecekse İleti Yönetim Sistemi (İYS) kaydı ve ayrı onay gerekir.",
  ],
};

// ---------------------------------------------------------------------------
// 6. Gizlilik ve çerez politikası
// ---------------------------------------------------------------------------

const GIZLILIK_VE_CEREZ: YasalBelge = {
  slug: "gizlilik-ve-cerez",
  baslik: "Gizlilik ve çerez politikası",
  kisaBaslik: "Gizlilik ve çerezler",
  ozet: "Sitemizde yalnız sitenin çalışması için zorunlu olan çerez ve tarayıcı depolamasını kullanıyoruz. Analitik, reklam ya da üçüncü taraf izleme çerezi kullanmadığımız için çerez onay bandı göstermiyoruz.",
  bolumler: [
    {
      baslik: "Kısaca",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Sepetiniz tarayıcınızın yerel deposunda (localStorage) tutulur. Siparişi verene kadar sepet içeriği yalnız tarayıcınızda durur.",
            "Sipariş verdiğinizde, sipariş sayfanızı aynı tarayıcıda bir gün boyunca açabilmeniz için zorunlu bir çerez yazılır.",
            "Site yöneticilerinin yönetim paneline girişi için zorunlu bir oturum çerezi kullanılır.",
            "Analitik, reklam, sosyal medya ya da başka bir üçüncü taraf izleme çerezi kullanmıyoruz.",
            "Kişisel verilerinizi satmıyor, reklam amacıyla kimseyle paylaşmıyoruz.",
          ],
        },
      ],
    },
    {
      baslik: "Çerez ve yerel depolama nedir",
      bloklar: [
        "Çerez, bir sitenin tarayıcınıza kaydettiği küçük bir metin dosyasıdır. Yerel depolama (localStorage) da sitenin tarayıcınızda veri tutmasını sağlayan bir tarayıcı özelliğidir. İkisi de cihazınızda, tarayıcınızın içinde saklanır.",
        "Zorunlu çerezler, sitenin sizin istediğiniz bir hizmeti (örneğin sepet ya da güvenli giriş) sunabilmesi için gereken çerezlerdir. Bunlar için onayınız alınmaz; bu metinle bilgilendirilirsiniz.",
      ],
    },
    {
      baslik: "Kullandığımız çerez ve depolama",
      bloklar: [
        {
          tur: "tablo",
          basliklar: ["Ne", "Tür", "Amaç", "Ne kadar kalır"],
          satirlar: [
            [
              "Sepet (tarayıcının yerel deposu, localStorage)",
              "Zorunlu",
              "Sepete eklediğiniz ürünleri ve adetleri, sayfalar arasında gezerken ve siteye yeniden geldiğinizde hatırlamak",
              "Sepeti boşaltana ya da tarayıcı verilerini silene kadar",
            ],
            [
              "Sipariş erişim çerezi",
              "Zorunlu",
              "Siparişi verdiğiniz tarayıcıda sipariş sayfanızı (sipariş özeti ve ödeme bilgisi) bağlantıdaki erişim anahtarı olmadan da açabilmenizi sağlamak. Çerez yalnız sipariş numarasını ve bir doğrulama imzasını içerir.",
              "24 saat",
            ],
            [
              "Yönetici oturum çerezi",
              "Zorunlu",
              "Yalnız site yöneticilerinin yönetim paneline güvenli girişini sağlamak",
              "Oturum süresince",
            ],
          ],
        },
        "Yerel depoda yalnız sepetteki ürünler ve adetleri tutulur. Ad, adres ve telefon gibi bilgileriniz siparişi verdiğinizde sunucumuza gönderilir; yerel depoda saklanmaz.",
      ],
    },
    {
      baslik: "Çerez onay bandı neden yok",
      bloklar: [
        "KVKK uygulamasında, sitenin çalışması için zorunlu olan çerezler için açık rıza (belirli bir konuya ilişkin, bilgilendirilmeye dayanan ve özgür iradeyle verilen onay) alınması gerekmez. Sitemizde yalnız bu tür çerez ve depolama bulunduğu için çerez onay bandı göstermiyoruz.",
        "İleride analitik, reklam ya da benzeri zorunlu olmayan bir çerez ya da izleme aracı kullanmak istersek, bu metni önceden güncelleriz ve o aracı yalnız açık onayınızı aldıktan sonra çalıştırırız. Onay vermemeniz siteyi kullanmanızı engellemez.",
      ],
    },
    {
      baslik: "Çerezleri nasıl silersiniz",
      bloklar: [
        "Tarayıcınızın ayarlarından çerezleri ve site verilerini silebilir ya da engelleyebilirsiniz. Yerel depoyu silerseniz sepetiniz boşalır. Zorunlu çerezleri engellerseniz sitenin bazı bölümleri çalışmayabilir.",
      ],
    },
    {
      baslik: "Sunucu kayıtları",
      bloklar: [
        "Sipariş verdiğinizde IP adresiniz ve işlem zamanı, sözleşmenin kanıtı ve işlem güvenliği için siparişinizle birlikte kaydedilir.",
        "Sunucumuz, siteyi saldırılara karşı korumak ve hataları bulmak için isteklerin IP adresi ve zamanı gibi teknik kayıtlarını tutabilir. Bu kayıtları sizi izlemek ya da profil çıkarmak (alışkanlıklarınızı analiz etmek) için kullanmayız.",
      ],
    },
    {
      baslik: "Kartın okutulması ve yönlendirme",
      bloklar: [
        "Kartınızı okutan kişinin telefonu önce yönlendirme adresine (https://ahmcloud.com/q/KOD) gider, oradan sizin kurulum panelinde belirlediğiniz bağlantıya yönlendirilir.",
        "Bu sırada yönlendirme sunucusu, hizmetin çalışması ve güvenliği için gereken teknik bilgileri (IP adresi ve istek zamanı gibi) işleyebilir. Bu bilgiler reklam ya da profil çıkarma amacıyla kullanılmaz.",
        "Yönlendirmeden sonra açılan sayfa (örneğin Google ya da Instagram) kendi gizlilik ve çerez politikasına tabidir.",
      ],
    },
    {
      baslik: "Başka siteler",
      bloklar: [
        "Sitemizdeki Google, Instagram ya da WhatsApp bağlantılarına tıkladığınızda o şirketlerin sitesine ya da uygulamasına geçersiniz. Bu sitelerin verilerinizi nasıl işlediği kendi politikalarına tabidir; o politikaları okumanızı öneririz.",
      ],
    },
    {
      baslik: "Veri güvenliği",
      bloklar: [
        "Site ile tarayıcınız arasındaki bağlantı şifrelidir (HTTPS). Sipariş bilgilerine yalnız siparişi yürütmekle görevli kişiler erişir. Kişisel verilerinizi korumak için KVKK m.12'de öngörülen teknik ve idari tedbirleri alırız.",
      ],
    },
    {
      baslik: "Kişisel verileriniz ve haklarınız",
      bloklar: [
        "Hangi verilerinizi hangi amaçla işlediğimizi, kimlere aktardığımızı ve KVKK'dan doğan haklarınızı KVKK aydınlatma metninde ayrıntılı olarak anlatıyoruz. Sorularınız için: {{SATICI_EPOSTA}}.",
      ],
    },
    {
      baslik: "Güncelleme",
      bloklar: [
        "Bu politikayı gerektiğinde güncelleriz. Güncel metin her zaman bu sayfadadır.",
        "Son güncelleme: {{GUNCELLEME_TARIHI}}.",
      ],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli: Kişisel Verileri Koruma Kurulunun çerez uygulamalarına ilişkin rehberine göre zorunlu çerezler için açık rıza aranmadığı; yalnız zorunlu çerez ve localStorage kullanan sitede onay bandı gerekmediği yorumu teyit edilmeli.",
    "Yazılım teyit etmeli: Yazı tipleri src/app/layout.tsx içinde next/font/google ile yükleniyor; Next.js bunları derleme sırasında indirip sitenin kendi sunucusundan sunar, ziyaretçinin tarayıcısından Google'a istek gitmez. İleride yazı tipi ya da başka bir kaynak (harita, gömülü video, harici betik) doğrudan üçüncü taraf sunucudan yüklenirse ziyaretçinin IP adresi o sunucuya (çoğu zaman yurt dışına) gider ve bu metin güncellenmelidir.",
    "Yazılım teyit etmeli: Kodda (src/bilesenler/sepet/sepet-deposu.ts) localStorage'a yalnız ürün ve adet yazıldığı görüldü. Sipariş tamamlanınca sepetin temizlenip temizlenmediği kontrol edilmeli; tablodaki “ne kadar kalır” sütunu buna göre düzeltilmeli. İleride form taslağı (ad, adres) yerel depoya yazılırsa metin değişmeli.",
    "Yazılım teyit etmeli: Görevde yalnız yönetici çerezi anlatılmıştı, ancak kodda (src/app/(magaza)/odeme/eylemler.ts) sipariş sonrası müşteriye de “siparis_<no>” adlı, 24 saatlik, httpOnly bir erişim çerezi yazıldığı görüldü; tabloya “Sipariş erişim çerezi” olarak eklendi. Çerez değişirse bu satır güncellenmeli. Yönetici oturum çerezinin adı ve süresi, kod yazılınca doğrulanmalı.",
    "Hukukçu teyit etmeli: Sipariş erişim çerezi, kullanıcının istediği hizmeti (kendi sipariş sayfasını görmek) sunmak için kullanıldığından zorunlu çerez sayıldı.",
    "Yazılım teyit etmeli: Sunucu ya da ters vekil sunucu (Coolify, Traefik vb.) istek kayıtlarında IP adresi tutuluyor mu ve kaç gün saklanıyor? Metinde “tutabilir” denildi; kesinleşince süre yazılmalı.",
    "Hukukçu teyit etmeli: Kurulum paneli (ahmcloud.com/kart) farklı bir alan adında çalışıyor; panelin kendi oturum çerezi ve gizlilik metni olup olmadığı, bu politikanın onu kapsayıp kapsamayacağı belirlenmeli. Yönlendirme sunucusunun okutan kişilerin IP adresini kaydetme biçimi kesinleşmeli (KVKK notlarına bakın).",
  ],
};

// ---------------------------------------------------------------------------
// 7. Kullanım koşulları
// ---------------------------------------------------------------------------

const KULLANIM_KOSULLARI: YasalBelge = {
  slug: "kullanim-kosullari",
  baslik: "Kullanım koşulları",
  kisaBaslik: "Kullanım koşulları",
  ozet: "Bu koşullar sitenin kullanımını ve kartla birlikte verilen yönlendirme hizmetini düzenler. Kartınızı bağladığınız bağlantının içeriğinden siz sorumlusunuz.",
  bolumler: [
    {
      baslik: "Taraflar ve kapsam",
      bloklar: [
        "Bu koşullar, {{SITE_ADRESI}} adresindeki siteyi işleten {{SATICI_UNVAN}} (bundan sonra “satıcı”) ile siteyi ziyaret eden ya da kartı satın alıp yönlendirme hizmetini kullanan sizin aranızda uygulanır.",
        {
          tur: "liste",
          maddeler: [
            "Site: {{SITE_ADRESI}}",
            "Kurulum paneli: https://ahmcloud.com/kart",
            "Yönlendirme hizmeti: Kartın QR kodunun ve NFC çipinin gittiği https://ahmcloud.com/q/KOD adresleri",
          ],
        },
        "Satın alma işlemlerinde ayrıca ön bilgilendirme formu ve mesafeli satış sözleşmesi uygulanır. Bu koşullarla o belgeler arasında çelişki olursa o belgeler ve tüketici mevzuatı uygulanır.",
      ],
    },
    {
      baslik: "Siteyi kullanma",
      bloklar: [
        "Siteyi hukuka ve bu koşullara uygun kullanmayı kabul edersiniz. Şunları yapamazsınız:",
        {
          tur: "liste",
          maddeler: [
            "Siteye, sunuculara ya da diğer kullanıcılara zarar verecek, sitenin çalışmasını engelleyecek ya da sunuculara aşırı yük bindirecek işlemler yapmak",
            "Güvenlik önlemlerini aşmaya ya da yetkiniz olmayan bölümlere girmeye çalışmak",
            "Başkası adına izinsiz ya da gerçeğe aykırı bilgilerle sipariş vermek",
            "Site içeriğini izinsiz kopyalamak, çoğaltmak ya da ticari amaçla kullanmak",
          ],
        },
        "Sipariş vermek için 18 yaşını doldurmuş olmanız ve sözleşme yapma ehliyetine (kendi adınıza geçerli sözleşme yapabilme yeterliliğine) sahip olmanız gerekir.",
      ],
    },
    {
      baslik: "Siparişin adımları",
      bloklar: [
        "Sözleşme şu teknik adımlarla kurulur:",
        {
          tur: "sirali",
          maddeler: [
            "Ürünü ve adedi seçip sepete eklersiniz.",
            "Ödeme sayfasında iletişim, teslimat ve fatura bilgilerinizi girer, ödeme yöntemini seçersiniz.",
            "Sipariş özetini kontrol edersiniz. Hatalı bir bilgiyi siparişi onaylamadan önce aynı sayfada düzeltebilir ya da sepete dönerek ürünü ve adedi değiştirebilirsiniz.",
            "Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okuyup onay kutusunu işaretlersiniz.",
            "Siparişi onaylarsınız. Siparişinizin alındığı sipariş onay sayfasında gösterilir ve e-posta adresinize bildirilir.",
          ],
        },
        "Sözleşme metni satıcı tarafından sipariş kaydıyla birlikte saklanır ve bir örneği e-posta adresinize gönderilir.",
        "Sitede açık bir fiyat ya da stok hatası olursa sizi bilgilendiririz. Siparişinizi güncel koşullarla sürdürmek istemezseniz sipariş iptal edilir ve ödeme yaptıysanız ödediğiniz bütün tutar iade edilir.",
      ],
    },
    {
      baslik: "Yönlendirme hizmeti nasıl çalışır",
      bloklar: [
        {
          tur: "liste",
          maddeler: [
            "Her kartın kendine ait bir kodu vardır. Kartın QR kodu ve NFC çipi https://ahmcloud.com/q/KOD biçimindeki yönlendirme adresine gider. Bu adres, kartı okutan kişiyi sizin belirlediğiniz bağlantıya yönlendirir.",
            "Kartı https://ahmcloud.com/kart adresindeki kurulum panelinden, bir hesapla giriş yaparak bağlarsınız. Bağlantıyı istediğiniz zaman değiştirebilirsiniz; kartı yeniden bastırmanız gerekmez.",
            "Yönlendirme hizmeti kartla birlikte verilir. Süresi ve kapsamı: {{YONLENDIRME_HIZMET_SURESI}}. Süre sonunda hizmetin devamına ilişkin koşulları, süre dolmadan önce kayıtlı iletişim bilgileriniz üzerinden size bildiririz.",
            "Kartın çalışması için yönlendirme hizmetinin sürmesi ve okutan telefonun internete bağlı olması gerekir. NFC ile okutmak için telefonun NFC özelliğinin bulunması ve açık olması gerekir; NFC'si olmayan telefonlar QR kodu kamerayla okutabilir.",
            "Kart iade edildiğinde ya da yönlendirme hizmeti sona erdiğinde kartın bağlantısı sıfırlanır.",
          ],
        },
      ],
    },
    {
      baslik: "Hesabınız",
      bloklar: [
        "Kurulum paneli hesabınızın giriş bilgilerini gizli tutmak sizin sorumluluğunuzdadır. Hesabınızın ya da kartınızın izinsiz kullanıldığını fark ederseniz hemen {{SATICI_EPOSTA}} adresine bildirin; bildiriminiz üzerine gereken önlemleri alırız.",
      ],
    },
    {
      baslik: "Bağlantının içeriğinden kim sorumlu",
      bloklar: [
        "Kartınızın hangi bağlantıya yönlendireceğine siz karar verirsiniz. Bağlantının ve açılan sayfanın içeriğinden siz sorumlusunuz. Satıcı, bağlantıların içeriğini önceden denetlemekle yükümlü değildir.",
        "Kartı şu amaçlarla kullanamazsınız:",
        {
          tur: "liste",
          maddeler: [
            "Hukuka aykırı bir içeriğe ya da faaliyete yönlendirmek",
            "Dolandırıcılık, oltalama (kişisel bilgi ya da şifre ele geçirmek için hazırlanan sahte sayfa) ya da sahte ödeme sayfasına yönlendirmek",
            "Zararlı yazılım ya da cihazlara zarar veren içerik barındıran adreslere yönlendirmek",
            "Yasa dışı bahis, kumar ya da satışı yasak ürün ve hizmetlere yönlendirmek",
            "Başka bir kişinin ya da işletmenin kimliğini, markasını ya da hesabını taklit eden sayfalara yönlendirmek",
            "Müstehcen, şiddet içeren, nefret söylemi barındıran ya da çocuklara zarar verebilecek içeriğe yönlendirmek",
            "Başkalarının telif, marka ya da kişilik haklarını ihlal eden içeriğe yönlendirmek",
            "Yönlendirdiğiniz platformun kurallarına aykırı biçimde yorum ya da takipçi toplamak (örneğin bazı platformlar yorum karşılığında indirim ya da hediye verilmesini yasaklar)",
          ],
        },
        "Kartı okutan kişilerden bağlandığınız sayfada kişisel veri topluyorsanız, bu veriler için veri sorumlusu (verilerin neden ve nasıl işleneceğine karar veren kişi) sizsiniz ve KVKK'dan doğan yükümlülüklere siz uyarsınız.",
      ],
    },
    {
      baslik: "Kesinti ve bakım",
      bloklar: [
        "Siteyi ve yönlendirme hizmetini kesintisiz sunmak için makul özeni gösteririz. Bununla birlikte bakım, güncelleme, altyapı sağlayıcısındaki arızalar, siber saldırılar ya da kontrolümüz dışındaki nedenlerle hizmet geçici olarak kesilebilir.",
        "Planlı bakımları mümkün olduğunda önceden duyurur ve kullanımın az olduğu saatlerde yapmaya çalışırız.",
        "Google, Instagram ya da bağladığınız başka bir platformun adres yapısını değiştirmesi, sayfanızı ya da hesabınızı kapatması yönlendirme hizmetinin dışındadır. Bu durumda bağlantınızı kurulum panelinden güncellemeniz gerekir.",
      ],
    },
    {
      baslik: "Askıya alma",
      bloklar: [
        "Kartın bu koşullara ya da hukuka aykırı bir bağlantıya yönlendirildiğini tespit edersek ya da yetkili bir kurumdan bu yönde bir karar ya da talep alırsak, kartın yönlendirmesini askıya alabiliriz (geçici olarak durdurabiliriz).",
        "Askıya almadan önce, mümkünse, sizi kayıtlı iletişim bilgileriniz üzerinden bilgilendirir ve bağlantıyı düzeltmeniz için süre tanırız. Kartı okutan kişilerin zarar görme tehlikesi varsa (örneğin oltalama ya da zararlı yazılım) yönlendirmeyi önceden bildirmeden durdurur, ardından size bilgi veririz.",
        "Aykırılık giderilince yönlendirme yeniden açılır. Ağır ya da tekrarlanan kötüye kullanımda yönlendirme hizmeti kalıcı olarak sonlandırılabilir.",
        "Askıya alma kararına itiraz etmek için {{SATICI_EPOSTA}} adresine yazabilirsiniz.",
      ],
    },
    {
      baslik: "Fikri mülkiyet",
      bloklar: [
        "Sitedeki metin, görsel, logo ve tasarımlar satıcıya ya da satıcıya lisans verenlere aittir; izinsiz kopyalanamaz ve kullanılamaz.",
        "Google ve Instagram, sahiplerinin markalarıdır. Satıcı bu şirketlerle bağlantılı değildir; bu şirketler ürünü onaylamaz ya da desteklemez.",
      ],
    },
    {
      baslik: "Sorumluluk",
      bloklar: [
        "Satıcı, kendi kusurundan doğan zararlardan kanuna göre sorumludur. Satıcı; bağladığınız bağlantının içeriğinden, üçüncü taraf platformların (Google, Instagram gibi) işleyişinden ve bu koşullara aykırı kullanımdan doğan zararlardan sorumlu değildir.",
        "Bu koşulların hiçbir hükmü, tüketici mevzuatından doğan haklarınızı ve kanunen sınırlandırılamayan sorumlulukları, örneğin kast (bilerek ve isteyerek zarar verme) ve ağır ihmal (gösterilmesi gereken en temel özenin bile gösterilmemesi) hâllerindeki sorumluluğu sınırlamaz.",
      ],
    },
    {
      baslik: "Değişiklikler",
      bloklar: [
        "Bu koşulları gerektiğinde güncelleyebiliriz. Güncel metin bu sayfada yayımlanır. Önemli değişiklikleri yönlendirme hizmetini kullanan alıcılara kayıtlı iletişim bilgileri üzerinden ayrıca bildiririz.",
        "Satın alma işlemlerinize, siparişi onayladığınız anda yürürlükte olan metinler uygulanır.",
      ],
    },
    {
      baslik: "Uygulanacak hukuk ve uyuşmazlıklar",
      bloklar: [
        "Bu koşullara Türk hukuku uygulanır.",
        TUKETICI_UYUSMAZLIK,
        "Kurumsal (tacir) alıcılarla uyuşmazlıklarda genel yetki kuralları uygulanır.",
      ],
    },
    {
      baslik: "İletişim ve güncelleme",
      bloklar: [SATICI_BILGILERI, "Son güncelleme: {{GUNCELLEME_TARIHI}}."],
    },
  ],
  notlar: [
    "Hukukçu teyit etmeli: Sorumluluk, kesinti ve askıya alma maddeleri 6502 m.5 (haksız şart) açısından incelenmeli. Askıya alma ya da kalıcı sonlandırma durumunda ücret iadesi yapılıp yapılmayacağı yazılmadı.",
    "Hukukçu teyit etmeli: Yönlendirme hizmetinin 5651 sayılı Kanun karşısındaki niteliği (yer sağlayıcı sayılıp sayılmayacağı) ve kötüye kullanım bildirimlerini alma yükümlülüğü değerlendirilmeli.",
    "Hukukçu teyit etmeli: Fiyat ya da stok hatasında siparişin iptali maddesi tüketiciye karşı geçerli mi? Metin, iptali tüketicinin güncel koşulları kabul etmemesine bağladı.",
    "Hukukçu teyit etmeli: 18 yaş şartı ve ehliyet cümlesi.",
    "Hukukçu teyit etmeli: Ürün adlarında “Google” ve “Instagram” geçiyor (“Google yorum standı”). Bu kullanımın marka hukuku açısından tanımlayıcı kullanım sayılıp sayılmayacağı ve “bağlantılı değildir” beyanının yeterliliği kontrol edilmeli.",
    "Hukukçu teyit etmeli: Kurulum paneli ve yönlendirme sunucusu ahmcloud.com alan adında çalışıyor. Bu altyapıyı satıcıdan farklı bir kişi işletiyorsa, hizmetin satıcı tarafından o altyapı üzerinden verildiği ve aradaki sözleşme ilişkisi metne eklenmeli.",
    "İşletme teyit etmeli: NFC çipi kilitli mi (kullanıcı yeniden yazabilir mi)? Hizmet sona erdiğinde kartın sizin bağlantınıza gitmeyeceği yazıldı; süre sonunda “devam koşullarını önceden bildiririz” taahhüdü ve önemli değişikliklerin “kayıtlı iletişim bilgisine” (panel hesabındaki e-posta) bildirilmesi uygulamada karşılanabilmeli. Planlı bakım duyurusunun nerede yapılacağı belirlenmeli.",
  ],
};

// ---------------------------------------------------------------------------
// Sitede gösterim sırası
// ---------------------------------------------------------------------------

export const YASAL_BELGELER: YasalBelge[] = [
  ON_BILGILENDIRME,
  MESAFELI_SATIS,
  IADE_VE_CAYMA,
  KARGO_VE_TESLIMAT,
  KVKK,
  GIZLILIK_VE_CEREZ,
  KULLANIM_KOSULLARI,
];
