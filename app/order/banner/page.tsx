"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Step = 1 | 2;

async function compressImage(file: File, maxPx = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
    };
    img.src = url;
  });
}

const SIZES = [
  { label: '3ft × 35"', value: "3ft", price: "$65" },
  { label: '4ft × 35"', value: "4ft", price: "$70" },
  { label: '5ft × 35"', value: "5ft", price: "$80" },
  { label: '6ft × 35"', value: "6ft", price: "$90" },
];

interface FormData {
  name: string;
  instagram: string;
  phone: string;
  eventDate: string;
  theme: string;
  bannerText: string;
  otherNotes: string;
  size: string;
  delivery: "pickup" | "shipping" | "";
  shippingAddress: string;
}

const empty: FormData = {
  name: "",
  instagram: "",
  phone: "",
  eventDate: "",
  theme: "",
  bannerText: "",
  otherNotes: "",
  size: "",
  delivery: "",
  shippingAddress: "",
};

function isRush(dateStr: string): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff < 14 * 24 * 60 * 60 * 1000;
}

export default function BannerOrderPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);
  const [photos, setPhotos] = useState<File[]>([]);
  const [bookingNotice, setBookingNotice] = useState("July 2026 and beyond");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.booking_notice) setBookingNotice(d.booking_notice);
    });
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const rush = isRush(form.eventDate);

  function canAdvance1() {
    return (
      form.name.trim() &&
      form.phone.trim() &&
      form.eventDate &&
      form.theme.trim() &&
      form.bannerText.trim()
    );
  }

  function canSubmit() {
    return (
      form.size &&
      form.delivery &&
      (form.delivery === "pickup" || form.shippingAddress.trim())
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const compressed = await Promise.all(photos.map((f) => compressImage(f)));
        const fd = new FormData();
        compressed.forEach((blob, i) => fd.append("files", blob, `photo-${i}.jpg`));
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (up.ok) { const d = await up.json(); photoUrls = d.urls ?? []; }
      }
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product: "banner", photos: photoUrls }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or text 405-243-1461.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <SuccessScreen name={form.name} instagram={form.instagram} />;

  return (
    <main
      className="min-h-screen py-10 px-4"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 60%, #FDE4CC 100%)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/linktree" className="inline-flex items-center gap-1 text-xs font-display text-[#9A607A] mb-5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-script text-4xl mb-1" style={{ color: "#D4437A" }}>Order a Banner</h1>
          <p className="font-display text-sm text-[#8A5070]">Custom hand-painted kraft paper banners</p>
        </div>

        {/* ── IMPORTANT INFO BOX ── */}
        <div className="rounded-2xl p-5 mb-6 text-xs font-display leading-relaxed space-y-2"
          style={{ background: "#FEF9E8", border: "1.5px solid #F4D06F" }}>
          <p className="font-bold text-sm text-[#3D1830] mb-1">Before you order — please read!</p>
          <p className="text-[#6B3058]">
            <span className="font-bold">📅 Currently only taking orders for {bookingNotice}.</span>
          </p>
          <p className="text-[#6B3058]">
            After submitting, <strong>DM @signsby.sophia on Instagram to confirm your order.</strong> If you can&apos;t DM,
            text <strong>405-243-1461</strong>.
          </p>
          <p className="text-[#6B3058]">
            Once confirmed, an <strong>invoice</strong> will be sent.
            <strong> Payment is due right after submitting</strong> to secure your spot.
          </p>
          <p className="text-[#6B3058]">
            A <strong>mockup</strong> will be sent 1–2 weeks before your event date.
            You get <strong>one round of changes</strong>.
          </p>
          <p className="text-[#6B3058]">
            📦 <strong>US shipping available</strong> — price varies by location, included in your invoice.
          </p>
        </div>

        {/* Step progress */}
        <StepBar step={step} />

        {/* Form card */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 mt-5 border border-[#EDD8C4]">
          {step === 1 ? (
            <Step1
              form={form}
              set={set}
              rush={rush}
              canAdvance={!!canAdvance1()}
              onNext={() => setStep(2)}
              photos={photos}
              setPhotos={setPhotos}
            />
          ) : (
            <Step2
              form={form}
              set={set}
              rush={rush}
              canSubmit={!!canSubmit()}
              submitting={submitting}
              error={error}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </main>
  );
}

/* ── Step bar ── */
function StepBar({ step }: { step: number }) {
  const steps = ["Your info", "Size & delivery"];
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-display transition-all"
                style={{ background: done || active ? "#D4437A" : "#EDD8C4", color: done || active ? "white" : "#9A607A" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-display mt-1" style={{ color: active ? "#D4437A" : "#9A607A" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-0.5 mb-4 rounded-full" style={{ background: done ? "#D4437A" : "#EDD8C4" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: contact + event details ── */
function Step1({ form, set, rush, canAdvance, onNext, photos, setPhotos }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  rush: boolean;
  canAdvance: boolean;
  onNext: () => void;
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Your info & event details</h2>

      <Field label="Full name *">
        <Input placeholder="First and last name" value={form.name} onChange={(v) => set("name", v)} />
      </Field>

      <Field label="Instagram handle">
        <Input placeholder="@yourhandle" value={form.instagram} onChange={(v) => set("instagram", v)} />
        <Hint>Drop your handle so we can connect!</Hint>
      </Field>

      <Field label="Phone number *">
        <Input type="tel" placeholder="(405) 555-0100" value={form.phone} onChange={(v) => set("phone", v)} />
      </Field>

      <Field label="Day you want banner to arrive *">
        <input
          type="date"
          value={form.eventDate}
          onChange={(e) => set("eventDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-[#EDD8C4] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none focus:border-[#D4437A]"
        />
        <Hint>At least 2 weeks&apos; notice is required.</Hint>
        {rush && form.eventDate && (
          <p className="text-[10px] font-display font-bold text-[#D4437A] mt-1">
            ⚡ Rush fee of $15 applies — date is less than 2 weeks away.
          </p>
        )}
      </Field>

      <Field label="Theme of the event & banner *">
        <Input placeholder='e.g. "Pink birthday for Emma" or "Graduation luau party"' value={form.theme} onChange={(v) => set("theme", v)} />
      </Field>

      <Field label="Exact wording *">
        <textarea
          rows={3}
          placeholder={"e.g. \"Happy 18th Birthday Emma!\"\nSpell it exactly as you want it painted."}
          value={form.bannerText}
          onChange={(e) => set("bannerText", e.target.value)}
          className="w-full border border-[#EDD8C4] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none focus:border-[#D4437A] resize-none"
        />
      </Field>

      <Field label="Inspiration photos (optional)">
        <p className="font-display text-[10px] text-[#8A5070] mb-2">Upload up to 10 photos — colors, themes, inspo, anything helpful.</p>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors font-display text-sm font-semibold"
          style={{ borderColor: "#EDD8C4", color: "#9A607A" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {photos.length === 0 ? "Add photos" : `${photos.length}/10 added — tap to add more`}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const incoming = Array.from(e.target.files ?? []);
              setPhotos((prev) => [...prev, ...incoming].slice(0, 10));
              e.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {photos.map((f, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label="Any other specifics? (colors, fonts, etc.)">
        <textarea
          rows={2}
          placeholder="Colors, style references, font preferences, extra details..."
          value={form.otherNotes}
          onChange={(e) => set("otherNotes", e.target.value)}
          className="w-full border border-[#EDD8C4] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none focus:border-[#D4437A] resize-none"
        />

      </Field>

      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance}
        className="w-full py-3.5 rounded-full font-display font-bold text-sm text-white transition-all mt-2"
        style={{ background: canAdvance ? "#D4437A" : "#EDD8C4" }}
      >
        Continue
      </button>
    </div>
  );
}

/* ── Step 2: size, delivery, payment ── */
function Step2({ form, set, rush, canSubmit, submitting, error, onBack, onSubmit }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  rush: boolean;
  canSubmit: boolean;
  submitting: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Size & delivery</h2>

      {/* Banner size */}
      <Field label="Banner size *">
        {/* Pricing image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner-pricing.png"
          alt="Banner prices: 3ft×35″ $65, 4ft×35″ $70, 5ft×35″ $80, 6ft×35″ $90"
          className="w-full rounded-xl mt-2 mb-3"
          style={{ border: "1.5px solid #EDD8C4" }}
        />
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set("size", s.value)}
              className="py-3 px-2 rounded-xl border font-display font-bold text-sm transition-all flex flex-col items-center gap-0.5"
              style={form.size === s.value
                ? { background: "#FDE8F0", borderColor: "#D4437A", color: "#D4437A" }
                : { background: "white", borderColor: "#EDD8C4", color: "#3D1830" }}
            >
              <span>{s.label}</span>
              <span className="text-xs font-semibold" style={{ color: form.size === s.value ? "#D4437A" : "#8A5070" }}>{s.price}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Delivery */}
      <Field label="How are you receiving your banner? *">
        <div className="flex flex-col gap-2 mt-1">
          {[
            { val: "pickup", label: "Local pickup", desc: "Norman, OK area" },
            { val: "shipping", label: "Shipping", desc: "US shipping available · price varies by location" },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => set("delivery", opt.val as "pickup" | "shipping")}
              className="flex items-center justify-between p-3 rounded-xl border text-left transition-all"
              style={form.delivery === opt.val
                ? { background: "#FDE8F0", borderColor: "#D4437A" }
                : { background: "white", borderColor: "#EDD8C4" }}
            >
              <div>
                <p className="font-display font-bold text-xs text-[#3D1830]">{opt.label}</p>
                <p className="font-display text-[10px] text-[#8A5070] mt-0.5">{opt.desc}</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: form.delivery === opt.val ? "#D4437A" : "#EDD8C4" }}>
                {form.delivery === opt.val && (
                  <div className="w-2 h-2 rounded-full" style={{ background: "#D4437A" }} />
                )}
              </div>
            </button>
          ))}
        </div>
      </Field>

      {/* Shipping address */}
      {form.delivery === "shipping" && (
        <Field label="Shipping address *">
          <textarea
            rows={3}
            placeholder={"Street address\nCity, State, ZIP"}
            value={form.shippingAddress}
            onChange={(e) => set("shippingAddress", e.target.value)}
            className="w-full border border-[#EDD8C4] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none focus:border-[#D4437A] resize-none"
          />
        </Field>
      )}

      {/* Payment info */}
      <div className="rounded-2xl p-4 text-xs font-display"
        style={{ background: "#FDE8F0", border: "1.5px solid #F2A7C344" }}>
        <p className="font-bold text-sm text-[#D4437A] mb-2">💳 Payment</p>
        <p className="text-[#6B3058] mb-2">
          Payment is due right after submitting to <strong>secure your spot</strong>. Your banner won&apos;t start until payment is received.
        </p>
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "white" }}>
            <p className="text-[9px] text-[#8A5070] uppercase tracking-widest font-bold">Venmo</p>
            <p className="font-bold text-[#3D1830] mt-0.5">@Sophia-Lynch-25</p>
          </div>
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "white" }}>
            <p className="text-[9px] text-[#8A5070] uppercase tracking-widest font-bold">Cash App</p>
            <p className="font-bold text-[#3D1830] mt-0.5">$SignsbySophia</p>
          </div>
        </div>
        {rush && (
          <p className="mt-2 text-[#D4437A] font-bold">⚡ Rush fee: +$15 (less than 2 weeks&apos; notice)</p>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-2xl p-4 text-xs font-display space-y-1.5"
        style={{ background: "#FFF8F0", border: "1px solid #EDD8C4" }}>
        <p className="font-bold text-sm text-[#3D1830] mb-2">Order summary</p>
        <Row label="Name" value={form.name} />
        <Row label="Phone" value={form.phone} />
        {form.instagram && <Row label="Instagram" value={form.instagram} />}
        <Row label="Event date" value={form.eventDate} />
        <Row label="Theme" value={form.theme} />
        <Row label="Banner text" value={form.bannerText} />
        {form.otherNotes && <Row label="Notes" value={form.otherNotes} />}
        {form.size && <Row label="Size" value={`${form.size} × 35"`} />}
        {form.delivery && <Row label="Delivery" value={form.delivery === "pickup" ? "Local pickup" : "Shipping (price varies)"} />}
        {form.shippingAddress && <Row label="Ship to" value={form.shippingAddress} />}
      </div>

      {error && <p className="text-xs font-display text-red-500 text-center">{error}</p>}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-full font-display font-semibold text-sm border border-[#EDD8C4] text-[#9A607A] transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
          style={{ background: canSubmit && !submitting ? "#D4437A" : "#EDD8C4" }}
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      </div>
    </form>
  );
}

/* ── Success ── */
function SuccessScreen({ name, instagram }: { name: string; instagram: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 60%, #FDE4CC 100%)" }}>
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="font-script text-4xl mb-3" style={{ color: "#D4437A" }}>Order submitted!</h1>
      <p className="font-display text-sm text-[#6B3058] max-w-xs mb-1">
        Thanks {name}! Your order is in.
      </p>

      {/* Next steps */}
      <div className="bg-white/80 rounded-2xl p-5 mt-4 max-w-xs text-left text-xs font-display text-[#6B3058] space-y-2.5 border border-[#EDD8C4]">
        <p className="font-bold text-sm text-[#3D1830] mb-1">What happens next:</p>
        <p>1️⃣ <strong>DM @signsby.sophia on Instagram</strong> to confirm your order.
          {instagram && ` (She can also reach you at ${instagram})`}
        </p>
        <p>2️⃣ Can&apos;t DM? Text <strong>405-243-1461</strong>.</p>
        <p>3️⃣ Sophia will send you an invoice — <strong>pay to lock in your spot.</strong></p>
        <p>4️⃣ You&apos;ll get a <strong>mockup</strong> 1–2 weeks before your event. One round of changes allowed.</p>

        <div className="rounded-xl p-3 mt-1 space-y-1" style={{ background: "#FDE8F0" }}>
          <p className="font-bold text-[#D4437A]">💳 Pay now to secure your spot:</p>
          <p>Venmo: <strong>@Sophia-Lynch-25</strong></p>
          <p>Cash App: <strong>$SignsbySophia</strong></p>
        </div>
      </div>

      <Link href="/linktree" className="mt-8 px-8 py-3 rounded-full font-display font-bold text-sm text-white"
        style={{ background: "#D4437A" }}>
        Back to links
      </Link>
    </main>
  );
}

/* ── Shared helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display font-semibold text-xs text-[#6B3058]">{label}</p>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text" }: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#EDD8C4] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none focus:border-[#D4437A]"
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-display text-[#9A607A] mt-1">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 justify-between">
      <span className="text-[#8A5070] flex-shrink-0">{label}:</span>
      <span className="text-[#3D1830] text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}
