"use client";
import { useEffect, useState } from "react";
import { STATUS, money } from "@/lib/shipping";
const CATS = ["Smartphones", "Gaming", "Audio", "Accesorios", "Informática", "Smart Home"];
const api = (t: string, m = "GET", b?: any) => fetch(`/api/admin/${t}${m === "DELETE" ? "?id=" + b : ""}`, { method: m, headers: { "Content-Type": "application/json" }, body: m === "POST" ? JSON.stringify(b) : undefined }).then((r) => r.json());
const EMPTY = { name: "", description: "", price: 0, old_price: 0, category: "Accesorios", stock: 0, sku: "", images: [], main_image: null, active: true, on_offer: false, free_shipping: true };

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [prods, setProds] = useState<any[]>([]); const [zones, setZones] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]); const [cfg, setCfg] = useState<any[]>([]);
  const [p, setP] = useState<any>(null); const [msg, setMsg] = useState("");
  const load = async () => { const [a, b, c, d] = await Promise.all([api("products"), api("shipping_zones"), api("orders"), api("settings")]); setProds(a); setZones(b); setOrders(c); setCfg(d); };
  useEffect(() => { load(); }, []);
  const note = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  async function upload(files: FileList | null) {
    if (!files?.length) return; const fd = new FormData(); Array.from(files).forEach((f) => fd.append("files", f));
    const r = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
    setP((x: any) => ({ ...x, images: [...x.images, ...r.urls], main_image: x.main_image || r.urls[0] || null }));
  }
  async function saveP() {
    const row = { ...p, price: Number(p.price), old_price: Number(p.old_price) || 0, stock: Number(p.stock) || 0 };
    const r = await api("products", "POST", row); if (r.error) return note(r.error); note("Guardado"); setP(null); load();
  }
  const rmImg = (u: string) => setP((x: any) => { const imgs = x.images.filter((i: string) => i !== u); return { ...x, images: imgs, main_image: x.main_image === u ? imgs[0] || null : x.main_image }; });
  const upd = (set: any, list: any[], i: number, k: string, v: any) => set(list.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const tabs: [string, string][] = [["products", "Productos"], ["zones", "Envíos"], ["orders", "Pedidos"], ["cfg", "Ajustes"]];
  return <main className="p-4 md:p-8 max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-6 flex-wrap gap-3"><h1 className="text-2xl font-black italic">ALIEN<span className="text-b2">TECH</span> · Panel</h1>
      <div className="flex gap-2 flex-wrap">{tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-full text-sm border ${tab === k ? "bg-b1 border-b2" : "glass"}`}>{l}{k === "orders" && ` (${orders.filter((o) => o.status === "pago_pendiente" || o.status === "pendiente").length})`}</button>)}</div></div>
    {msg && <p className="text-b3 mb-3">{msg}</p>}

    {tab === "products" && (p ? <div className="glass rounded-2xl p-5 space-y-3">
      <input className="inp" placeholder="Nombre" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} />
      <textarea className="inp" placeholder="Descripción" value={p.description} onChange={(e) => setP({ ...p, description: e.target.value })} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="text-xs text-mut">Precio de venta<input className="inp" type="number" value={p.price} onChange={(e) => setP({ ...p, price: e.target.value })} /></label>
        <label className="text-xs text-mut">Precio anterior<input className="inp" type="number" value={p.old_price} onChange={(e) => setP({ ...p, old_price: e.target.value })} /></label>
        <label className="text-xs text-mut">Stock<input className="inp" type="number" value={p.stock} onChange={(e) => setP({ ...p, stock: e.target.value })} /></label>
        <label className="text-xs text-mut">SKU (opcional)<input className="inp" value={p.sku || ""} onChange={(e) => setP({ ...p, sku: e.target.value })} /></label></div>
      <select className="inp" value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
      <div className="flex gap-5 flex-wrap text-sm">{[["active", "Activo"], ["on_offer", "Oferta"], ["free_shipping", "Envío gratis"]].map(([k, l]) => <label key={k} className="flex gap-2"><input type="checkbox" checked={!!p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} />{l}</label>)}</div>
      {p.on_offer && Number(p.old_price) > Number(p.price) && <p className="text-b3 text-sm">Descuento: {Math.round((1 - p.price / p.old_price) * 100)}%</p>}
      <div><input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} className="text-sm" />
        <div className="flex gap-3 flex-wrap mt-3">{p.images.map((u: string) => <div key={u} className={`relative w-28 border-2 rounded-xl overflow-hidden ${p.main_image === u ? "border-b3" : "border-transparent"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src={u} alt="" className="w-28 h-28 object-cover" />
          <div className="flex text-[11px]"><button className="flex-1 bg-b1 py-1" onClick={() => setP({ ...p, main_image: u })}>{p.main_image === u ? "Principal" : "Hacer principal"}</button><button className="bg-rose-600 px-2" onClick={() => rmImg(u)}>X</button></div></div>)}</div></div>
      <div className="flex gap-3"><button className="btn btn-p" onClick={saveP}>GUARDAR</button><button className="btn glass" onClick={() => setP(null)}>CANCELAR</button></div></div>
    : <div><button className="btn btn-p mb-4" onClick={() => setP({ ...EMPTY })}>+ NUEVO PRODUCTO</button>
      <div className="space-y-2">{prods.map((x) => <div key={x.id} className="glass rounded-xl p-3 flex items-center gap-3 flex-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}{x.main_image ? <img src={x.main_image} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-ink2" />}
        <div className="flex-1 min-w-[160px]"><b>{x.name}</b><p className="text-xs text-mut">{x.category} · stock {x.stock} {!x.active && "· OCULTO"}</p></div>
        <span className="font-bold">{money(x.price)}</span>
        <button className="btn glass" onClick={() => setP(x)}>Editar</button>
        <button className="btn bg-rose-700" onClick={async () => { if (confirm("¿Eliminar producto?")) { await api("products", "DELETE", x.id); load(); } }}>Eliminar</button></div>)}
        {!prods.length && <p className="text-mut">Todavía no cargaste productos.</p>}</div></div>)}

    {tab === "zones" && <div className="space-y-3">
      <p className="text-sm text-mut">Tipo: free = envío incluido en el precio (Rosario) · percent = % sobre el subtotal con monto mínimo · pickup = retiro sin costo.</p>
      {zones.map((z, i) => <div key={z.id || i} className="glass rounded-xl p-3 grid grid-cols-2 md:grid-cols-7 gap-2 items-end text-xs text-mut">
        <label className="md:col-span-2">Localidad<input className="inp" value={z.name} onChange={(e) => upd(setZones, zones, i, "name", e.target.value)} /></label>
        <label>Tipo<select className="inp" value={z.kind} onChange={(e) => upd(setZones, zones, i, "kind", e.target.value)}><option>free</option><option>percent</option><option>pickup</option></select></label>
        <label>% envío<input className="inp" type="number" value={z.percent} onChange={(e) => upd(setZones, zones, i, "percent", e.target.value)} /></label>
        <label>Mínimo $<input className="inp" type="number" value={z.min_amount} onChange={(e) => upd(setZones, zones, i, "min_amount", e.target.value)} /></label>
        <label className="md:col-span-2">Condiciones<input className="inp" value={z.conditions || ""} onChange={(e) => upd(setZones, zones, i, "conditions", e.target.value)} /></label>
        <label className="flex gap-1"><input type="checkbox" checked={!!z.cash_on_delivery} onChange={(e) => upd(setZones, zones, i, "cash_on_delivery", e.target.checked)} />Efectivo</label>
        <label className="flex gap-1"><input type="checkbox" checked={!!z.active} onChange={(e) => upd(setZones, zones, i, "active", e.target.checked)} />Activa</label>
        <button className="btn btn-p" onClick={async () => { const { id, ...rest } = z; const r = await api("shipping_zones", "POST", { ...(id ? { id } : {}), ...rest, percent: Number(z.percent), min_amount: Number(z.min_amount) }); r.error ? note(r.error) : (note("Guardado"), load()); }}>Guardar</button>
        {z.id && <button className="btn bg-rose-700" onClick={async () => { if (confirm("¿Eliminar?")) { await api("shipping_zones", "DELETE", z.id); load(); } }}>Eliminar</button>}</div>)}
      <button className="btn glass" onClick={() => setZones([...zones, { name: "", kind: "percent", percent: 5, min_amount: 0, conditions: "", cash_on_delivery: false, active: true }])}>+ AGREGAR LOCALIDAD</button></div>}

    {tab === "orders" && <div className="space-y-3">{orders.map((o) => <div key={o.id} className="glass rounded-xl p-4 text-sm space-y-1">
      <div className="flex justify-between flex-wrap gap-2"><b>Pedido #{o.number} · {new Date(o.created_at).toLocaleString("es-AR")}</b>
        <select className="inp !w-auto" value={o.status} onChange={async (e) => { await api("orders", "POST", { id: o.id, status: e.target.value }); load(); }}>{Object.entries(STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <p>{o.customer?.name} {o.customer?.lastName} · {o.customer?.phone} · {o.customer?.email}</p>
      <p>{o.zone_name} · {o.customer?.address} {o.customer?.barrio}</p>
      <p className="text-mut">{o.items?.map((i: any) => `${i.qty}x ${i.name}`).join(" · ")}</p>
      <p>Pago: <b>{o.payment_method}</b> · Envío {money(o.shipping)} · Total <b>{money(o.total)}</b></p>
      {o.notes && <p className="text-mut">Obs: {o.notes}</p>}
      <label className="text-xs text-mut block">Seguimiento / nota de envío (lo ve el cliente)<input className="inp" defaultValue={o.tracking || ""} placeholder="Ej: Sale hoy 18hs / código de Andreani"
        onBlur={async (e) => { if (e.target.value !== (o.tracking || "")) { await api("orders", "POST", { id: o.id, tracking: e.target.value }); note("Seguimiento guardado"); } }} /></label></div>)}
      {!orders.length && <p className="text-mut">Todavía no hay pedidos.</p>}</div>}

    {tab === "cfg" && <div className="glass rounded-2xl p-5 space-y-3 max-w-xl">
      <p className="text-xs text-mut">whatsapp: número con código de país, ej. 5493415551234 · alias, cbu, titular e instrucciones se muestran al cliente que elige transferencia.</p>
      {cfg.map((r, i) => <label key={r.key} className="text-xs text-mut block">{r.key}<input className="inp" value={r.value || ""} onChange={(e) => upd(setCfg, cfg, i, "value", e.target.value)} /></label>)}
      <button className="btn btn-p" onClick={async () => { for (const r of cfg) await api("settings", "POST", r); note("Guardado"); }}>GUARDAR AJUSTES</button></div>}
  </main>;
}
