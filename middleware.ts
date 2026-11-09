import { NextRequest, NextResponse } from "next/server";
import { checkToken } from "@/lib/auth";
export async function middleware(req: NextRequest) {
  if (await checkToken(req.cookies.get("at")?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
