"use client";
import { useEffect, useState } from "react";
import { STATUS, money } from "@/lib/shipping";
const FLOW = ["pago_pendiente", "pago_confirmado", "preparando", "en_camino", "entregado"];
export default function Pedido() {
  const [n, setN] = useState(""); const [phone, setPhone] = useState(""); const [o, setO] = useState<any>(null); const [e, setE] = useState("");
  useEffect(() => { const q = new URLSearchParams(location.search).get("n"); if (q) setN(q); }, []);
  async function go() {
    setE(""); setO(null);
    const r = await fetch(`/api/track?n=${encodeURIComponent(n)}&phone=${encodeURIComponent(phone)}`); const j = await r.json();
    r.ok ? setO(j) : setE(j.error || "Error");
  }
  const idx = o ? (o.status === "pendiente" ? 1 : FLOW.indexOf(o.status)) : -1;
  return <main className="min-h-screen p-6 grid place-items-start justify-center"><div className="w-full max-w-lg space-y-4 mt-10">
    <a href="/" className="text-b3 text-sm">← Volver a la tienda</a>
    <h1 className="text-2xl font-black italic">Seguí tu <span className="text-b2">pedido</span></h1>
    <div className="glass rounded-2xl p-5 space-y-3">
      <input className="inp" inputMode="numeric" placeholder="Número de pedido" value={n} onChange={(x) => setN(x.target.value)} />
      <input className="inp" inputMode="tel" placeholder="Teléfono con el que compraste" value={phone} onChange={(x) => setPhone(x.target.value)} onKeyDown={(x) => x.key === "Enter" && go()} />
      {e && <p className="text-red-400 text-sm">{e}</p>}
      <button className="btn btn-p w-full" onClick={go}>BUSCAR</button></div>
    {o && <div className="glass rounded-2xl p-5 space-y-3 text-sm">
      <p className="flex justify-between"><b>Pedido #{o.number}</b><span className="text-mut">{new Date(o.created_at).toLocaleDateString("es-AR")}</span></p>
      {o.status === "cancelado" ? <p className="text-rose-400 font-bold">Pedido cancelado</p> :
        <ol className="space-y-2">{FLOW.map((k, i) => <li key={k} className={`flex items-center gap-3 ${i <= idx ? "text-white" : "text-mut"}`}>
          <span className={`w-3 h-3 rounded-full ${i <= idx ? "bg-b3 shadow-[0_0_10px_#00E5FF]" : "border border-mut"}`} />{STATUS[k]}</li>)}</ol>}
      {o.tracking && <p className="glass rounded-xl p-3"><b>Seguimiento / envío:</b> {o.tracking}</p>}
      <p className="text-mut">{o.items?.map((i: any) => `${i.qty}x ${i.name}`).join(" · ")}</p>
      <p>{o.zone_name} · Envío {o.shipping ? money(o.shipping) : "GRATIS"} · Total <b>{money(o.total)}</b></p></div>}
  </div></main>;
}
