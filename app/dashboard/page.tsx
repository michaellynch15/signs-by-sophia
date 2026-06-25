"use client";

import { useEffect, useState, useCallback } from "react";

type Order = {
  id: string;
  created_at: string;
  product: string;
  status: string;
  name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  event_date: string | null;
  due_date: string | null;
  size: string | null;
  delivery: string | null;
  shipping_address: string | null;
  theme: string | null;
  colors: string | null;
  banner_text: string | null;
  other_notes: string | null;
  jean_style: string | null;
  placement: string | null;
  text_to_paint: string | null;
  school_name: string | null;
  graduation_year: string | null;
  tote_style: string | null;
  tote_size: string | null;
  quantity: string | null;
  add_ons: string | null;
  invoice_sent_at: string | null;
  invoice_amount: number | null;
  paid_at: string | null;
  price: string | null;
  payment_method: string | null;
  date_ordered: string | null;
  photos: string[] | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new:      { label: "New",      color: "#D4437A", bg: "#FDE8F0" },
  invoiced: { label: "Invoiced", color: "#9A607A", bg: "#FEF5E8" },
  paid:     { label: "Paid",     color: "#2D9E6B", bg: "#E4F7EF" },
  complete: { label: "Complete", color: "#B0456A", bg: "#FADADD" },
};

const STATUS_ORDER: Record<string, number> = { new: 0, invoiced: 1, paid: 2, complete: 3 };

