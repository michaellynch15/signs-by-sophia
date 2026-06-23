import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { appendOrderToSheet } from "@/lib/sheets";

export async function GET() {
  const { data, error } = await supabase
    .from("signs_by_sophia_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = crypto.randomUUID();
  const record = { id, product: "banner", status: "new", ...body };

  const { error } = await supabase.from("signs_by_sophia_orders").insert(record);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try { await appendOrderToSheet(record); } catch (e) { console.error("Sheet append failed:", e); }

  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  const { id, ...updates } = await req.json();
  const { error } = await supabase
    .from("signs_by_sophia_orders")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase
    .from("signs_by_sophia_orders")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
