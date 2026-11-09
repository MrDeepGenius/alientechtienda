import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
export async function POST(req: Request) {
  const fd = await req.formData(); const s = db(); const urls: string[] = [];
  for (const f of fd.getAll("files") as File[]) {
    if (!f.type.startsWith("image/") || f.size > 8e6) continue;
    const ext = ({ "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" } as Record<string, string>)[f.type] || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await s.storage.from("products").upload(path, await f.arrayBuffer(), { contentType: f.type });
    if (!error) urls.push(s.storage.from("products").getPublicUrl(path).data.publicUrl);
  }
  return NextResponse.json({ urls });
}
