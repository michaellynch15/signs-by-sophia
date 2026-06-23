import { NextResponse } from "next/server";
import { readSheetRows } from "@/lib/sheets";

export async function GET() {
  const rows = await readSheetRows();
  return NextResponse.json({ headers: rows[0] ? Object.keys(rows[0]) : [], sample: rows[0] ?? null });
}
