"use client";
import { useState } from "react";
export default function Login() {
  const [pw, setPw] = useState(""); const [e, setE] = useState("");
  async function go() {
    const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    r.ok ? (location.href = "/admin") : setE("Clave incorrecta");
  }
  return <main className="min-h-screen grid place-items-center p-6"><div className="glass rounded-2xl p-8 w-full max-w-sm space-y-4">
    <h1 className="text-2xl font-black italic">ALIEN<span className="text-b2">TECH</span> Admin</h1>
    <input className="inp" type="password" placeholder="Clave de administrador" value={pw} onChange={(x) => setPw(x.target.value)} onKeyDown={(x) => x.key === "Enter" && go()} />
    {e && <p className="text-red-400 text-sm">{e}</p>}
    <button className="btn btn-p w-full" onClick={go}>INGRESAR</button></div></main>;
}
