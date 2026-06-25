import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { appendOrderToSheet } from "@/lib/sheets";

type OrderBody = Record<string, unknown>;

function buildEmailHtml(product: string, body: OrderBody): string {
  const photos = (body.photos as string[]) ?? [];
  const field = (label: string, val: unknown) =>
    val ? `<tr><td style="padding:4px 12px 4px 0;color:#9A607A;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:4px 0;font-size:13px;color:#3A2A1E">${String(val)}</td></tr>` : "";

  const photoHtml = photos.length
    ? `<div style="margin-top:20px"><p style="font-size:12px;font-weight:700;color:#9A607A;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px">Inspiration photos</p><div style="display:flex;flex-wrap:wrap;gap:8px">${photos.map(url => `<a href="${url}" target="_blank"><img src="${url}" width="120" height="120" style="object-fit:cover;border-radius:8px;display:block" /></a>`).join("")}</div></div>`
    : "";

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FFF8F0;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(90deg,#D4437A,#F2A7C3,#D4437A);height:6px"></div>
    <div style="padding:28px 32px">
      <p style="font-size:22px;color:#D4437A;margin:0 0 4px;font-style:italic">Signs by Sophia</p>
      <p style="font-size:18px;font-weight:700;color:#3A2A1E;margin:0 0 20px">New ${product} order from ${body.name}</p>
      <table style="border-collapse:collapse;width:100%">
        ${field("Event date", body.eventDate)}
        ${field("Theme", body.theme)}
        ${field("Exact wording", body.bannerText)}
        ${field("Size", body.size)}
        ${field("Delivery", body.delivery)}
        ${field("Ship to", body.shippingAddress)}
        ${field("Other notes", body.otherNotes)}
      </table>
      <hr style="border:none;border-top:1px solid #F0E4D4;margin:20px 0" />
      <table style="border-collapse:collapse;width:100%">
        ${field("Name", body.name)}
        ${field("Phone", body.phone)}
        ${field("Email", body.email)}
        ${field("Instagram", body.instagram ? `@${String(body.instagram).replace(/^@/, "")}` : null)}
      </table>
      ${photoHtml}
      <div style="margin-top:24px;text-align:center">
        <a href="https://www.signsbysophia.com/dashboard" style="display:inline-block;background:#D4437A;color:white;font-weight:700;font-size:14px;padding:12px 28px;border-radius:999px;text-decoration:none">Open Dashboard</a>
      </div>
    </div>
    <div style="background:linear-gradient(90deg,#D4437A,#F2A7C3,#D4437A);height:6px"></div>
  </div>
</body></html>`;
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
    const row = { ...toRow(body), photos: (body.photos as string[]) ?? [] };
    const { data: insertedRows, error: dbError } = await supabase
      .from("signs_by_sophia_orders")
      .insert(row)
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
    const emailHtml = buildEmailHtml(productLabel, body);

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
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    } else {
      console.log("ORDER (no Resend key):\n", emailHtml);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
