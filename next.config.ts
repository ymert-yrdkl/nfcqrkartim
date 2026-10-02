import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker imajı için tek klasörlük sunucu çıktısı (.next/standalone).
  output: "standalone",
  poweredByHeader: false,
  // Geliştirme rozeti ekran görüntülerine (paylaşım görseli, tasarım denetimi) karışmasın.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [
      {
        source: "/:yol*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
