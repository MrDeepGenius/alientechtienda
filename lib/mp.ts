// Mercado Pago Checkout Pro vía REST (sin SDK). Se activa solo si existe MP_ACCESS_TOKEN.
export const mpEnabled = () => !!process.env.MP_ACCESS_TOKEN;
const H = () => ({ Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" });
const site = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export async function createPreference(order: { id: string; number: number }, lines: any[], shipping: number) {
  const items = lines.map((l) => ({ title: l.name, quantity: l.qty, unit_price: Number(l.price), currency_id: "ARS" }));
  if (shipping > 0) items.push({ title: "Envío", quantity: 1, unit_price: shipping, currency_id: "ARS" });
  const back = `${site()}/pedido?n=${order.number}`;
  const body: any = { items, external_reference: order.id, statement_descriptor: "ALIENTECH",
    back_urls: { success: back, pending: back, failure: back }, notification_url: `${site()}/api/mp/webhook` };
  if (site().startsWith("https")) body.auto_return = "approved";
  const r = await fetch("https://api.mercadopago.com/checkout/preferences", { method: "POST", headers: H(), body: JSON.stringify(body) });
  if (!r.ok) throw new Error("mp_preference");
  return (await r.json()).init_point as string;
}
export async function getPayment(id: string) {
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`, { headers: H() });
  if (!r.ok) throw new Error("mp_payment");
  return r.json();
}
