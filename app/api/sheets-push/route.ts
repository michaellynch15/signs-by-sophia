import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { pushAllOrdersToSheet } from "@/lib/sheets";

export async function POST() {
  const { data, error } = await supabase
    .from("signs_by_sophia_orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data?.length) {
    return NextResponse.json({ error: "No orders in dashboard — sync blocked to protect your sheet." }, { status: 400 });
  }

  await pushAllOrdersToSheet(data as Record<string, unknown>[]);
  return NextResponse.json({ ok: true, count: data.length });
}
