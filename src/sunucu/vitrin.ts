import "server-only";
import { connection } from "next/server";
import { suresiGecenleriIptalEt } from "./siparis";
import { satilabilirler } from "./stok";

// Mağaza sayfalarının stok okuması: önce ödeme süresi dolan siparişleri iptal edip stoğu serbest bırakır.
export async function guncelSatilabilirler() {
  await connection(); // istek anında çalış (derlemede veritabanına dokunma)
  suresiGecenleriIptalEt();
  return satilabilirler();
}
