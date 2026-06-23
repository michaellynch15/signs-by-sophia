import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Signs By Sophia — Invoice",
    description: "Thanks for your order! Here's your invoice link.",
    openGraph: {
      title: "Signs By Sophia Invoice",
      description: "Thanks for your order! Here's your invoice link.",
      siteName: "Signs by Sophia",
    },
  };
}

const PRODUCT_LABELS: Record<string, string> = {
  banner: "Custom Brown Paper Banner",
  "senior-jeans": "Custom Senior Jeans",
  "tote-bag": "Custom Tote Bag",
};

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: order } = await supabase
    .from("signs_by_sophia_orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order || !order.invoice_amount) notFound();

  const amount = Number(order.invoice_amount);
  const shortId = id.slice(0, 8).toUpperCase();
  const productLabel = PRODUCT_LABELS[order.product] ?? order.product;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const venmoLink = `https://venmo.com/u/Sophia-Lynch-25?txn=pay&amount=${amount}&note=${encodeURIComponent(`Signs by Sophia #${shortId}`)}`;
  const cashAppLink = `https://cash.app/$SignsbySophia/${amount}`;

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-10"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 60%, #FDE4CC 100%)", fontFamily: "var(--font-nunito), sans-serif" }}
    >
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="font-script text-4xl mb-1" style={{ color: "#D4437A" }}>Signs by Sophia</p>
          <p className="font-display text-xs font-bold tracking-widest uppercase" style={{ color: "#9A607A" }}>
            Custom hand-painted banners · Norman, OK
          </p>
        </div>

        {/* Invoice card */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: "white" }}>

          {/* Pink top stripe */}
          <div className="h-2" style={{ background: "linear-gradient(90deg, #D4437A, #F2A7C3, #D4437A)" }} />

          <div className="px-6 py-6">

            {/* Invoice meta */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "#C4889A" }}>Invoice for</p>
                <p className="font-display font-bold text-base" style={{ color: "#3A2A1E" }}>{order.name}</p>
                {order.phone && <p className="font-display text-xs" style={{ color: "#8A5070" }}>{order.phone}</p>}
                {order.instagram && <p className="font-display text-xs" style={{ color: "#8A5070" }}>@{order.instagram.replace(/^@/, "")}</p>}
              </div>
              <div className="text-right">
                <p className="font-display text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: "#C4889A" }}>Date</p>
                <p className="font-display text-xs" style={{ color: "#3D1830" }}>{dateStr}</p>
                <p className="font-display text-xs font-mono mt-1" style={{ color: "#C4889A" }}>#{shortId}</p>
              </div>
            </div>

            <hr style={{ borderColor: "#F0E4D4", borderStyle: "dashed" }} />

            {/* Order details */}
            <div className="py-4 space-y-2">
              <p className="font-display text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#C4889A" }}>Order</p>
              <p className="font-display font-bold text-sm" style={{ color: "#3A2A1E" }}>{productLabel}</p>
              {order.banner_text && <DetailRow k="Text" v={order.banner_text} />}
              {order.size && <DetailRow k="Size" v={order.size} />}
              {order.event_date && <DetailRow k="Event date" v={order.event_date} />}
              {order.delivery && <DetailRow k="Delivery" v={order.delivery === "pickup" ? "Local pickup — Norman, OK" : "Shipping"} />}
              {order.invoice_note && (
                <p className="font-display text-xs mt-2 pt-2 border-t" style={{ color: "#6B3058", borderColor: "#F0E4D4" }}>
                  {order.invoice_note}
                </p>
              )}
            </div>

            <hr style={{ borderColor: "#F0E4D4", borderStyle: "dashed" }} />

            {/* Amount */}
            <div className="py-5 text-center">
              <p className="font-display text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#C4889A" }}>Total due</p>
              <p className="font-display font-bold" style={{ fontSize: 48, color: "#D4437A", lineHeight: 1 }}>
                ${amount % 1 === 0 ? amount : amount.toFixed(2)}
              </p>
            </div>

            {/* Payment buttons */}
            <div className="space-y-3">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-center mb-3" style={{ color: "#C4889A" }}>Pay with</p>
              <a
                href={venmoLink}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-display font-bold text-base text-white shadow-md active:scale-[0.98] transition-transform"
                style={{ background: "#3D95CE" }}
              >
                <VenmoIcon />
                Pay with Venmo
              </a>
              <a
                href={cashAppLink}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-display font-bold text-base text-white shadow-md active:scale-[0.98] transition-transform"
                style={{ background: "#00C244" }}
              >
                <CashAppIcon />
                Pay with Cash App
              </a>
            </div>

            {/* Fine print */}
            <p className="font-display text-xs text-center mt-5 leading-relaxed" style={{ color: "#9A607A" }}>
              Payment secures your spot. Questions? Text or DM{" "}
              <a href="tel:4052431461" className="font-bold" style={{ color: "#D4437A" }}>405-243-1461</a>
            </p>
          </div>

          {/* Bottom stripe */}
          <div className="h-2" style={{ background: "linear-gradient(90deg, #D4437A, #F2A7C3, #D4437A)" }} />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="font-display text-xs" style={{ color: "#C4889A" }}>@signsby.sophia</p>
          <Link href="/" className="font-display text-xs" style={{ color: "#C4889A" }}>signsbysophia.com</Link>
        </div>

      </div>
    </main>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <p className="font-display text-xs" style={{ color: "#6B3058" }}>
      <span style={{ color: "#C4889A" }}>{k}:</span> {v}
    </p>
  );
}

function VenmoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M19.5 2c.7 1.2 1 2.4 1 3.9 0 4.9-4.2 11.2-7.6 15.7h-5.2L4.5 2.6l5.2-.5 1.9 7.5C12.9 7.5 15 4.2 15 2z"/>
    </svg>
  );
}

function CashAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M14.5 9.5c-.3-.8-1-1.5-2.5-1.5-1.4 0-2 .6-2 1.3 0 .8.7 1.1 2 1.4 2 .5 3.5 1.2 3.5 3 0 1.7-1.3 2.8-3 3V18h-2v-1.3c-1.6-.2-3-1.2-3.3-2.7l1.8-.5c.2.9 1 1.5 2.2 1.5 1.3 0 2.1-.6 2.1-1.4 0-.8-.6-1.1-2-1.5-1.9-.5-3.4-1.2-3.4-3 0-1.5 1.2-2.7 2.8-3V5h2v1.2c1.5.3 2.6 1.2 2.9 2.5z"/>
    </svg>
  );
}