function parseDate(s: string | null | undefined): number {
  if (!s) return Infinity;
  const lower = s.trim().toLowerCase();

  // Handle "early/mid/late <month>" → approximate day
  const fuzzy = lower.match(/^(early|mid|late)\s+([a-z]+)$/);
  if (fuzzy) {
    const dayMap: Record<string, number> = { early: 5, mid: 15, late: 25 };
    const day = dayMap[fuzzy[1]];
    const d = new Date(`${fuzzy[2]} ${day} 2026`);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  const cleaned = s.trim().replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const withYear = new Date(`${cleaned} 2026`);
  if (!isNaN(withYear.getTime())) return withYear.getTime();
  const plain = new Date(cleaned);
  if (!isNaN(plain.getTime())) return plain.getTime();
  return Infinity;
}

const PRODUCT_LABELS: Record<string, string> = {
  banner:        "Banner",
  "senior-jeans": "Senior Jeans",
  "tote-bag":    "Tote Bag",
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const [days, setDays] = useState<7 | 30 | 90 | null>(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceNote, setInvoiceNote] = useState("");
  const [invoiceLink, setInvoiceLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bookingNotice, setBookingNotice] = useState("July 2026 and beyond");
  const [bookingDraft, setBookingDraft] = useState("July 2026 and beyond");
  const [savingNotice, setSavingNotice] = useState(false);
  const [importing, setImporting] = useState(false);
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const emptyNewOrder = { name: "", date_ordered: "", due_date: "", size: "", price: "", payment_method: "", delivery: "", status: "new", other_notes: "" };
  const [newOrder, setNewOrder] = useState(emptyNewOrder);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    fetch("/api/settings").then(r => r.json()).then(d => {
      setBookingNotice(d.booking_notice ?? "July 2026 and beyond");
      setBookingDraft(d.booking_notice ?? "July 2026 and beyond");
    });
  }, [fetchOrders]);

  async function createOrder() {
    if (!newOrder.name.trim()) return showToast("Name is required");
    setSavingOrder(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newOrder),
    });
    setSavingOrder(false);
    if (res.ok) {
      setNewOrderModal(false);
      setNewOrder(emptyNewOrder);
      fetchOrders();
      showToast("Order created & added to sheet");
    } else {
      const err = await res.json();
      showToast("Failed: " + (err.error ?? "unknown error"));
    }
  }

  async function importFromSheet() {
    if (!confirm("Import orders from Google Sheet? This is read-only — your sheet will not be changed.")) return;
    setImporting(true);
    const res = await fetch("/api/sheets-import", { method: "POST" });
    setImporting(false);
    if (res.ok) {
      const data = await res.json();
      showToast(`Imported ${data.count} order${data.count !== 1 ? "s" : ""} from sheet`);
      fetchOrders();
    } else {
      showToast("Import failed — check console");
    }
  }

  async function saveBookingNotice() {
    setSavingNotice(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "booking_notice", value: bookingDraft }),
    });
    setSavingNotice(false);
    if (res.ok) {
      setBookingNotice(bookingDraft);
      showToast("Booking notice updated");
    } else {
      const err = await res.json();
      showToast("Save failed: " + (err.error ?? "unknown error"));
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}) }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
    showToast("Status updated");
  }

  async function generateInvoice() {
    if (!selected || !invoiceAmount) return;
    setSending(true);
    const res = await fetch("/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: selected.id, amount: invoiceAmount, note: invoiceNote }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      const fullUrl = `${window.location.origin}${data.url}`;
      setInvoiceLink(fullUrl);
      setOrders((prev) => prev.map((o) =>
        o.id === selected.id ? { ...o, status: "invoiced", invoice_amount: Number(invoiceAmount), invoice_sent_at: new Date().toISOString() } : o
      ));
      setSelected((prev) => prev ? { ...prev, status: "invoiced", invoice_amount: Number(invoiceAmount), invoice_sent_at: new Date().toISOString() } : prev);
    } else {
      showToast("Failed to generate invoice");
    }
  }

  async function copyLink() {
    if (!invoiceLink) return;
    await navigator.clipboard.writeText(invoiceLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeInvoiceModal() {
    setInvoiceModal(false);
    setInvoiceLink(null);
    setInvoiceAmount("");
    setInvoiceNote("");
    setCopied(false);
  }

  async function deleteOrder(id: string) {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelected(null);
    setConfirmDelete(false);
    showToast("Order deleted");
  }

  const isComplete = (o: Order) => o.status === "complete";

  const withinPeriod = days
    ? orders.filter((o) => {
        const due = parseDate(o.due_date ?? o.event_date);
        const now = Date.now();
        return due >= now - 24 * 60 * 60 * 1000 && due <= now + days * 24 * 60 * 60 * 1000;
      })
    : orders;

  const filtered = (filter === "all" ? withinPeriod : withinPeriod.filter((o) => o.status === filter))
    .slice()
    .sort((a, b) => {
      const aComplete = isComplete(a);
      const bComplete = isComplete(b);
      // Complete orders always below incomplete
      if (aComplete !== bComplete) return aComplete ? 1 : -1;
      if (!aComplete) {
        // Incomplete: sort by due date ascending, nulls last
        return parseDate(a.due_date ?? a.event_date) - parseDate(b.due_date ?? b.event_date);
      } else {
        // Complete: sort by date ordered ascending, nulls last
        return parseDate(a.date_ordered ?? a.created_at) - parseDate(b.date_ordered ?? b.created_at);
      }
    });

  const counts = {
    all: withinPeriod.length,
    new: withinPeriod.filter((o) => o.status === "new").length,
    invoiced: withinPeriod.filter((o) => o.status === "invoiced").length,
    paid: withinPeriod.filter((o) => o.status === "paid").length,
    complete: withinPeriod.filter((o) => o.status === "complete").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "#F9F4EE", fontFamily: "var(--font-nunito), sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: "rgba(255,248,240,0.97)", borderColor: "#F0D0E0", backdropFilter: "blur(8px)" }}>
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-script text-2xl" style={{ color: "#D4437A" }}>Signs by Sophia</a>
            <span style={{ color: "#E8B0C8" }}>·</span>
            <span className="font-display text-sm font-semibold" style={{ color: "#9A607A" }}>Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNewOrderModal(true)}
              className="flex items-center gap-2 text-xs font-display font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 text-white"
              style={{ background: "#D4437A" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Order
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/1732s43vQ6fStT2pLavY-ZglDIYXs5UUyaDbcWloAWJE/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-display font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
              style={{ color: "#2D9E6B", borderColor: "#A8D9C2", background: "#E4F7EF" }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
              Google Sheet
            </a>
            <a href="/" className="text-xs font-display font-semibold px-3 py-1.5 rounded-lg" style={{ color: "#9A607A" }}>
              ← Back to site
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Booking notice control */}
        <div className="mb-5 rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{ background: "#FFF8F0", borderColor: "#F0D0E0" }}>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base">📅</span>
            <span className="font-display text-sm font-bold" style={{ color: "#3D1830" }}>Currently booking:</span>
          </div>
          <input
            value={bookingDraft}
            onChange={e => setBookingDraft(e.target.value)}
            className="flex-1 font-display text-sm rounded-xl border px-3 py-2 outline-none focus:border-[#D4437A]"
            style={{ borderColor: "#E8B0C8", color: "#3D1830" }}
            placeholder="e.g. July 2026 and beyond"
          />
          <button
            onClick={saveBookingNotice}
            disabled={savingNotice || bookingDraft === bookingNotice}
            className="font-display text-xs font-bold px-4 py-2 rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ background: "#D4437A" }}
          >
            {savingNotice ? "Saving…" : "Save"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "New",      value: counts.new,      color: "#D4437A", bg: "#FDE8F0" },
            { label: "Invoiced", value: counts.invoiced,  color: "#9A607A", bg: "#FEF5E8" },
            { label: "Paid",     value: counts.paid,      color: "#2D9E6B", bg: "#E4F7EF" },
            { label: "Complete", value: counts.complete,  color: "#B0456A", bg: "#FADADD" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: s.bg }}>
              <p className="font-display text-xs font-bold uppercase tracking-wider mb-1" style={{ color: s.color, opacity: 0.7 }}>{s.label}</p>
              <p className="font-display text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Time period selector */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: "#C4889A" }}>Due within:</span>
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(days === d ? null : d)}
              className="font-display text-xs font-bold px-3 py-1.5 rounded-full transition-all"
              style={days === d
                ? { background: "#3D1830", color: "white" }
                : { background: "white", color: "#6B3058", border: "1.5px solid #F0D0E0" }
              }
            >
              {d}d
            </button>
          ))}
          {days && (
            <button
              onClick={() => setDays(null)}
              className="font-display text-xs text-[#C4889A] underline decoration-dotted ml-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "new", "invoiced", "paid", "complete"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-display text-xs font-bold px-4 py-1.5 rounded-full transition-all"
              style={filter === f
                ? { backgroundColor: "#D4437A", color: "white" }
                : { backgroundColor: "white", color: "#6B3058", border: "1.5px solid #F0D0E0" }
              }
            >
              {f === "all" ? `All (${counts.all})` : `${STATUS_CONFIG[f]?.label} (${counts[f as keyof typeof counts]})`}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="flex gap-5" style={{ minHeight: 500 }}>
          {/* Order list */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="font-display text-sm" style={{ color: "#9A607A" }}>Loading orders…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: "white" }}>
                <p className="font-script text-3xl mb-2" style={{ color: "#E8B0C8" }}>No orders yet</p>
                <p className="font-display text-sm" style={{ color: "#9A607A" }}>
                  {filter === "all" ? "Orders submitted through the forms will appear here." : `No ${filter} orders.`}
                </p>
              </div>
            ) : (
              filtered.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new;
                const isSelected = selected?.id === order.id;
                return (
                  <button
                    key={order.id}
                    onClick={() => { setSelected(isSelected ? null : order); setConfirmDelete(false); }}
                    className="w-full text-left rounded-2xl p-4 shadow-sm transition-all"
                    style={{
                      background: isSelected ? "#FDE8F0" : order.status === "complete" ? "#FEF2F5" : "white",
                      border: isSelected ? "2px solid #D4437A" : order.status === "complete" ? "2px solid #F5C0CC" : "2px solid transparent",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-display font-bold text-sm" style={{ color: "#3A2A1E" }}>{order.name}</span>
                          <span className="font-display text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color: cfg.color, background: cfg.bg }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="font-display text-xs truncate" style={{ color: "#8A5070" }}>
                          {PRODUCT_LABELS[order.product] ?? order.product}
                          {order.banner_text ? ` · "${order.banner_text}"` : ""}
                          {order.event_date ? ` · ${order.event_date}` : order.due_date ? ` · Due ${order.due_date}` : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {(order.price || order.invoice_amount) && (
                          <p className="font-display text-sm font-bold" style={{ color: "#2D9E6B" }}>
                            {order.price ?? `$${order.invoice_amount?.toFixed(2)}`}
                          </p>
                        )}
                        <p className="font-display text-xs" style={{ color: "#C4889A" }}>
                          {order.date_ordered ?? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-80 flex-shrink-0">
              <div className="rounded-2xl shadow-sm sticky top-24 overflow-hidden" style={{ background: "white" }}>
                {/* Panel header */}
                <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#F0E4D4" }}>
                  <div>
                    <p className="font-display font-bold text-sm" style={{ color: "#3A2A1E" }}>{selected.name}</p>
                    <p className="font-display text-xs" style={{ color: "#8A5070" }}>{selected.email}</p>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ color: "#C4889A" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  {/* Product */}
                  <DetailBlock label="Product">
                    <span className="font-semibold">{PRODUCT_LABELS[selected.product] ?? selected.product}</span>
                  </DetailBlock>

                  {/* Status */}
                  <DetailBlock label="Status">
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <button
                          key={k}
                          onClick={() => updateStatus(selected.id, k)}
                          className="text-xs font-display font-bold px-2.5 py-1 rounded-full transition-all"
                          style={selected.status === k
                            ? { background: v.color, color: "white" }
                            : { background: v.bg, color: v.color }
                          }
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </DetailBlock>

                  {/* Key order info */}
                  <DetailBlock label="Order info">
                    {selected.date_ordered && <DetailRow k="Date ordered" v={selected.date_ordered} />}
                    {selected.due_date && <DetailRow k="Due date" v={selected.due_date} />}
                    {selected.event_date && <DetailRow k="Event date" v={selected.event_date} />}
                    {selected.size && <DetailRow k="Size" v={selected.size} />}
                    {selected.price && <DetailRow k="Price" v={selected.price} />}
                    {selected.payment_method && <DetailRow k="Payment" v={selected.payment_method} />}
                    {selected.delivery && <DetailRow k="Delivery" v={selected.delivery} />}
                    {selected.shipping_address && <DetailRow k="Ship to" v={selected.shipping_address} />}
                  </DetailBlock>

                  {/* Design details */}
                  {(selected.banner_text || selected.theme || selected.colors || selected.jean_style || selected.placement || selected.text_to_paint || selected.school_name || selected.graduation_year || selected.tote_style || selected.quantity || selected.add_ons || selected.other_notes) && (
                    <DetailBlock label="Design details">
                      {selected.banner_text && <DetailRow k="Text" v={selected.banner_text} />}
                      {selected.theme && <DetailRow k="Theme" v={selected.theme} />}
                      {selected.colors && <DetailRow k="Colors" v={selected.colors} />}
                      {selected.jean_style && <DetailRow k="Jean style" v={selected.jean_style} />}
                      {selected.placement && <DetailRow k="Placement" v={selected.placement} />}
                      {selected.text_to_paint && <DetailRow k="Text to paint" v={selected.text_to_paint} />}
                      {selected.school_name && <DetailRow k="School" v={selected.school_name} />}
                      {selected.graduation_year && <DetailRow k="Grad year" v={selected.graduation_year} />}
                      {selected.tote_style && <DetailRow k="Tote style" v={selected.tote_style} />}
                      {selected.quantity && <DetailRow k="Qty" v={selected.quantity} />}
                      {selected.add_ons && <DetailRow k="Add-ons" v={selected.add_ons} />}
                      {selected.other_notes && <DetailRow k="Notes" v={selected.other_notes} />}
                    </DetailBlock>
                  )}

                  {selected.photos && selected.photos.length > 0 && (
                    <DetailBlock label="Inspiration photos">
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {selected.photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden" style={{ aspectRatio: "1" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </DetailBlock>
                  )}

                  {/* Contact */}
                  {(selected.phone || selected.instagram) && (
                    <DetailBlock label="Contact">
                      {selected.phone && <DetailRow k="Phone" v={selected.phone} />}
                      {selected.instagram && <DetailRow k="Instagram" v={`@${selected.instagram.replace(/^@/, "")}`} />}
                    </DetailBlock>
                  )}

                  {/* Invoice info */}
                  {selected.invoice_amount && (
                    <DetailBlock label="Invoice">
                      <DetailRow k="Amount" v={`$${selected.invoice_amount.toFixed(2)}`} />
                      {selected.invoice_sent_at && (
                        <DetailRow k="Sent" v={new Date(selected.invoice_sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                      )}
                    </DetailBlock>
                  )}
                </div>

                {/* Actions */}
                <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: "#F0E4D4" }}>
                  <button
                    onClick={() => { setInvoiceModal(true); setInvoiceLink(null); }}
                    className="w-full font-display font-bold text-sm py-3 rounded-xl text-white transition-all hover:opacity-90"
                    style={{ background: "#D4437A" }}
                  >
                    Send Invoice
                  </button>
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full font-display font-semibold text-sm py-2.5 rounded-xl border transition-all hover:bg-red-50"
                      style={{ borderColor: "#F0D0E0", color: "#C4889A" }}
                    >
                      Delete order
                    </button>
                  ) : (
                    <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: "#FCA5A5", background: "#FEF2F2" }}>
                      <p className="font-display text-xs text-center font-semibold" style={{ color: "#B91C1C" }}>
                        Delete this order permanently?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 font-display text-xs font-semibold py-2 rounded-lg border"
                          style={{ borderColor: "#F0D0E0", color: "#6B3058" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteOrder(selected.id)}
                          className="flex-1 font-display text-xs font-bold py-2 rounded-lg text-white"
                          style={{ background: "#DC2626" }}
                        >
                          Yes, delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice modal */}
      {invoiceModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(60,40,20,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl" style={{ background: "white" }}>
            <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "#F0E4D4" }}>
              <p className="font-display font-bold text-base" style={{ color: "#3A2A1E" }}>
                {invoiceLink ? "Invoice ready" : `Invoice — ${selected.name}`}
              </p>
              <button onClick={closeInvoiceModal} style={{ color: "#C4889A" }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {invoiceLink ? (
              <div className="px-6 py-6 space-y-4">
                <div className="rounded-2xl p-4 text-center" style={{ background: "#E4F7EF" }}>
                  <p className="font-display text-2xl mb-1">✓</p>
                  <p className="font-display font-bold text-sm" style={{ color: "#2D9E6B" }}>Invoice generated!</p>
                  <p className="font-display text-xs mt-1" style={{ color: "#5A8A70" }}>
                    Send this link to {selected.name} via DM or text
                  </p>
                </div>

                <div className="rounded-xl border px-3 py-2.5 flex items-center gap-2" style={{ borderColor: "#F0D0E0", background: "#FFF8F0" }}>
                  <p className="flex-1 font-display text-xs truncate" style={{ color: "#6B3058" }}>{invoiceLink}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyLink}
                    className="flex-1 font-display font-bold text-sm py-3 rounded-xl text-white transition-all"
                    style={{ background: copied ? "#2D9E6B" : "#D4437A" }}
                  >
                    {copied ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={invoiceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-sm py-3 px-4 rounded-xl border flex items-center"
                    style={{ borderColor: "#F0D0E0", color: "#6B3058" }}
                  >
                    Preview
                  </a>
                </div>
                <p className="font-display text-xs text-center" style={{ color: "#C4889A" }}>
                  Paste into Instagram DM or text message
                </p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="font-display text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#9A607A" }}>
                    Amount
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: "#F0D0E0" }}>
                    <span className="font-display font-bold text-lg" style={{ color: "#9A607A" }}>$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="flex-1 outline-none font-display text-lg font-bold bg-transparent"
                      style={{ color: "#3A2A1E" }}
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="font-display text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#9A607A" }}>
                    Note (optional)
                  </label>
                  <textarea
                    placeholder="e.g. Includes rush fee, shipping included…"
                    value={invoiceNote}
                    onChange={(e) => setInvoiceNote(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border px-3 py-2.5 outline-none font-display text-sm resize-none"
                    style={{ borderColor: "#F0D0E0", color: "#3A2A1E" }}
                  />
                </div>
                <div className="rounded-xl p-3 text-xs font-display" style={{ background: "#FEF5E8", color: "#9A607A" }}>
                  Generates a link you can DM or text to <strong>{selected.name}</strong>. They tap it, see their invoice, and pay via Venmo or Cash App.
                </div>
                <button
                  onClick={generateInvoice}
                  disabled={!invoiceAmount || sending}
                  className="w-full font-display font-bold text-sm py-3 rounded-xl text-white transition-all"
                  style={{ background: "#D4437A", opacity: invoiceAmount && !sending ? 1 : 0.4 }}
                >
                  {sending ? "Generating…" : "Generate Invoice Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-lg font-display text-sm font-semibold text-white"
          style={{ background: "#3A2A1E" }}>
          {toast}
        </div>
      )}

      {/* New Order Modal */}
      {newOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(61,24,48,0.4)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" style={{ background: "white" }}>
            <div className="px-7 py-5 border-b flex items-center justify-between" style={{ borderColor: "#F0D0E0" }}>
              <p className="font-script text-2xl" style={{ color: "#D4437A" }}>New Order</p>
              <button onClick={() => { setNewOrderModal(false); setNewOrder(emptyNewOrder); }} className="font-display text-xs text-[#9A607A] hover:text-[#D4437A]">✕ Cancel</button>
            </div>
            <div className="px-7 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <NewField label="Name *">
                <input value={newOrder.name} onChange={e => setNewOrder(o => ({ ...o, name: e.target.value }))} placeholder="Customer name" className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A]" style={{ borderColor: "#E8B0C8" }} />
              </NewField>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <NewField label="Date Ordered">
                  <input value={newOrder.date_ordered} onChange={e => setNewOrder(o => ({ ...o, date_ordered: e.target.value }))} placeholder="e.g. June 23rd" className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A]" style={{ borderColor: "#E8B0C8" }} />
                </NewField>
                <NewField label="Due Date">
                  <input value={newOrder.due_date} onChange={e => setNewOrder(o => ({ ...o, due_date: e.target.value }))} placeholder="e.g. July 4th" className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A]" style={{ borderColor: "#E8B0C8" }} />
                </NewField>
              </div>
              {/* Size + Price */}
              <div className="grid grid-cols-2 gap-3">
                <NewField label="Size">
                  <select value={newOrder.size} onChange={e => setNewOrder(o => ({ ...o, size: e.target.value }))} className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A] bg-white" style={{ borderColor: "#E8B0C8" }}>
                    <option value="">Select…</option>
                    <option>3ft</option><option>4ft</option><option>5ft</option><option>6ft</option><option>Custom</option>
                  </select>
                </NewField>
                <NewField label="Price">
                  <input value={newOrder.price} onChange={e => setNewOrder(o => ({ ...o, price: e.target.value }))} placeholder="e.g. $65" className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A]" style={{ borderColor: "#E8B0C8" }} />
                </NewField>
              </div>
              {/* Payment + Delivery */}
              <div className="grid grid-cols-2 gap-3">
                <NewField label="Payment Method">
                  <select value={newOrder.payment_method} onChange={e => setNewOrder(o => ({ ...o, payment_method: e.target.value }))} className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A] bg-white" style={{ borderColor: "#E8B0C8" }}>
                    <option value="">Select…</option>
                    <option>Venmo</option><option>CashApp</option><option>Other</option>
                  </select>
                </NewField>
                <NewField label="Delivery">
                  <select value={newOrder.delivery} onChange={e => setNewOrder(o => ({ ...o, delivery: e.target.value }))} className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A] bg-white" style={{ borderColor: "#E8B0C8" }}>
                    <option value="">Select…</option>
                    <option>Pickup</option><option>Shipping</option><option>Custom</option>
                  </select>
                </NewField>
              </div>
              {/* Status */}
              <NewField label="Status">
                <div className="flex gap-2 flex-wrap">
                  {["new","invoiced","paid","complete"].map(s => (
                    <button key={s} type="button" onClick={() => setNewOrder(o => ({ ...o, status: s }))}
                      className="font-display text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize"
                      style={newOrder.status === s
                        ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color }
                        : { background: "white", color: "#9A607A", borderColor: "#E8B0C8" }}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </NewField>
              {/* Notes */}
              <NewField label="Notes">
                <textarea value={newOrder.other_notes} onChange={e => setNewOrder(o => ({ ...o, other_notes: e.target.value }))} placeholder="Theme, banner text, anything else…" rows={2} className="w-full font-display text-sm px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4437A] resize-none" style={{ borderColor: "#E8B0C8" }} />
              </NewField>
            </div>
            <div className="px-7 py-4 border-t flex gap-3" style={{ borderColor: "#F0D0E0" }}>
              <button onClick={createOrder} disabled={savingOrder} className="flex-1 font-display font-bold text-sm py-3 rounded-xl text-white transition-all disabled:opacity-50" style={{ background: "#D4437A" }}>
                {savingOrder ? "Saving…" : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-display text-xs font-bold uppercase tracking-wider mb-1.5 block" style={{ color: "#9A607A" }}>{label}</label>
      {children}
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#C4889A" }}>{label}</p>
      <div className="font-display text-sm space-y-0.5" style={{ color: "#3A2A1E" }}>{children}</div>
    </div>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <p><span style={{ color: "#8A5070" }}>{k}:</span> {v}</p>
  );
}
