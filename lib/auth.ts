const enc = new TextEncoder();
async function sig(s: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(process.env.ADMIN_SECRET!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const b = await crypto.subtle.sign("HMAC", k, enc.encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
export async function makeToken() { const exp = String(Date.now() + 7 * 864e5); return exp + "." + (await sig(exp)); }
export async function checkToken(t?: string) {
  if (!t) return false; const [exp, s] = t.split(".");
  return Number(exp) > Date.now() && s === (await sig(exp));
}
