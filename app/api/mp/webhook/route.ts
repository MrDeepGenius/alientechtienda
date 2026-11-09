import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { getPayment, mpEnabled } from "@/lib/mp";
// Mercado Pago avisa acá. No confiamos en el cuerpo: consultamos el pago a la API con nuestro token.
export async function POST(req: Request) {
  if (!mpEnabled()) return NextResponse.json({ ok: true });
  const u = new URL(req.url); let body: any = {}; try { body = await req.json(); } catch {}
  const type = body.type || u.searchParams.get("type") || u.searchParams.get("topic");
  const id = body?.data?.id || u.searchParams.get("data.id") || u.searchParams.get("id");
  if (type !== "payment" || !id) return NextResponse.json({ ok: true });
  try {
    const pay = await getPayment(String(id)); const s = db();
    const { data: o } = await s.from("orders").select("id,total,status").eq("id", pay.external_reference).single();
    if (o && pay.status === "approved" && Number(pay.transaction_amount) >= Number(o.total) && ["pago_pendiente", "pendiente"].includes(o.status))
      await s.from("orders").update({ status: "pago_confirmado", mp_payment_id: String(id) }).eq("id", o.id);
  } catch { return NextResponse.json({ error: "retry" }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
