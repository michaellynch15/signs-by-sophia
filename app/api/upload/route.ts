import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  if (!files.length) return NextResponse.json({ urls: [] });

  const urls: string[] = [];

  for (const file of files.slice(0, 10)) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("order-photos")
      .upload(filename, buffer, { contentType: file.type });

    if (error) { console.error("Upload error:", error); continue; }

    const { data } = supabase.storage.from("order-photos").getPublicUrl(filename);
    urls.push(data.publicUrl);
  }

  return NextResponse.json({ urls });
}
