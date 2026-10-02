export const DURUMLAR = ["odeme_bekliyor", "hazirlaniyor", "kargoda", "teslim_edildi", "iptal"] as const;
export type SiparisDurumu = (typeof DURUMLAR)[number];

export const DURUM_ADI: Record<SiparisDurumu, string> = {
  odeme_bekliyor: "Ödeme bekleniyor",
  hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim edildi",
  iptal: "İptal edildi",
};

// Müşteriye gösterilen ilerleme adımları (iptal ayrı gösterilir).
export const ILERLEME: SiparisDurumu[] = ["odeme_bekliyor", "hazirlaniyor", "kargoda", "teslim_edildi"];

// Yöneticinin bir durumdan geçebileceği durumlar.
export const GECISLER: Record<SiparisDurumu, SiparisDurumu[]> = {
  odeme_bekliyor: ["hazirlaniyor", "iptal"],
  hazirlaniyor: ["kargoda", "odeme_bekliyor", "iptal"],
  kargoda: ["teslim_edildi", "hazirlaniyor"],
  teslim_edildi: ["kargoda"],
  iptal: [],
};

// Geçiş düğmesinin metni (yönetim paneli).
export const GECIS_ADI: Record<SiparisDurumu, string> = {
  odeme_bekliyor: "Ödeme bekleniyor olarak geri al",
  hazirlaniyor: "Ödeme alındı, hazırlanıyor",
  kargoda: "Kargoya verildi",
  teslim_edildi: "Teslim edildi",
  iptal: "Siparişi iptal et",
};
