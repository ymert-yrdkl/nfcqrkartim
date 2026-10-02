"use client";

// Kök düzende hata olursa: kendi <html>'ini çizer, site stilleri yüklenmeyebilir; bu yüzden satır içi stil.
export default function GenelHata({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, background: "#F4F4EE", color: "#151511", fontFamily: "system-ui, sans-serif" }}>
        <title>Bir sorun çıktı | nfcqrkartim</title>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Sayfa yüklenemedi.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#33332E" }}>
            Site az önce güncellenmiş olabilir. Sayfayı yenileyip tekrar deneyin.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, height: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#C5F94E", color: "#151511", fontSize: 16, cursor: "pointer" }}
          >
            Tekrar dene
          </button>
        </main>
      </body>
    </html>
  );
}
