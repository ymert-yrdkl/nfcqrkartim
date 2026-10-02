import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { SITE } from "@/magaza/ayarlar";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.adres),
  title: {
    default: `${SITE.ad}: NFC ve QR'lı Google yorum ve Instagram standı`,
    template: `%s | ${SITE.ad}`,
  },
  description: SITE.aciklama,
  applicationName: SITE.ad,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE.ad,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F4F4EE",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
