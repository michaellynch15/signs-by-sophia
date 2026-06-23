import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Called by Google Apps Script when a row is edited in the sheet.
// Maps editable sheet columns back to Supabase and upserts.
const EDITABLE_COLS: Record<string, string> = {
  Status: "status",
  Notes: "other_notes",
  "Invoice Amount": "invoice_amount",
};

export async function POST(req: NextRequest) {
  try {
    const row = await req.json();
    const id = row["ID"];
    if (!id) return NextResponse.json({ error: "No ID" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    for (const [col, dbCol] of Object.entries(EDITABLE_COLS)) {
      if (row[col] === undefined) continue;
      if (dbCol === "invoice_amount") {
        const val = String(row[col]).replace("$", "").trim();
        updates[dbCol] = val ? Number(val) : null;
      } else {
        updates[dbCol] = row[col] || null;
      }
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

    const { error } = await supabase
      .from("signs_by_sophia_orders")
      .update(updates)
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
