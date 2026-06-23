"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3;

const JEAN_STYLES = [
  { label: "Straight Leg", desc: "Classic straight cut" },
  { label: "Bootcut", desc: "Slight flare at ankle" },
  { label: "Wide Leg", desc: "Relaxed wide-leg fit" },
  { label: "Skinny", desc: "Slim fitted style" },
  { label: "I'll provide my own", desc: "Ship or bring your jeans" },
];

const PLACEMENT_OPTIONS = [
  "Leg (one side)", "Leg (both sides)", "Back pocket area",
  "Waistband", "Full leg wrap", "Custom placement",
];

const COLOR_OPTIONS = [
  { name: "Magenta Pink", hex: "#D4437A" },
  { name: "Lavender", hex: "#C5A8D5" },
  { name: "Sage Green", hex: "#7ECBA3" },
  { name: "Butter Yellow", hex: "#F4D06F" },
  { name: "Coral", hex: "#F4A88A" },
  { name: "Sky Blue", hex: "#A8D8EA" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gold", hex: "#D4AF37" },
];

interface FormData {
  jeanStyle: string;
  size: string;
  placement: string;
  textToPaint: string;
  schoolName: string;
  graduationYear: string;
  colors: string[];
  dueDate: string;
  addOns: string[];
  notes: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
}

const empty: FormData = {
  jeanStyle: "",
  size: "",
  placement: "",
  textToPaint: "",
  schoolName: "",
  graduationYear: "",
  colors: [],
  dueDate: "",
  addOns: [],
  notes: "",
  name: "",
  email: "",
  phone: "",
  instagram: "",
};

export default function JeansOrderPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggleColor(name: string) {
    set("colors", form.colors.includes(name) ? form.colors.filter((c) => c !== name) : [...form.colors, name]);
  }
  function toggleAddOn(name: string) {
    set("addOns", form.addOns.includes(name) ? form.addOns.filter((a) => a !== name) : [...form.addOns, name]);
  }

  function canAdvance1() { return form.jeanStyle && form.size && form.placement; }
  function canAdvance2() { return form.textToPaint.trim() && form.colors.length > 0 && form.dueDate; }
  function canSubmit() { return form.name.trim() && form.email.trim() && form.phone.trim(); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, product: "senior-jeans" }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or DM @signsby.sophia on Instagram.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <SuccessScreen name={form.name} />;

  return (
    <main
      className="min-h-screen py-12 px-4"
      style={{ background: "linear-gradient(160deg, #F8F0FF 0%, #F0E8F8 60%, #EDD8F8 100%)" }}
    >
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/linktree" className="inline-flex items-center gap-1 text-xs font-display text-[#9A607A] mb-6">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-script text-4xl mb-1" style={{ color: "#9B5DC8" }}>Order Senior Jeans</h1>
          <p className="font-display text-sm text-[#8A5070]">Custom hand-painted denim for graduation season</p>
        </div>

        <StepBar step={step} steps={["Style", "Design", "Contact"]} accent="#9B5DC8" />

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 mt-6 border border-[#E0D0F0]">
          {step === 1 && (
            <Step1 form={form} set={set} onNext={() => setStep(2)} canAdvance={!!canAdvance1()} />
          )}
          {step === 2 && (
            <Step2 form={form} set={set} toggleColor={toggleColor} toggleAddOn={toggleAddOn} onBack={() => setStep(1)} onNext={() => setStep(3)} canAdvance={!!canAdvance2()} />
          )}
          {step === 3 && (
            <Step3 form={form} set={set} onBack={() => setStep(2)} onSubmit={handleSubmit} canSubmit={!!canSubmit()} submitting={submitting} error={error} />
          )}
        </div>
      </div>
    </main>
  );
}

function StepBar({ step, steps, accent }: { step: number; steps: string[]; accent: string }) {
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
                style={{ background: done || active ? accent : "#E0D0F0", color: done || active ? "white" : "#8A5070" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-display mt-1" style={{ color: active ? accent : "#9A607A" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-0.5 mb-4 rounded-full" style={{ background: done ? accent : "#E0D0F0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ form, set, onNext, canAdvance }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Tell me about your jeans</h2>

      <div>
        <Label>Jean style *</Label>
        <div className="flex flex-col gap-2 mt-2">
          {JEAN_STYLES.map((s) => (
            <button key={s.label} type="button" onClick={() => set("jeanStyle", s.label)}
              className="flex items-center justify-between p-3 rounded-xl border text-left transition-all"
              style={form.jeanStyle === s.label ? { background: "#F0E8F8", borderColor: "#9B5DC8" } : { background: "white", borderColor: "#E0D0F0" }}>
              <p className="font-display font-bold text-xs text-[#3D1830]">{s.label}</p>
              <p className="font-display text-[10px] text-[#8A5070]">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Jean size * <span className="text-[10px] font-normal text-[#9A607A]">(if we're sourcing them)</span></Label>
        <Input placeholder='e.g. "28x30", "Size 6", "XL"' value={form.size} onChange={(v) => set("size", v)} accent="#9B5DC8" />
      </div>

      <div>
        <Label>Where should the design go? *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {PLACEMENT_OPTIONS.map((p) => (
            <button key={p} type="button" onClick={() => set("placement", p)}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold border transition-all"
              style={form.placement === p ? { background: "#9B5DC8", color: "white", borderColor: "#9B5DC8" } : { background: "white", color: "#8A5070", borderColor: "#E0D0F0" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <NextBtn onClick={onNext} disabled={!canAdvance} accent="#9B5DC8" />
    </div>
  );
}

function Step2({ form, set, toggleColor, toggleAddOn, onBack, onNext, canAdvance }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  toggleColor: (n: string) => void;
  toggleAddOn: (n: string) => void;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Design details</h2>

      <div>
        <Label>Text to paint on the jeans *</Label>
        <textarea rows={2} placeholder={'e.g. "Emma · Class of \'26"\nor "Sophia Santos · NWHS"'}
          value={form.textToPaint}
          onChange={(e) => set("textToPaint", e.target.value)}
          className="w-full border border-[#E0D0F0] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none resize-none" />
      </div>

      <div>
        <Label>School name (optional)</Label>
        <Input placeholder="Norman North High School" value={form.schoolName} onChange={(v) => set("schoolName", v)} accent="#9B5DC8" />
      </div>

      <div>
        <Label>Graduation year (optional)</Label>
        <Input placeholder="2026" value={form.graduationYear} onChange={(v) => set("graduationYear", v)} accent="#9B5DC8" />
      </div>

      <div>
        <Label>Paint colors * <span className="text-[10px] font-normal">(select all that apply)</span></Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {COLOR_OPTIONS.map((c) => {
            const selected = form.colors.includes(c.name);
            return (
              <button key={c.name} type="button" onClick={() => toggleColor(c.name)} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full border-2 transition-all"
                  style={{ background: c.hex, borderColor: selected ? "#9B5DC8" : "#E0D0F0", boxShadow: selected ? "0 0 0 2px #9B5DC844" : "none", outline: c.hex === "#FFFFFF" ? "1px solid #E0D0F0" : "none" }} />
                <span className="text-[9px] font-display text-[#8A5070] text-center leading-tight">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Add-ons (optional)</Label>
        <div className="flex flex-col gap-2 mt-2">
          {["School logo/mascot", "Flowers or floral accents", "Glitter paint", "Rush order (within 5 days)"].map((a) => (
            <label key={a} className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0"
                style={form.addOns.includes(a) ? { background: "#9B5DC8", borderColor: "#9B5DC8" } : { background: "white", borderColor: "#E0D0F0" }}
                onClick={() => toggleAddOn(a)}>
                {form.addOns.includes(a) && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className="font-display text-xs text-[#3D1830]">{a}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>When do you need them by? *</Label>
        <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border border-[#E0D0F0] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none" />
      </div>

      <div>
        <Label>Additional notes (optional)</Label>
        <textarea rows={2} placeholder="Inspo, color palette images, special requests..."
          value={form.notes} onChange={(e) => set("notes", e.target.value)}
          className="w-full border border-[#E0D0F0] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none resize-none" />
      </div>

      <div className="flex gap-3">
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!canAdvance} accent="#9B5DC8" />
      </div>
    </div>
  );
}

function Step3({ form, set, onBack, onSubmit, canSubmit, submitting, error }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  canSubmit: boolean;
  submitting: boolean;
  error: string;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Your contact info</h2>
      <div><Label>Full name *</Label><Input placeholder="Your name" value={form.name} onChange={(v) => set("name", v)} accent="#9B5DC8" /></div>
      <div><Label>Email address *</Label><Input type="email" placeholder="you@example.com" value={form.email} onChange={(v) => set("email", v)} accent="#9B5DC8" /></div>
      <div><Label>Phone number *</Label><Input type="tel" placeholder="(405) 555-0100" value={form.phone} onChange={(v) => set("phone", v)} accent="#9B5DC8" /></div>
      <div><Label>Instagram handle (optional)</Label><Input placeholder="@yourhandle" value={form.instagram} onChange={(v) => set("instagram", v)} accent="#9B5DC8" /></div>

      <div className="rounded-2xl p-4 text-xs font-display text-[#3D1830] space-y-1.5"
        style={{ background: "#F0E8F8", border: "1px solid #C5A8D544" }}>
        <p className="font-bold text-sm mb-2" style={{ color: "#9B5DC8" }}>Order Summary</p>
        <Row label="Style" value={form.jeanStyle} />
        <Row label="Size" value={form.size} />
        <Row label="Placement" value={form.placement} />
        <Row label="Text" value={form.textToPaint} />
        {form.schoolName && <Row label="School" value={form.schoolName} />}
        {form.graduationYear && <Row label="Grad year" value={form.graduationYear} />}
        <Row label="Colors" value={form.colors.join(", ")} />
        <Row label="Needed by" value={form.dueDate} />
      </div>

      {error && <p className="text-xs font-display text-red-500 text-center">{error}</p>}

      <div className="flex gap-3">
        <BackBtn onClick={onBack} />
        <button type="submit" disabled={!canSubmit || submitting}
          className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
          style={{ background: canSubmit && !submitting ? "#9B5DC8" : "#E0D0F0" }}>
          {submitting ? "Sending..." : "Submit Order"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#8A5070] flex-shrink-0">{label}:</span>
      <span className="text-[#3D1830] text-right">{value}</span>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-display font-semibold text-xs text-[#6B3058]">{children}</p>;
}
function Input({ placeholder, value, onChange, type = "text", accent }: { placeholder: string; value: string; onChange: (v: string) => void; type?: string; accent: string; }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-[#E0D0F0] rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none"
      style={{ borderColor: "#E0D0F0" }}
      onFocus={(e) => { e.target.style.borderColor = accent; }}
      onBlur={(e) => { e.target.style.borderColor = "#E0D0F0"; }} />
  );
}
function NextBtn({ onClick, disabled, accent }: { onClick: () => void; disabled: boolean; accent: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
      style={{ background: disabled ? "#E0D0F0" : accent }}>
      Continue
    </button>
  );
}
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="px-5 py-3.5 rounded-full font-display font-semibold text-sm border border-[#E0D0F0] text-[#9A607A] hover:border-[#9A607A] transition-all">
      Back
    </button>
  );
}
function SuccessScreen({ name }: { name: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(160deg, #F8F0FF 0%, #F0E8F8 60%, #EDD8F8 100%)" }}>
      <div className="text-6xl mb-6">👖</div>
      <h1 className="font-script text-4xl mb-3" style={{ color: "#9B5DC8" }}>Order received!</h1>
      <p className="font-display text-sm text-[#6B3058] max-w-xs mb-2">
        Thanks {name}! Sophia will reach out within 24–48 hours to confirm and discuss your jeans design.
      </p>
      <p className="font-display text-xs text-[#9A607A] mb-8">DM <strong>@signsby.sophia</strong> on Instagram with questions.</p>
      <Link href="/linktree" className="px-8 py-3 rounded-full font-display font-bold text-sm text-white" style={{ background: "#9B5DC8" }}>
        Back to links
      </Link>
    </main>
  );
}
