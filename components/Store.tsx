"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, X, Plus, Minus } from "lucide-react";
import { calcShipping, money } from "@/lib/shipping";
const CATS = ["Todos", "Smartphones", "Gaming", "Audio", "Accesorios", "Informática", "Smart Home", "Ofertas"];

export default function Store({ products, zones, settings, mp }: any) {
  const [cat, setCat] = useState("Todos");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [zoneId, setZoneId] = useState<string>(zones[0]?.id);
  const [f, setF] = useState<any>({}); const [pay, setPay] = useState("transferencia");
  const [busy, setBusy] = useState(false); const [done, setDone] = useState<any>(null); const [err, setErr] = useState("");
  useEffect(() => { try { setCart(JSON.parse(localStorage.getItem("cart") || "{}")); } catch {} }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  const items = Object.entries(cart).map(([id, q]) => ({ p: products.find((x: any) => x.id === id), q })).filter((x) => x.p);
  const sub = items.reduce((a, x) => a + x.p.price * x.q, 0);
  const zone = zones.find((z: any) => z.id === zoneId);
  const ship = calcShipping(sub, zone); const total = sub + ship;
  const count = items.reduce((a, x) => a + x.q, 0);
  const wa = (t: string) => `https://wa.me/${(settings.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(t)}`;
  const list = products.filter((p: any) => cat === "Todos" || p.category === cat || (cat === "Ofertas" && p.on_offer && p.old_price > p.price));
  const add = (p: any) => { setCart((c) => ({ ...c, [p.id]: Math.min((c[p.id] || 0) + 1, p.stock) })); setOpen(true); };
  const chg = (id: string, d: number, max: number) => setCart((c) => { const n = Math.min((c[id] || 0) + d, max); const r = { ...c }; n <= 0 ? delete r[id] : (r[id] = n); return r; });

  async function submit() {
    setErr(""); setBusy(true);
    const r = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer: f, items: items.map((x) => ({ id: x.p.id, qty: x.q })), zoneId, payment: pay, notes: f.notes }) });
    const j = await r.json();
    if (!r.ok) { setBusy(false); return setErr(j.error || "Error"); }
    setCart({}); if (j.mp) { location.href = j.mp; return; } setBusy(false); setDone(j);
  }

  return <main>
    <header className="sticky top-0 z-20 flex items-center justify-between px-[5vw] py-3 bg-ink/70 backdrop-blur border-b border-b2/20">
      <span className="font-black italic text-xl tracking-wide">ALIEN<span className="text-b2">TECH</span></span>
      <button onClick={() => setOpen(true)} className="glass rounded-full px-4 py-2 flex gap-2 items-center text-sm font-semibold"><ShoppingBag size={16} />Carrito<span className="bg-b1 rounded-full px-2 text-xs">{count}</span></button>
    </header>

    <section className="grid md:grid-cols-[1.1fr_.9fr] gap-6 items-center px-[5vw] pt-10 pb-8 min-h-[78vh]">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
        <p className="text-b3 tracking-[3px] text-xs font-bold">TECNOLOGÍA SIN LÍMITES · ROSARIO</p>
        <h1 className="text-4xl md:text-7xl font-black leading-[1.02] tracking-tight my-4">LA TECNOLOGÍA<br />QUE BUSCÁS.<br /><span className="bg-gradient-to-r from-b1 to-b3 bg-clip-text text-transparent">AL PRECIO QUE ESPERÁS.</span></h1>
        <p className="text-mut max-w-lg leading-relaxed">Descubrí productos tecnológicos increíbles con precios competitivos y atención personalizada.</p>
        <div className="flex gap-3 my-7 flex-wrap">
          <a href="#catalogo" className="btn btn-p">EXPLORAR PRODUCTOS</a>
          <a href="#catalogo" onClick={() => setCat("Ofertas")} className="btn glass">VER OFERTAS</a></div>
      </motion.div>
      <motion.div className="relative grid place-items-center" animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity }}>
        <div className="absolute w-4/5 aspect-square rounded-full bg-b2/40 blur-3xl" />
        <Image src="/alien.png" alt="Mascota ALIENTECH" width={520} height={540} priority className="relative drop-shadow-[0_0_40px_rgba(18,107,255,.6)]" />
      </motion.div>
    </section>

    <section id="catalogo" className="px-[5vw] py-12">
      <h2 className="text-3xl font-black mb-5">Catálogo <span className="text-b2">ALIENTECH</span></h2>
      <div className="flex gap-2 flex-wrap mb-6">{CATS.map((c) => <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm border ${cat === c ? "bg-b1 border-b2 shadow-[0_0_20px_rgba(18,107,255,.5)]" : "glass"}`}>{c}</button>)}</div>
      {!list.length && <p className="text-mut">Todavía no hay productos en esta categoría.</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
        {list.map((p: any) => { const off = p.on_offer && p.old_price > p.price; const img = p.main_image || p.images?.[0];
          return <motion.div key={p.id} whileHover={{ y: -6 }} className="glass rounded-2xl p-3 relative">
            {off && <span className="absolute top-5 left-5 z-10 bg-rose-500 text-[11px] font-extrabold px-2 py-1 rounded-lg">OFERTA -{Math.round((1 - p.price / p.old_price) * 100)}%</span>}
            <div className="relative h-44 rounded-xl overflow-hidden bg-ink2 mb-3 grid place-items-center">
              {img ? <Image src={img} alt={p.name} fill sizes="260px" className="object-cover" /> : <span className="text-mut text-xs tracking-widest uppercase">{p.category}</span>}</div>
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-mut text-sm line-clamp-2 min-h-[40px]">{p.description}</p>
            <div className="text-2xl font-black mt-2">{money(p.price)}{off && <span className="text-mut text-sm line-through font-normal ml-2">{money(p.old_price)}</span>}</div>
            {p.free_shipping && <p className="text-b3 text-xs mb-3">Envío gratis en Rosario</p>}
            <div className="flex gap-2">
              {p.stock > 0 ? <button onClick={() => add(p)} className="btn btn-p flex-1">AGREGAR</button>
                : <a href={wa(`Consulto disponibilidad de ${p.name}`)} target="_blank" className="btn glass flex-1 text-center">CONSULTAR DISPONIBILIDAD</a>}
              {p.stock > 0 && <a href={wa(`Hola! Consulto por ${p.name}`)} target="_blank" className="btn border border-green-600 text-green-400 bg-green-950">WhatsApp</a>}
            </div></motion.div>; })}
      </div>
    </section>

    <footer className="text-center text-mut text-sm py-10 border-t border-b2/20">© {new Date().getFullYear()} ALIENTECH · Rosario, Santa Fe · <a href="/pedido" className="text-b3">Seguir mi pedido</a></footer>

    {open && <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}
    <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-ink2 border-l border-b2/20 z-50 p-5 overflow-y-auto transition-transform ${open ? "" : "translate-x-full"}`}>
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-black">{done ? "¡Pedido recibido!" : "Tu carrito"}</h2><button onClick={() => { setOpen(false); setDone(null); }}><X /></button></div>
      {done ? <div className="space-y-4">
        <p>Pedido <b className="text-b3">#{done.number}</b> por <b>{money(done.total)}</b>.</p>
        {pay === "transferencia" && <div className="glass rounded-xl p-4 text-sm space-y-1 border-b1">
          <p className="font-bold">Datos para transferir</p><p>Alias: <b>{settings.alias}</b></p><p>CBU: <b>{settings.cbu}</b></p><p>Titular: <b>{settings.titular}</b></p><p className="text-mut">{settings.instrucciones}</p></div>}
        <a href={done.wa} target="_blank" className="btn btn-p block text-center">ENVIAR PEDIDO POR WHATSAPP</a>
        <a href={`/pedido?n=${done.number}`} className="btn glass block text-center">SEGUIR MI PEDIDO</a></div>
      : !items.length ? <p className="text-mut">Tu carrito está vacío.</p> : <div className="space-y-3">
        {items.map(({ p, q }) => <div key={p.id} className="flex justify-between items-center border-b border-b2/20 pb-2 text-sm gap-2">
          <span>{p.name}<br /><span className="text-mut">{money(p.price)}</span></span>
          <span className="flex items-center gap-2"><button onClick={() => chg(p.id, -1, p.stock)} className="glass rounded-lg p-1"><Minus size={14} /></button>{q}<button onClick={() => chg(p.id, 1, p.stock)} className="glass rounded-lg p-1"><Plus size={14} /></button></span></div>)}
        <label className="text-xs text-mut">Localidad / entrega</label>
        <select className="inp" value={zoneId} onChange={(e) => { setZoneId(e.target.value); setPay("transferencia"); }}>{zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}{z.kind === "free" ? " — envío gratis" : z.kind === "pickup" ? " — sin costo" : ` — ${z.percent}%`}</option>)}</select>
        {zone?.conditions && <p className="text-xs text-mut">{zone.conditions}</p>}
        <div className="grid grid-cols-2 gap-2">{[["name", "Nombre"], ["lastName", "Apellido"], ["phone", "Teléfono"], ["email", "Email"]].map(([k, l]) => <input key={k} className="inp" placeholder={l} value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}</div>
        {zone?.kind !== "pickup" && <><input className="inp" placeholder="Dirección" value={f.address || ""} onChange={(e) => setF({ ...f, address: e.target.value })} />
          <input className="inp" placeholder="Barrio" value={f.barrio || ""} onChange={(e) => setF({ ...f, barrio: e.target.value })} /></>}
        <textarea className="inp" placeholder="Observaciones" value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <div className="space-y-2 text-sm">
          <label className="glass rounded-xl p-3 flex gap-2 border-b1"><input type="radio" checked={pay === "transferencia"} onChange={() => setPay("transferencia")} /><span><b>Transferencia bancaria</b> (recomendado)</span></label>
          {mp ? <label className="glass rounded-xl p-3 flex gap-2"><input type="radio" checked={pay === "mercadopago"} onChange={() => setPay("mercadopago")} />Tarjetas / Mercado Pago</label>
            : <label className="glass rounded-xl p-3 flex gap-2 opacity-50"><input type="radio" disabled />Tarjetas — próximamente</label>}
          {zone?.cash_on_delivery && <label className="glass rounded-xl p-3 flex gap-2"><input type="radio" checked={pay === "efectivo"} onChange={() => setPay("efectivo")} />Efectivo contra entrega</label>}</div>
        <div className="text-sm text-mut space-y-1"><p className="flex justify-between"><span>Subtotal</span><span>{money(sub)}</span></p>
          <p className="flex justify-between"><span>Envío</span><span>{ship ? money(ship) : "GRATIS"}</span></p>
          <p className="flex justify-between text-xl font-black text-white"><span>Total</span><span>{money(total)}</span></p></div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button disabled={busy} onClick={submit} className="btn btn-p w-full">{busy ? "ENVIANDO..." : pay === "transferencia" ? "TRANSFERIR AHORA" : pay === "mercadopago" ? "PAGAR CON MERCADO PAGO" : "CONFIRMAR PEDIDO"}</button></div>}
    </aside>
  </main>;
}
