import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateOrderPriceInSheet } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { orderId, amount, note } = await req.json();

  if (!orderId || !amount) {
    return NextResponse.json({ error: "Missing orderId or amount" }, { status: 400 });
  }

  const { error } = await supabase
    .from("signs_by_sophia_orders")
    .update({
      invoice_amount: Number(amount),
      invoice_note: note || null,
      invoice_sent_at: new Date().toISOString(),
      status: "invoiced",
    })
    .eq("id", orderId);

  if (error) {
    console.error("Invoice save error:", error);
    return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
  }

  // Update price in Google Sheet (non-blocking)
  const { data: order } = await supabase
    .from("signs_by_sophia_orders")
    .select("name")
    .eq("id", orderId)
    .single();

  if (order?.name) {
    updateOrderPriceInSheet(order.name, Number(amount)).catch((e) =>
      console.error("Sheet price update failed:", e)
    );
  }

  return NextResponse.json({ ok: true, url: `/invoice/${orderId}` });
}
