import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
// Seguimiento público: requiere número de pedido + teléfono con el que se compró.
export async function GET(req: Request) {
  const u = new URL(req.url); const n = Number(u.searchParams.get("n")); const ph = (u.searchParams.get("phone") || "").replace(/\D/g, "");
  if (!n || ph.length < 6) return NextResponse.json({ error: "Ingresá número de pedido y teléfono" }, { status: 400 });
  const { data: o } = await db().from("orders").select("number,created_at,status,items,subtotal,shipping,total,zone_name,payment_method,tracking,customer").eq("number", n).single();
  if (!o || String(o.customer?.phone || "").replace(/\D/g, "") !== ph) return NextResponse.json({ error: "No encontramos ese pedido" }, { status: 404 });
  const { customer, ...pub } = o; return NextResponse.json(pub);
}
