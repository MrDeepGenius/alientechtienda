import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { makeToken } from "@/lib/auth";
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password || !process.env.ADMIN_PASSWORD || !same(String(password), process.env.ADMIN_PASSWORD)) return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set("at", await makeToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 86400 });
  return r;
}
