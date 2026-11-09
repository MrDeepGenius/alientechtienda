import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { calcShipping, money } from "@/lib/shipping";
import { createPreference, mpEnabled } from "@/lib/mp";
const err = (m: string) => NextResponse.json({ error: m }, { status: 400 });
export async function POST(req: Request) {
  const b = await req.json(); const s = db(); const c = b.customer || {};
  if (!c.name || !c.phone || !Array.isArray(b.items) || !b.items.length) return err("Faltan datos obligatorios");
  const { data: prods } = await s.from("products").select("*").in("id", b.items.map((i: any) => i.id)).eq("active", true);
  const { data: zone } = await s.from("shipping_zones").select("*").eq("id", b.zoneId).eq("active", true).single();
  if (!zone || !prods) return err("Datos inválidos");
  if (zone.kind !== "pickup" && !c.address) return err("Ingresá tu dirección");
  if (b.payment === "efectivo" && !zone.cash_on_delivery) return err("Efectivo no disponible en esa zona");
  if (!["transferencia", "efectivo", "mercadopago"].includes(b.payment) || (b.payment === "mercadopago" && !mpEnabled())) return err("Método de pago no disponible");
  // Los precios SIEMPRE se recalculan en el servidor.
  const lines: any[] = []; let sub = 0;
  for (const i of b.items) {
    const p = prods.find((x: any) => x.id === i.id); const q = Math.floor(Number(i.qty));
    if (!p || q < 1 || q > p.stock) return err(`Sin stock: ${p?.name || "producto"}`);
    sub += p.price * q; lines.push({ id: p.id, name: p.name, qty: q, price: p.price });
  }
  const ship = calcShipping(sub, zone), total = sub + ship;
  // Descuento de stock atómico (todo o nada). Si falla, nadie queda con stock negativo.
  const { error: se } = await s.rpc("take_stock", { p_items: lines.map((l) => ({ id: l.id, qty: l.qty })) });
  if (se) return err("Sin stock suficiente, actualizá el carrito");
  const restore = () => s.rpc("restore_stock", { p_items: lines.map((l) => ({ id: l.id, qty: l.qty })) });
  const { data: o, error } = await s.from("orders").insert({ customer: c, items: lines, subtotal: sub, shipping: ship, total,
    zone_name: zone.name, payment_method: b.payment, notes: b.notes || "", status: b.payment === "efectivo" ? "pendiente" : "pago_pendiente" }).select("id,number").single();
  if (error || !o) { await restore(); return err("No se pudo crear el pedido"); }
  let mpUrl: string | null = null;
  if (b.payment === "mercadopago") {
    try { mpUrl = await createPreference(o, lines, ship); }
    catch { await s.from("orders").update({ status: "cancelado" }).eq("id", o.id); await restore(); return err("No se pudo iniciar el pago con tarjeta"); }
  }
  const { data: st } = await s.from("settings").select("*"); const cfg: any = Object.fromEntries((st || []).map((r: any) => [r.key, r.value]));
  const msg = `Pedido #${o.number} - ALIENTECH\nCliente: ${c.name} ${c.lastName || ""}\n` + lines.map((l) => `${l.qty}x ${l.name}`).join("\n") +
    `\nTotal: ${money(total)}\nLocalidad: ${zone.name}\nDirección: ${c.address || "Retiro"}\nPago: ${b.payment}`;
  return NextResponse.json({ number: o.number, total, mp: mpUrl, wa: `https://wa.me/${(cfg.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}` });
}
