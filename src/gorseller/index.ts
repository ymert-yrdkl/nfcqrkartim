// Sitedeki bütün ürün görselleri buradan dağıtılır. Görsel değişince yalnız bu dosya değişir.
// urun/: stüdyo render'ları, şeffaf zemin (scripts/gorsel/urun_render.py; gerçek geometri ve gerçek baskı).
// sahne/: sosyal medya ajansının sahne görselleri (ortam yapay zekâyla üretildi; standın ön yüzü gerçek
//         baskı dokusudur, QR'lar okutularak denetlendi). Bu görsellerin yanında YZ notu gösterilir.

import googleUc from "./urun/google-34.png";
import instagramUc from "./urun/instagram-34.png";
import instagramSol from "./urun/instagram-34-sol.png";
import ikili from "./urun/ikili-hero.png";
import ikiliUst from "./urun/ikili-ust.png";
import googleOn from "./urun/google-on.png";
import instagramOn from "./urun/instagram-on.png";
import googleYan from "./urun/google-yan.png";
import googleParcalar from "./urun/google-parcalar.png";

import kafeIkili from "./sahne/kafe-ikili.jpg";
import kafeIkili2 from "./sahne/kafe-ikili-2.jpg";
import googleYakin from "./sahne/google-yakin.jpg";
import instagramYakin from "./sahne/instagram-yakin.jpg";
import kafeGoogle from "./sahne/kafe-google.jpg";
import restoranGoogle from "./sahne/restoran-google.jpg";
import pastaneInstagram from "./sahne/pastane-instagram.jpg";
import butikInstagram from "./sahne/butik-instagram.jpg";
import kuaforInstagram from "./sahne/kuafor-instagram.jpg";
import berberInstagram from "./sahne/berber-instagram.jpg";
import klinikGoogle from "./sahne/klinik-google.jpg";
import klinikGoogleYakin from "./sahne/klinik-google-yakin.jpg";
import cicekciInstagram from "./sahne/cicekci-instagram.jpg";
import otoServisGoogle from "./sahne/oto-servis-google.jpg";

import type { StaticImageData } from "next/image";

export type Gorsel = {
  src: StaticImageData;
  alt: string;
  // seffaf: zeminsiz render, kâğıt tonlu stüdyo degradesinin üstünde bütünüyle görünür
  // sahne: ortam görseli, kırpılarak doldurur
  zemin: "seffaf" | "sahne";
  // Kırpılınca ürünün görünür kalacağı nokta (CSS object-position).
  odak?: string;
  // Sahnenin ortamı yapay zekâyla üretildi mi (etiket gösterilir).
  yz?: boolean;
};

const sahne = (src: StaticImageData, alt: string, odak: string): Gorsel => ({ src, alt, zemin: "sahne", odak, yz: true });

