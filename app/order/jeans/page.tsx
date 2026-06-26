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

const JEAN_SIZES = [
  { label: "Front only", value: "Front only", price: "$70" },
  { label: "Back only", value: "Back only", price: "$70" },
  { label: "Front & back", value: "Front and back", price: "$130" },
];

interface FormData {
  name: string;
  instagram: string;
  phone: string;
  eventDate: string;
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
  bannerText: "",
  otherNotes: "",
  size: "",
  delivery: "",
  shippingAddress: "",
};

function isTooSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff < 21 * 24 * 60 * 60 * 1000;
}

export default function JeansOrderPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);
  const [photos, setPhotos] = useState<File[]>([]);
  const [bookingNotice, setBookingNotice] = useState("July 2026 and beyond");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.booking_notice) setBookingNotice(d.booking_notice);
    });
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const tooSoon = isTooSoon(form.eventDate);

  function canAdvance1() {
    return (
      form.name.trim() &&
      form.phone.trim() &&
      form.eventDate &&
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
        body: JSON.stringify({ ...form, product: "senior-jeans", photos: photoUrls }),
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
      style={{ background: "linear-gradient(160deg, #F8F0FC 0%, #EDE0F8 60%, #E2D0F4 100%)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/linktree" className="inline-flex items-center gap-1 text-xs font-display text-[#7A5590] mb-5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-script text-4xl mb-1" style={{ color: "#8B5CA8" }}>Order Custom Jeans</h1>
          <p className="font-display text-sm text-[#7A5590]">Hand-painted denim by Sophia</p>
        </div>

        {/* ── IMPORTANT INFO BOX ── */}
        <div className="rounded-2xl p-5 mb-6 text-xs font-display leading-relaxed space-y-2"
          style={{ background: "#FEF9E8", border: "1.5px solid #F4D06F" }}>
          <p className="font-bold text-sm text-[#2D1A3D] mb-1">Before you order — please read!</p>
          <p className="text-[#5A3A75]">
            <span className="font-bold">👖 You supply the jeans.</span> Ship them to me, or order a pair online and have them shipped directly to me. I&apos;ll send you a shipping address once your order is confirmed.
          </p>
          <p className="text-[#5A3A75]">
            <span className="font-bold">🕐 4-week turnaround from when Sophia receives your jeans.</span> Plan your date accordingly — this is not from when you place the order.
          </p>
          <p className="text-[#5A3A75]">
            <span className="font-bold">📦 $12 return shipping</span> to get your finished jeans back.
          </p>
          <p className="text-[#5A3A75]">
            <span className="font-bold">🚫 No detailed logos or characters.</span>
          </p>
          <p className="text-[#5A3A75]">
            <span className="font-bold">📅 Currently booking {bookingNotice}.</span>
          </p>
          <p className="text-[#5A3A75]">
            After submitting, <strong>DM @signsby.sophia on Instagram</strong> to confirm. Can&apos;t DM? Text <strong>405-243-1461</strong>. An invoice will be sent once confirmed — payment secures your spot.
          </p>
        </div>

        {/* Step progress */}
        <StepBar step={step} />

        {/* Form card */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 mt-5 border border-[#D4C0E8]">
          {step === 1 ? (
            <Step1
              form={form}
              set={set}
              tooSoon={tooSoon}
              canAdvance={!!canAdvance1()}
              onNext={() => setStep(2)}
              photos={photos}
              setPhotos={setPhotos}
            />
          ) : (
            <Step2
              form={form}
              set={set}
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
  const steps = ["Your info", "Pricing & delivery"];
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
                style={{ background: done || active ? "#8B5CA8" : "#D4C0E8", color: done || active ? "white" : "#7A5590" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-display mt-1" style={{ color: active ? "#8B5CA8" : "#7A5590" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-0.5 mb-4 rounded-full" style={{ background: done ? "#8B5CA8" : "#D4C0E8" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: contact + design details ── */
function Step1({ form, set, tooSoon, canAdvance, onNext, photos, setPhotos }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  tooSoon: boolean;
  canAdvance: boolean;
  onNext: () => void;
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#2D1A3D] text-lg">Your info & design details</h2>

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

      <Field label="What date do you need your finished jeans back? *">
        <input
          type="date"
          value={form.eventDate}
          onChange={(e) => set("eventDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-[#D4C0E8] rounded-xl px-3 py-2.5 text-sm font-display text-[#2D1A3D] bg-white mt-1 outline-none focus:border-[#8B5CA8]"
        />
        <p className="text-[11px] font-display font-bold text-[#5A3A75] mt-1.5">
          ⏱️ Turnaround is 4-weeks from when Sophia receives your jeans — plan accordingly.
        </p>
        {tooSoon && form.eventDate && (
          <p className="text-[10px] font-display font-bold text-[#8B5CA8] mt-1">
            ⚠️ Your date may not allow enough time — remember, the 4-week turnaround starts when Sophia receives your jeans, not when you order.
          </p>
        )}
      </Field>

      <Field label="Design details *">
        <textarea
          rows={3}
          placeholder={"Describe what you'd like painted — words, numbers, graphics, colors, style...\nBe as specific as possible!"}
          value={form.bannerText}
          onChange={(e) => set("bannerText", e.target.value)}
          className="w-full border border-[#D4C0E8] rounded-xl px-3 py-2.5 text-sm font-display text-[#2D1A3D] bg-white mt-1 outline-none focus:border-[#8B5CA8] resize-none"
        />
      </Field>

      <Field label="Inspiration photos (optional)">
        <p className="font-display text-[10px] text-[#7A5590] mb-2">Upload up to 10 photos — inspo, colors, styles, anything helpful.</p>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors font-display text-sm font-semibold"
          style={{ borderColor: "#D4C0E8", color: "#7A5590" }}>
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

      <Field label="Any other specifics?">
        <textarea
          rows={2}
          placeholder="Anything else Sophia should know..."
          value={form.otherNotes}
          onChange={(e) => set("otherNotes", e.target.value)}
          className="w-full border border-[#D4C0E8] rounded-xl px-3 py-2.5 text-sm font-display text-[#2D1A3D] bg-white mt-1 outline-none focus:border-[#8B5CA8] resize-none"
        />
      </Field>

      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance}
        className="w-full py-3.5 rounded-full font-display font-bold text-sm text-white transition-all mt-2"
        style={{ background: canAdvance ? "#8B5CA8" : "#D4C0E8" }}
      >
        Continue
      </button>
    </div>
  );
}

/* ── Step 2: pricing, delivery, payment ── */
function Step2({ form, set, canSubmit, submitting, error, onBack, onSubmit }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  canSubmit: boolean;
  submitting: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#2D1A3D] text-lg">Pricing & delivery</h2>

      {/* Jeans pricing */}
      <Field label="Jeans pricing *">
        <div className="flex flex-col gap-2 mt-1">
          {JEAN_SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set("size", s.value)}
              className="py-3 px-4 rounded-xl border font-display font-bold text-sm transition-all flex items-center justify-between"
              style={form.size === s.value
                ? { background: "#EDE0F8", borderColor: "#8B5CA8", color: "#8B5CA8" }
                : { background: "white", borderColor: "#D4C0E8", color: "#2D1A3D" }}
            >
              <span>{s.label}</span>
              <span className="text-sm font-bold" style={{ color: form.size === s.value ? "#8B5CA8" : "#7A5590" }}>{s.price}</span>
            </button>
          ))}
        </div>
      </Field>

      {/* Delivery */}
      <Field label="How are you receiving your jeans? *">
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
                ? { background: "#EDE0F8", borderColor: "#8B5CA8" }
                : { background: "white", borderColor: "#D4C0E8" }}
            >
              <div>
                <p className="font-display font-bold text-xs text-[#2D1A3D]">{opt.label}</p>
                <p className="font-display text-[10px] text-[#7A5590] mt-0.5">{opt.desc}</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: form.delivery === opt.val ? "#8B5CA8" : "#D4C0E8" }}>
                {form.delivery === opt.val && (
                  <div className="w-2 h-2 rounded-full" style={{ background: "#8B5CA8" }} />
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
            className="w-full border border-[#D4C0E8] rounded-xl px-3 py-2.5 text-sm font-display text-[#2D1A3D] bg-white mt-1 outline-none focus:border-[#8B5CA8] resize-none"
          />
        </Field>
      )}

      {/* Payment info */}
      <div className="rounded-2xl p-4 text-xs font-display"
        style={{ background: "#EDE0F8", border: "1.5px solid #C5A8D544" }}>
        <p className="font-bold text-sm text-[#8B5CA8] mb-2">💳 Payment</p>
        <p className="text-[#5A3A75] mb-2">
          Payment is due right after submitting to <strong>secure your spot</strong>. Customization won&apos;t begin until payment is received.
        </p>
        <div className="flex gap-4">
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "white" }}>
            <p className="text-[9px] text-[#7A5590] uppercase tracking-widest font-bold">Venmo</p>
            <p className="font-bold text-[#2D1A3D] mt-0.5">@Sophia-Lynch-25</p>
          </div>
          <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: "white" }}>
            <p className="text-[9px] text-[#7A5590] uppercase tracking-widest font-bold">Cash App</p>
            <p className="font-bold text-[#2D1A3D] mt-0.5">$SignsbySophia</p>
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl p-4 text-xs font-display space-y-1.5"
        style={{ background: "#F8F0FC", border: "1px solid #D4C0E8" }}>
        <p className="font-bold text-sm text-[#2D1A3D] mb-2">Order summary</p>
        <Row label="Name" value={form.name} />
        <Row label="Phone" value={form.phone} />
        {form.instagram && <Row label="Instagram" value={form.instagram} />}
        <Row label="Arrive by" value={form.eventDate} />
        <Row label="Design details" value={form.bannerText} />
        {form.otherNotes && <Row label="Notes" value={form.otherNotes} />}
        {form.size && <Row label="Placement" value={form.size} />}
        {form.delivery && <Row label="Delivery" value={form.delivery === "pickup" ? "Local pickup" : "Shipping (price varies)"} />}
        {form.shippingAddress && <Row label="Ship to" value={form.shippingAddress} />}
      </div>

      {error && <p className="text-xs font-display text-red-500 text-center">{error}</p>}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-full font-display font-semibold text-sm border border-[#D4C0E8] text-[#7A5590] transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
          style={{ background: canSubmit && !submitting ? "#8B5CA8" : "#D4C0E8" }}
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
      style={{ background: "linear-gradient(160deg, #F8F0FC 0%, #EDE0F8 60%, #E2D0F4 100%)" }}>
      <div className="text-6xl mb-6">👖</div>
      <h1 className="font-script text-4xl mb-3" style={{ color: "#8B5CA8" }}>Order submitted!</h1>
      <p className="font-display text-sm text-[#5A3A75] max-w-xs mb-1">
        Thanks {name}! Your order is in.
      </p>

      <div className="bg-white/80 rounded-2xl p-5 mt-4 max-w-xs text-left text-xs font-display text-[#5A3A75] space-y-2.5 border border-[#D4C0E8]">
        <p className="font-bold text-sm text-[#2D1A3D] mb-1">What happens next:</p>
        <p>1️⃣ <strong>DM @signsby.sophia on Instagram</strong> to confirm your order.
          {instagram && ` (She can also reach you at ${instagram})`}
        </p>
        <p>2️⃣ Can&apos;t DM? Text <strong>405-243-1461</strong>.</p>
        <p>3️⃣ Sophia will send a <strong>shipping address</strong> for you to mail your jeans to.</p>
        <p>4️⃣ She&apos;ll send an invoice — <strong>pay to lock in your spot.</strong></p>
        <p>5️⃣ <strong>4-week turnaround</strong> starts when Sophia receives your jeans.</p>

        <div className="rounded-xl p-3 mt-1 space-y-1" style={{ background: "#EDE0F8" }}>
          <p className="font-bold text-[#8B5CA8]">💳 Pay now to secure your spot:</p>
          <p>Venmo: <strong>@Sophia-Lynch-25</strong></p>
          <p>Cash App: <strong>$SignsbySophia</strong></p>
        </div>
      </div>

      <Link href="/linktree" className="mt-8 px-8 py-3 rounded-full font-display font-bold text-sm text-white"
        style={{ background: "#8B5CA8" }}>
        Back to links
      </Link>
    </main>
  );
}

/* ── Shared helpers ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display font-semibold text-xs text-[#5A3A75]">{label}</p>
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
      className="w-full border border-[#D4C0E8] rounded-xl px-3 py-2.5 text-sm font-display text-[#2D1A3D] bg-white mt-1 outline-none focus:border-[#8B5CA8]"
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-display text-[#7A5590] mt-1">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 justify-between">
      <span className="text-[#7A5590] flex-shrink-0">{label}:</span>
      <span className="text-[#2D1A3D] text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}
