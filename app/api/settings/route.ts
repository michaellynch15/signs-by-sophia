import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) return NextResponse.json({ booking_notice: "July 2026 and beyond" });
  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value;
  return NextResponse.json({ booking_notice: "July 2026 and beyond", ...settings });
}

export async function POST(req: Request) {
  const { key, value } = await req.json();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
