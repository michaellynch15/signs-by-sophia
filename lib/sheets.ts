import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Matches Sophia's existing sheet columns exactly
const HEADERS = ["Name", "Date Ordered", "Due Date", "Size", "Price", "Payment Method", "Delivery Method"];
const APPEND_RANGE = "A:G";

const PRODUCT_LABELS: Record<string, string> = {
  banner: "Banner",
  "senior-jeans": "Senior Jeans",
  "tote-bag": "Tote Bag",
};

function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function fmt(v: unknown): string {
  return v != null ? String(v) : "";
}

function fmtDate(v: unknown): string {
  if (!v) return "";
  try {
    return new Date(v as string).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return fmt(v);
  }
}

function orderToRow(order: Record<string, unknown>): string[] {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return [
    fmt(order.name),
    fmt(order.date_ordered) || today,
    fmt(order.event_date ?? order.due_date),
    fmt(order.size),
    order.invoice_amount ? `$${order.invoice_amount}` : "",
    fmt(order.payment_method),
    fmt(order.delivery),
  ];
}

export async function appendOrderToSheet(order: Record<string, unknown>) {
  const sheets = getSheets();

  // values.append finds the next row on Google's side atomically. The previous
  // version read column A to compute a row index, then wrote to it separately —
  // two concurrent orders could both read the same "last row" and the second
  // write would silently overwrite the first's data instead of erroring, which
  // is how 14 orders went missing from the sheet over two months with zero logs.
  const { data: a1 } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "A1",
  });

  if (!a1.values?.length) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: APPEND_RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [HEADERS] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: APPEND_RANGE,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [orderToRow(order)] },
  });
}

export async function readSheetRows(): Promise<Record<string, string>[]> {
  const rows = await readSheetRowsWithFormatting();
  return rows.map(r => r.row);
}

export async function readSheetRowsWithFormatting(): Promise<{ row: Record<string, string>; isPink: boolean }[]> {
  const sheets = getSheets();
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    ranges: ["A:G"],
    includeGridData: true,
  });

  const gridData = data.sheets?.[0]?.data?.[0];
  if (!gridData?.rowData?.length) return [];

  const allRows = gridData.rowData;
  if (allRows.length < 2) return [];

  const headers = (allRows[0].values ?? []).map(c => c.formattedValue ?? "");

  return allRows.slice(1).map(rowData => {
    const values = rowData.values ?? [];
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i]?.formattedValue ?? ""; });

    // Pink rows: red channel high, green+blue clearly lower (catches any shade of pink/rose)
    const bg = values[0]?.effectiveFormat?.backgroundColor;
    const isPink = bg
      ? (bg.red ?? 0) > 0.8 && (bg.green ?? 0) < 0.85
      : false;

    return { row, isPink };
  });
}

export async function updateOrderPriceInSheet(name: string, amount: number) {
  const sheets = getSheets();

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "A:E",
  });

  const rows = data.values ?? [];
  // Find the last row matching this name where column E (price) is still empty
  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    const rowName = (rows[i][0] ?? "").trim().toLowerCase();
    const hasPrice = !!(rows[i][4] ?? "").trim();
    if (rowName === name.trim().toLowerCase() && !hasPrice) targetRow = i;
  }

  if (targetRow === -1) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `E${targetRow + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[`$${amount}`]] },
  });
}

export async function pushAllOrdersToSheet(orders: Record<string, unknown>[]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: "A:P",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "A1",
    valueInputOption: "RAW",
    requestBody: { values: [HEADERS, ...orders.map(orderToRow)] },
  });
}
