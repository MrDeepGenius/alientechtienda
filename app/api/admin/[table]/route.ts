import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
const T = ["products", "shipping_zones", "orders", "settings"];
const bad = () => NextResponse.json({ error: "Tabla inválida" }, { status: 400 });
export async function GET(_: Request, { params }: any) {
  if (!T.includes(params.table)) return bad();
  const q = db().from(params.table).select("*");
  const { data, error } = await (params.table === "settings" ? q.order("key") : params.table === "orders" ? q.order("created_at", { ascending: false }) : q.order("name"));
  return NextResponse.json(error ? { error: error.message } : data);
}
export async function POST(req: Request, { params }: any) {
  if (!T.includes(params.table)) return bad();
  const row = await req.json(); const s = db(); const t = s.from(params.table);
  if (params.table === "orders" && row.id && row.status) {
    // Cancelar repone stock; reactivar un pedido cancelado lo vuelve a descontar.
    const { data: o } = await s.from("orders").select("status,items").eq("id", row.id).single();
    const its = (o?.items || []).map((l: any) => ({ id: l.id, qty: l.qty }));
    if (o && o.status !== "cancelado" && row.status === "cancelado") await s.rpc("restore_stock", { p_items: its });
    if (o && o.status === "cancelado" && row.status !== "cancelado") {
      const { error } = await s.rpc("take_stock", { p_items: its });
      if (error) return NextResponse.json({ error: "No hay stock para reactivar este pedido" });
    }
  }
  const r = params.table === "settings" ? await t.upsert(row, { onConflict: "key" })
    : row.id ? await t.update(row).eq("id", row.id) : await t.insert(row);
  return NextResponse.json(r.error ? { error: r.error.message } : { ok: true });
}
export async function DELETE(req: Request, { params }: any) {
  if (!T.includes(params.table)) return bad();
  const id = new URL(req.url).searchParams.get("id");
  const r = await db().from(params.table).delete().eq("id", id!);
  return NextResponse.json(r.error ? { error: r.error.message } : { ok: true });
}
