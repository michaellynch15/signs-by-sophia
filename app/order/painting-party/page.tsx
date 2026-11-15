"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

type Step = 1 | 2;

const ACCENT = "#4F9E78";
const ACCENT_BG = "#E4F5EA";
const BORDER = "#CFE5D6";
const PRICE_PER_PAINTER = 30;
const MAX_PAINTERS = 8;

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

function formatTime(t: string): string {
  const [hStr, m] = t.split(":");
  const h = Number(hStr);
  if (isNaN(h) || !m) return t;
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

interface FormData {
  name: string;
  phone: string;
  address: string;
  eventDate: string;
  startTime: string;
  painters: string;
  theme: string;
  inspo: string;
  otherNotes: string;
}

const empty: FormData = {
  name: "",
  phone: "",
  address: "",
  eventDate: "",
  startTime: "",
  painters: "",
  theme: "",
  inspo: "",
  otherNotes: "",
};

export default function PaintingPartyPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    track("form_view", { product: "painting-party" });
  }, []);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canAdvance1() {
    return (
      form.name.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      form.eventDate &&
      form.startTime &&
      form.painters &&
      form.theme.trim()
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
      const n = Number(form.painters);
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          eventDate: form.eventDate,
          theme: form.theme,
          bannerText: form.inspo,
          otherNotes: form.otherNotes,
          shippingAddress: form.address,
          quantity: form.painters,
          size: `${n} painter${n === 1 ? "" : "s"} · ${formatTime(form.startTime)}`,
          delivery: "On-site party",
          product: "painting-party",
          photos: photoUrls,
        }),
      });
      if (!res.ok) throw new Error();
      track("form_submitted", { product: "painting-party" });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or text 405-243-1461.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <SuccessScreen name={form.name} />;

  return (
    <main
      className="min-h-screen py-10 px-4"
      style={{ background: "linear-gradient(160deg, #F6FBF7 0%, #EAF6EE 60%, #DDF0E4 100%)" }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/linktree" className="inline-flex items-center gap-1 text-xs font-display text-[#5A8A70] mb-5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-script text-4xl mb-1" style={{ color: ACCENT }}>Painting Party</h1>
          <p className="font-display text-sm text-[#5A8A70]">A guided painting class led by Sophia, at your party</p>
        </div>

        {/* Important info */}
        <div className="rounded-2xl p-5 mb-6 text-xs font-display leading-relaxed space-y-2"
          style={{ background: "#FEF9E8", border: "1.5px solid #F4D06F" }}>
          <p className="font-bold text-sm text-[#3D1830] mb-1">Before you book — please read!</p>
          <p className="text-[#2E5A44]">
            📍 <strong>Local parties only.</strong> An extra fee will be charged if my commute to you is longer than <strong>35 minutes</strong>.
          </p>
          <p className="text-[#2E5A44]">
            🎨 <strong>${PRICE_PER_PAINTER} per painter</strong>, up to {MAX_PAINTERS} painters. All materials and supplies are provided — you just need a painting space, chairs and tables.
          </p>
          <p className="text-[#2E5A44]">
            After submitting, <strong>text 405-243-1461</strong> to confirm your party.
          </p>
        </div>

        <StepBar step={step} />

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 mt-5 border" style={{ borderColor: BORDER }}>
          {step === 1 ? (
            <Step1
              form={form}
              set={set}
              canAdvance={!!canAdvance1()}
              onNext={() => setStep(2)}
              photos={photos}
              setPhotos={setPhotos}
            />
          ) : (
            <Step2
              form={form}
              canSubmit={!submitting}
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
  const steps = ["Party info", "Details & book"];
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
                style={{ background: done || active ? ACCENT : BORDER, color: done || active ? "white" : "#5A8A70" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-display mt-1" style={{ color: active ? ACCENT : "#5A8A70" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-14 h-0.5 mb-4 rounded-full" style={{ background: done ? ACCENT : BORDER }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: party info ── */
function Step1({ form, set, canAdvance, onNext, photos, setPhotos }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  canAdvance: boolean;
  onNext: () => void;
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#1F3D2E] text-lg">Your info & party details</h2>

      <Field label="Full name *">
        <Input placeholder="First and last name" value={form.name} onChange={(v) => set("name", v)} />
      </Field>

      <Field label="Phone number *">
        <Input type="tel" placeholder="(405) 555-0100" value={form.phone} onChange={(v) => set("phone", v)} />
      </Field>

      <Field label="Party address *">
        <textarea
          rows={2}
          placeholder={"Street address\nCity, State, ZIP"}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          className={`${inputClass} resize-none`}
        />
        <Hint>Local parties only — an extra fee applies if my commute is longer than 35 minutes.</Hint>
      </Field>

      <Field label="Party date *">
        <input
          type="date"
          value={form.eventDate}
          onChange={(e) => set("eventDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className={inputClass}
        />
      </Field>

      <Field label="What time do you want to start painting? *">
        <input
          type="time"
          value={form.startTime}
          onChange={(e) => set("startTime", e.target.value)}
          className={inputClass}
        />
        <Hint>The session lasts about 1½ hours.</Hint>
      </Field>

      <Field label="How many painters? *">
        <select
          value={form.painters}
          onChange={(e) => set("painters", e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {Array.from({ length: MAX_PAINTERS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} painter{n === 1 ? "" : "s"}</option>
          ))}
        </select>
        <Hint>${PRICE_PER_PAINTER} per painter · up to {MAX_PAINTERS}.</Hint>
      </Field>

      <Field label="Event theme *">
        <Input placeholder='e.g. "Sweet 16" or "Bachelorette — spring florals"' value={form.theme} onChange={(v) => set("theme", v)} />
      </Field>

      <Field label="Inspo ideas for paintings">
        <textarea
          rows={3}
          placeholder="What would you like everyone to paint? Describe ideas, colors, styles, or the vibe you're going for."
          value={form.inspo}
          onChange={(e) => set("inspo", e.target.value)}
          className={`${inputClass} resize-none`}
        />
        <p className="font-display text-[10px] text-[#5A8A70] mt-2 mb-2">Have photos? Upload up to 10 inspo pictures (optional).</p>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors font-display text-sm font-semibold"
          style={{ borderColor: BORDER, color: "#5A8A70" }}>
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

      <Field label="Other details">
        <textarea
          rows={2}
          placeholder="Anything else I should know — kids or adults, allergies, parking, indoor/outdoor space..."
          value={form.otherNotes}
          onChange={(e) => set("otherNotes", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <button
        type="button"
        onClick={onNext}
        disabled={!canAdvance}
        className="w-full py-3.5 rounded-full font-display font-bold text-sm text-white transition-all mt-2"
        style={{ background: canAdvance ? ACCENT : BORDER }}
      >
        Continue
      </button>
    </div>
  );
}

/* ── Step 2: details + book ── */
function Step2({ form, canSubmit, submitting, error, onBack, onSubmit }: {
  form: FormData;
  canSubmit: boolean;
  submitting: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const painters = Number(form.painters) || 0;
  const estimate = painters * PRICE_PER_PAINTER;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="font-display font-bold text-[#1F3D2E] text-lg">Details & booking</h2>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/painting-party-details.png"
        alt="Details and how it works: a guided painting class led by Sophia for any occasion. All materials and supplies provided excluding tables and chairs. Up to 8 painters. 1½ hour session."
        className="w-full rounded-xl"
        style={{ border: `1.5px solid ${BORDER}` }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/painting-party-pricing.png"
        alt="Details and how it works: your choice of painting for the occasion. You provide a painting space, chairs and tables. $30 per painter. At your chosen party location (local, Oklahoma)."
        className="w-full rounded-xl"
        style={{ border: `1.5px solid ${BORDER}` }}
      />

      <div className="rounded-2xl p-4 text-xs font-display"
        style={{ background: ACCENT_BG, border: `1.5px solid ${BORDER}` }}>
        <p className="font-bold text-sm mb-1.5" style={{ color: ACCENT }}>📍 Local parties only</p>
        <p className="text-[#2E5A44]">
          If my commute to your party is longer than <strong>35 minutes</strong>, an extra fee will be charged — I&apos;ll include it in your invoice.
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4 text-xs font-display space-y-1.5"
        style={{ background: "#F6FBF7", border: `1px solid ${BORDER}` }}>
        <p className="font-bold text-sm text-[#1F3D2E] mb-2">Party summary</p>
        <Row label="Name" value={form.name} />
        <Row label="Phone" value={form.phone} />
        <Row label="Address" value={form.address} />
        <Row label="Date" value={form.eventDate} />
        <Row label="Start time" value={form.startTime ? formatTime(form.startTime) : ""} />
        <Row label="Painters" value={String(painters)} />
        <Row label="Theme" value={form.theme} />
        <Row label="Painting ideas" value={form.inspo} />
        <Row label="Other details" value={form.otherNotes} />
        {painters > 0 && (
          <div className="flex gap-3 justify-between pt-2 mt-1 border-t" style={{ borderColor: BORDER }}>
            <span className="text-[#5A8A70] font-bold">Estimate:</span>
            <span className="text-[#1F3D2E] font-bold text-right">
              ${estimate} <span className="font-normal text-[#5A8A70]">({painters} × ${PRICE_PER_PAINTER}, plus travel fee if over 35 min)</span>
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-display text-red-500 text-center">{error}</p>}

      <div className="flex gap-3 mt-1">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-full font-display font-semibold text-sm border text-[#5A8A70] transition-all"
          style={{ borderColor: BORDER }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
          style={{ background: canSubmit ? ACCENT : BORDER }}
        >
          {submitting ? "Booking..." : "Book a Painting Party"}
        </button>
      </div>
    </form>
  );
}

/* ── Success ── */
function SuccessScreen({ name }: { name: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(160deg, #F6FBF7 0%, #EAF6EE 60%, #DDF0E4 100%)" }}>
      <div className="text-6xl mb-6">🎨</div>
      <h1 className="font-script text-4xl mb-3" style={{ color: ACCENT }}>Party request sent!</h1>
      <p className="font-display text-sm text-[#2E5A44] max-w-xs mb-1">
        Thanks {name}! Your painting party request is in.
      </p>

      <div className="bg-white/80 rounded-2xl p-5 mt-4 max-w-xs text-left text-xs font-display text-[#2E5A44] space-y-2.5 border" style={{ borderColor: BORDER }}>
        <p className="font-bold text-sm text-[#1F3D2E] mb-1">What happens next:</p>
        <p>1️⃣ <strong>Text 405-243-1461</strong> to confirm your party.</p>
        <p>2️⃣ Sophia will confirm the details, including any travel fee if the drive is over 35 minutes.</p>
      </div>

      <Link href="/linktree" className="mt-8 px-8 py-3 rounded-full font-display font-bold text-sm text-white"
        style={{ background: ACCENT }}>
        Back to links
      </Link>
    </main>
  );
}

/* ── Shared helpers ── */
const inputClass =
  "w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#1F3D2E] bg-white mt-1 outline-none focus:border-[#4F9E78] border-[#CFE5D6]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display font-semibold text-xs text-[#2E5A44]">{label}</p>
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
      className={inputClass}
    />
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-display text-[#5A8A70] mt-1">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 justify-between">
      <span className="text-[#5A8A70] flex-shrink-0">{label}:</span>
      <span className="text-[#1F3D2E] text-right break-words max-w-[60%]">{value}</span>
    </div>
  );
}
