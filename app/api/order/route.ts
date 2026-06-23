import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { appendOrderToSheet } from "@/lib/sheets";

type OrderBody = Record<string, unknown>;

function buildEmailBody(product: string, body: OrderBody): string {
  const lines: string[] = [
    `New Order — Signs by Sophia`,
    `=`.repeat(40),
    ``,
    `Product:  ${product}`,
    ``,
  ];

  const skip = new Set(["product", "name", "email", "phone", "instagram"]);

  const labels: Record<string, string> = {
    occasion: "Occasion",
    size: "Size",
    customSize: "Custom size",
    quantity: "Quantity",
    addOns: "Add-ons",
    nameOnItem: "Name/text on item",
    nameOnBanner: "Name on banner",
    bannerText: "Banner text",
    theme: "Theme",
    colors: "Colors",
    text: "Banner text (general)",
    dueDate: "Needed by",
    eventDate: "Event date",
    delivery: "Delivery",
    shippingAddress: "Ship to",
    notes: "Notes",
    otherNotes: "Other notes",
    jeanStyle: "Jean style",
    placement: "Placement",
    textToPaint: "Text to paint",
    schoolName: "School",
    graduationYear: "Grad year",
    addFloral: "Floral accents",
    addGlitter: "Glitter paint",
    toteStyle: "Tote style",
    toteSize: "Tote size",
  };

  for (const [key, label] of Object.entries(labels)) {
    if (skip.has(key)) continue;
    const val = body[key];
    if (val === undefined || val === null || val === "" || val === false) continue;
    const display = Array.isArray(val) ? (val as string[]).join(", ") : String(val);
    lines.push(`${label.padEnd(16)} ${display}`);
  }

  lines.push(``, `— Contact —`);
  lines.push(`Name:  ${body.name}`);
  lines.push(`Email: ${body.email}`);
  if (body.phone) lines.push(`Phone: ${body.phone}`);
  if (body.instagram) lines.push(`Instagram: ${body.instagram}`);

  return lines.join("\n");
}

function validate(body: OrderBody): string | null {
  const product = body.product as string;
  if (!product) return "Missing product";
  if (!body.name) return "Missing contact info";

  if (product === "banner") {
    const hasText = body.bannerText || body.nameOnBanner || body.nameOnItem;
    const hasDate = body.eventDate || body.dueDate;
    if (!hasText || !hasDate) return "Missing required banner fields";
  } else if (product === "senior-jeans") {
    const hasText = body.textToPaint || body.nameOnItem;
    const hasDate = body.eventDate || body.dueDate;
    if (!hasText || !hasDate) return "Missing required jeans fields";
  } else if (product === "tote-bag") {
    const hasText = body.textToPaint || body.nameOnItem;
    const hasDate = body.eventDate || body.dueDate;
    if (!hasText || !hasDate) return "Missing required tote fields";
  }

  return null;
}

function toRow(body: OrderBody) {
  const str = (k: string) => (body[k] ? String(body[k]) : null);
  const arr = (k: string) =>
    Array.isArray(body[k]) ? (body[k] as string[]).join(", ") : str(k);

  return {
    product: str("product"),
    status: "new",
    name: str("name"),
    email: str("email"),
    phone: str("phone"),
    instagram: str("instagram"),
    event_date: str("eventDate"),
    due_date: str("dueDate"),
    size: str("size"),
    delivery: str("delivery"),
    shipping_address: str("shippingAddress"),
    theme: str("theme"),
    colors: str("colors"),
    banner_text: str("bannerText") ?? str("nameOnBanner") ?? str("nameOnItem"),
    other_notes: str("otherNotes") ?? str("notes"),
    jean_style: str("jeanStyle"),
    placement: str("placement"),
    text_to_paint: str("textToPaint"),
    school_name: str("schoolName"),
    graduation_year: str("graduationYear"),
    tote_style: str("toteStyle"),
    tote_size: str("toteSize"),
    quantity: str("quantity"),
    add_ons: arr("addOns"),
  };
}

const PRODUCT_LABELS: Record<string, string> = {
  banner: "Banner",
  "senior-jeans": "Senior Jeans",
  "tote-bag": "Tote Bag",
};

export async function POST(req: NextRequest) {
  try {
    const body: OrderBody = await req.json();

    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const product = body.product as string;
    const productLabel = PRODUCT_LABELS[product] || product;

    // Save to Supabase
    const { data: insertedRows, error: dbError } = await supabase
      .from("signs_by_sophia_orders")
      .insert(toRow(body))
      .select();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    // Append to Google Sheet (non-blocking)
    if (!dbError && insertedRows?.[0]) {
      appendOrderToSheet(insertedRows[0]).catch((err) => {
        console.error("Sheet append error:", err);
      });
    }

    // Send notification email
    const emailText = buildEmailBody(productLabel, body);

    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Signs by Sophia <hello@echelonmade.com>",
          to: [process.env.SOPHIA_EMAIL || "sophia@signsbysophia.com"],
          reply_to: body.email as string,
          subject: `New ${productLabel} order from ${body.name}`,
          text: emailText,
        }),
      });

      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    } else {
      console.log("ORDER (no Resend key):\n", emailText);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
