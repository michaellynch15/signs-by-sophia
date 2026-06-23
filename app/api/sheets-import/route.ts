import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readSheetRowsWithFormatting } from "@/lib/sheets";

// Generates the same UUID every time for the same row — prevents duplicates on re-import.
async function stableId(row: Record<string, string>): Promise<string> {
  const orderNum = row["ORDER NUMBER"]?.trim();
  if (orderNum) return orderNum;

  const key = [
    row["Name"]?.trim().toLowerCase(),
    row["Date Ordered"]?.trim().toLowerCase(),
    row["Due Date"]?.trim().toLowerCase(),
    row["Size"]?.trim().toLowerCase(),
  ].join("|");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

async function rowToSupabase(row: Record<string, string>, isPink: boolean): Promise<Record<string, unknown>> {
  const rawPrice = row["Price"]?.trim() ?? "";
  const isPaid = /paid/i.test(rawPrice) || /paid/i.test(row["Payment Method"] ?? "");
  const priceNum = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || null;

  const status = isPink ? "complete" : isPaid ? "paid" : "new";

  return {
    id: await stableId(row),
    status,
    product: "banner",
    name: row["Name"]?.trim() || null,
    price: rawPrice || null,
    payment_method: row["Payment Method"]?.trim() || null,
    delivery: row["Delivery Method"]?.trim() || null,
    due_date: row["Due Date"]?.trim() || null,
    size: row["Size"]?.trim() || null,
    invoice_amount: priceNum,
    date_ordered: row["Date Ordered"]?.trim() || null,
  };
}

export async function POST() {
  try {
    const rowsWithFormatting = await readSheetRowsWithFormatting();
    if (rowsWithFormatting.length === 0) return NextResponse.json({ ok: true, count: 0 });

    const records = await Promise.all(
      rowsWithFormatting
        .filter(({ row }) => row["Name"]?.trim())
        .map(({ row, isPink }) => rowToSupabase(row, isPink))
    );

    // Handle duplicate IDs by hashing in a counter to produce a new valid UUID
    const seen = new Map<string, number>();
    const unique = await Promise.all(records.map(async r => {
      const baseId = r.id as string;
      const count = seen.get(baseId) ?? 0;
      seen.set(baseId, count + 1);
      if (count === 0) return r;
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${baseId}|${count}`));
      const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      const newId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
      return { ...r, id: newId };
    }));

    const { error } = await supabase
      .from("signs_by_sophia_orders")
      .upsert(unique, { onConflict: "id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, count: records.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
