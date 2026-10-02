import { vt } from "@/sunucu/db";

// Sağlık kontrolü (Docker HEALTHCHECK / Coolify): veritabanı okunabiliyor mu?
export const dynamic = "force-dynamic";

export function GET() {
  try {
    vt().prepare("SELECT 1").get();
    return Response.json({ durum: "tamam" });
  } catch {
    return Response.json({ durum: "veritabani-yok" }, { status: 503 });
  }
}