export const GORSEL = {
  googleUc: { src: googleUc, alt: "Google yorum standı, sağdan üç çeyrek açıyla", zemin: "seffaf" },
  instagramUc: { src: instagramUc, alt: "Instagram takip standı, soldan üç çeyrek açıyla", zemin: "seffaf" },
  instagramSol: { src: instagramSol, alt: "Instagram takip standı, sağdan üç çeyrek açıyla", zemin: "seffaf" },
  ikili: { src: ikili, alt: "Google yorum standı ile Instagram takip standı yan yana", zemin: "seffaf" },
  ikiliUst: { src: ikiliUst, alt: "İki stand yan yana, yukarıdan bakış", zemin: "seffaf" },
  googleOn: {
    src: googleOn,
    alt: "Google yorum standının önden görünüşü: solda telefonu yaklaştırma alanı, sağda QR kod, altta kart kodu",
    zemin: "seffaf",
  },
  instagramOn: {
    src: instagramOn,
    alt: "Instagram takip standının önden görünüşü: solda telefonu yaklaştırma alanı, sağda QR kod, altta kart kodu",
    zemin: "seffaf",
  },
  googleYan: { src: googleYan, alt: "Standın yandan görünüşü: 3 mm pleksi pano ve taban", zemin: "seffaf" },
  googleParcalar: {
    src: googleParcalar,
    alt: "Stand parçaları: pano alt kenarındaki tırnakla tabandaki yuvaya oturur",
    zemin: "seffaf",
  },

  kafeIkili: sahne(kafeIkili, "Kafe tezgâhında ödeme cihazının yanında Google ve Instagram standı", "50% 54%"),
  kafeIkili2: sahne(kafeIkili2, "Kahve dükkânının tezgâhında yan yana iki stand", "50% 76%"),
  googleYakin: sahne(googleYakin, "Ahşap kasa tezgâhında Google yorum standı, arkada bulanık kafe", "50% 64%"),
  instagramYakin: sahne(instagramYakin, "Mermer tezgâhta Instagram takip standı", "50% 66%"),
  kafeGoogle: sahne(kafeGoogle, "Kafe kasasında ödeme cihazının yanında Google yorum standı", "38% 58%"),
  restoranGoogle: sahne(restoranGoogle, "Restoran kasasında çay bardağının yanında Google yorum standı", "52% 58%"),
  pastaneInstagram: sahne(pastaneInstagram, "Pastane vitrininin önünde Instagram takip standı", "50% 62%"),
  butikInstagram: sahne(butikInstagram, "Giyim butiğinin kasasında Instagram takip standı", "50% 66%"),
  kuaforInstagram: sahne(kuaforInstagram, "Kuaför resepsiyonunda mermer tezgâhta Instagram takip standı", "48% 62%"),
  berberInstagram: sahne(berberInstagram, "Berber tezgâhında Instagram takip standı", "50% 52%"),
  klinikGoogle: sahne(klinikGoogle, "Klinik resepsiyonunda Google yorum standı", "50% 56%"),
  klinikGoogleYakin: sahne(klinikGoogleYakin, "Klinik resepsiyon tezgâhında Google yorum standı, yakından", "50% 50%"),
  cicekciInstagram: sahne(cicekciInstagram, "Çiçekçi tezgâhında buketlerin yanında Instagram takip standı", "58% 60%"),
  otoServisGoogle: sahne(otoServisGoogle, "Oto servis resepsiyonunda Google yorum standı", "52% 57%"),
} satisfies Record<string, Gorsel>;

// Sahne videoları (public/video, 720×1280, sessiz). Ortam ve el yapay zekâyla üretildi; standın yüzü gerçek baskı.
export type Video = { src: string; poster: string; etiket: string; odak: string };

export const VIDEO = {
  telefonuYaklastirin: {
    src: "/video/telefonu-yaklastirin.mp4",
    poster: "/video/telefonu-yaklastirin.jpg",
    etiket: "Kafe kasasında bir müşteri telefonunu Google yorum standına yaklaştırıyor",
    odak: "50% 62%",
  },
  instagramDokunus: {
    src: "/video/instagram-dokunus.mp4",
    poster: "/video/instagram-dokunus.jpg",
    etiket: "Kuaför resepsiyonunda bir müşteri telefonunu Instagram standına yaklaştırıyor",
    odak: "50% 66%",
  },
  ikiliSet: {
    src: "/video/ikili-set.mp4",
    poster: "/video/ikili-set.jpg",
    etiket: "Kafe tezgâhında Google ve Instagram standı, arkada çalışan barista",
    odak: "50% 66%",
  },
  butikInstagram: {
    src: "/video/butik-instagram.mp4",
    poster: "/video/butik-instagram.jpg",
    etiket: "Giyim butiğinin kasasında Instagram takip standı",
    odak: "50% 62%",
  },
  restoranGoogle: {
    src: "/video/restoran-google.mp4",
    poster: "/video/restoran-google.jpg",
    etiket: "Restoran kasasında çay bardağının yanında Google yorum standı",
    odak: "50% 62%",
  },
} satisfies Record<string, Video>;

export const YZ_NOTU = "Sahne görseli yapay zekâyla oluşturuldu; ürün gerçek tasarımıdır.";
