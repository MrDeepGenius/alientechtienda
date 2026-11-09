import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { mpEnabled } from "@/lib/mp";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = db();
  const [p, z, st] = await Promise.all([
    s.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
    s.from("shipping_zones").select("*").eq("active", true).order("name"),
    s.from("settings").select("*"),
  ]);
  const settings = Object.fromEntries((st.data || []).map((r: any) => [r.key, r.value]));
  return NextResponse.json({
    products: p.data || [],
    zones: z.data || [],
    settings,
    mp: mpEnabled(),
  });
}
