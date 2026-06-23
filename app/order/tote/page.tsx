"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3;

const TOTE_STYLES = [
  { label: "Natural Canvas", desc: "Classic tan canvas tote" },
  { label: "Black Canvas", desc: "Bold black base" },
  { label: "White Canvas", desc: "Clean white base" },
  { label: "I'll provide my own", desc: "Ship or bring your tote" },
];

const TOTE_SIZES = [
  { label: "Small", desc: "10\" × 12\"" },
  { label: "Medium", desc: "14\" × 16\" (most popular)" },
  { label: "Large", desc: "18\" × 20\"" },
];

const OCCASIONS = [
  "Birthday Gift", "Bridesmaid Gift", "Teacher Gift", "Graduation",
  "Baby Shower", "Bachelorette", "Holiday Gift", "Just Because", "Other",
];

const COLOR_OPTIONS = [
  { name: "Magenta Pink", hex: "#D4437A" },
  { name: "Lavender", hex: "#C5A8D5" },
  { name: "Sage Green", hex: "#7ECBA3" },
  { name: "Butter Yellow", hex: "#F4D06F" },
  { name: "Coral", hex: "#F4A88A" },
  { name: "Sky Blue", hex: "#A8D8EA" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#2D2D2D" },
];

interface FormData {
  toteStyle: string;
  toteSize: string;
  occasion: string;
  quantity: string;
  textToPaint: string;
  colors: string[];
  addFloral: boolean;
  addGlitter: boolean;
  dueDate: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  instagram: string;
}

const empty: FormData = {
  toteStyle: "",
  toteSize: "",
  occasion: "",
  quantity: "1",
  textToPaint: "",
  colors: [],
  addFloral: false,
  addGlitter: false,
  dueDate: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
  instagram: "",
};

const ACCENT = "#E8923A";
const LIGHT_BG = "#FEF0E8";
const BORDER = "#F4D8C4";

export default function ToteOrderPage() {
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

  function canAdvance1() { return form.toteStyle && form.toteSize && form.occasion; }
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
        body: JSON.stringify({ ...form, product: "tote-bag" }),
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
    <main className="min-h-screen py-12 px-4"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FEF0E0 60%, #FDE4C8 100%)" }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/linktree" className="inline-flex items-center gap-1 text-xs font-display text-[#9A607A] mb-6">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="font-script text-4xl mb-1" style={{ color: ACCENT }}>Order a Tote Bag</h1>
          <p className="font-display text-sm text-[#8A5070]">Hand-painted canvas totes & custom gifts</p>
        </div>

        <StepBar step={step} steps={["Style", "Design", "Contact"]} />

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-sm p-6 mt-6" style={{ border: `1px solid ${BORDER}` }}>
          {step === 1 && (
            <Step1 form={form} set={set} onNext={() => setStep(2)} canAdvance={!!canAdvance1()} />
          )}
          {step === 2 && (
            <Step2 form={form} set={set} toggleColor={toggleColor} onBack={() => setStep(1)} onNext={() => setStep(3)} canAdvance={!!canAdvance2()} />
          )}
          {step === 3 && (
            <Step3 form={form} set={set} onBack={() => setStep(2)} onSubmit={handleSubmit} canSubmit={!!canSubmit()} submitting={submitting} error={error} />
          )}
        </div>
      </div>
    </main>
  );
}

function StepBar({ step, steps }: { step: number; steps: string[] }) {
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
                style={{ background: done || active ? ACCENT : BORDER, color: done || active ? "white" : "#9A607A" }}>
                {done ? "✓" : n}
              </div>
              <span className="text-[10px] font-display mt-1" style={{ color: active ? ACCENT : "#9A607A" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 h-0.5 mb-4 rounded-full" style={{ background: done ? ACCENT : BORDER }} />
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
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Choose your tote</h2>

      <div>
        <Label>Tote base color *</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {TOTE_STYLES.map((s) => (
            <button key={s.label} type="button" onClick={() => set("toteStyle", s.label)}
              className="p-3 rounded-xl border text-left transition-all"
              style={form.toteStyle === s.label ? { background: LIGHT_BG, borderColor: ACCENT } : { background: "white", borderColor: BORDER }}>
              <p className="font-display font-bold text-xs text-[#3D1830]">{s.label}</p>
              <p className="font-display text-[10px] text-[#8A5070] mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Size *</Label>
        <div className="flex flex-col gap-2 mt-2">
          {TOTE_SIZES.map((s) => (
            <button key={s.label} type="button" onClick={() => set("toteSize", s.label)}
              className="flex items-center justify-between p-3 rounded-xl border transition-all"
              style={form.toteSize === s.label ? { background: LIGHT_BG, borderColor: ACCENT } : { background: "white", borderColor: BORDER }}>
              <span className="font-display font-bold text-xs text-[#3D1830]">{s.label}</span>
              <span className="font-display text-[10px] text-[#8A5070]">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Occasion *</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {OCCASIONS.map((o) => (
            <button key={o} type="button" onClick={() => set("occasion", o)}
              className="px-3 py-1.5 rounded-full text-xs font-display font-semibold border transition-all"
              style={form.occasion === o ? { background: ACCENT, color: "white", borderColor: ACCENT } : { background: "white", color: "#8A5070", borderColor: BORDER }}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Quantity</Label>
        <select className="w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none"
          style={{ borderColor: BORDER }}
          value={form.quantity} onChange={(e) => set("quantity", e.target.value)}>
          {["1","2","3","4","5","6","7","8","9","10+"].map((q) => <option key={q}>{q}</option>)}
        </select>
      </div>

      <NextBtn onClick={onNext} disabled={!canAdvance} />
    </div>
  );
}

function Step2({ form, set, toggleColor, onBack, onNext, canAdvance }: {
  form: FormData;
  set: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  toggleColor: (n: string) => void;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display font-bold text-[#3D1830] text-lg">Design your tote</h2>

      <div>
        <Label>Text to paint on the tote *</Label>
        <textarea rows={3} placeholder={'e.g. "Emma\'s Beach Tote"\nor "Bride Squad 2026"\nor initials like "EML"'}
          value={form.textToPaint} onChange={(e) => set("textToPaint", e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none resize-none"
          style={{ borderColor: BORDER }} />
      </div>

      <div>
        <Label>Paint colors * <span className="text-[10px] font-normal">(select all that apply)</span></Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {COLOR_OPTIONS.map((c) => {
            const selected = form.colors.includes(c.name);
            return (
              <button key={c.name} type="button" onClick={() => toggleColor(c.name)} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full border-2 transition-all"
                  style={{ background: c.hex, borderColor: selected ? ACCENT : BORDER, boxShadow: selected ? `0 0 0 2px ${ACCENT}44` : "none", outline: c.hex === "#FFFFFF" ? `1px solid ${BORDER}` : "none" }} />
                <span className="text-[9px] font-display text-[#8A5070] text-center leading-tight">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <Label>Add-ons (optional)</Label>
        <div className="flex flex-col gap-2 mt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox checked={form.addFloral} onChange={(v) => set("addFloral", v)} />
            <span className="font-display text-xs text-[#3D1830]">Floral accents / botanical details</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox checked={form.addGlitter} onChange={(v) => set("addGlitter", v)} />
            <span className="font-display text-xs text-[#3D1830]">Glitter / metallic paint</span>
          </label>
        </div>
      </div>

      <div>
        <Label>When do you need it by? *</Label>
        <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none"
          style={{ borderColor: BORDER }} />
      </div>

      <div>
        <Label>Notes or inspo links (optional)</Label>
        <textarea rows={2} placeholder="Any special requests, color swatches, or reference images..."
          value={form.notes} onChange={(e) => set("notes", e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none resize-none"
          style={{ borderColor: BORDER }} />
      </div>

      <div className="flex gap-3">
        <BackBtn onClick={onBack} />
        <NextBtn onClick={onNext} disabled={!canAdvance} />
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
      <div><Label>Full name *</Label><TextInput placeholder="Your name" value={form.name} onChange={(v) => set("name", v)} /></div>
      <div><Label>Email address *</Label><TextInput type="email" placeholder="you@example.com" value={form.email} onChange={(v) => set("email", v)} /></div>
      <div><Label>Phone number *</Label><TextInput type="tel" placeholder="(405) 555-0100" value={form.phone} onChange={(v) => set("phone", v)} /></div>
      <div><Label>Instagram handle (optional)</Label><TextInput placeholder="@yourhandle" value={form.instagram} onChange={(v) => set("instagram", v)} /></div>

      <div className="rounded-2xl p-4 text-xs font-display text-[#3D1830] space-y-1.5"
        style={{ background: LIGHT_BG, border: `1px solid ${BORDER}` }}>
        <p className="font-bold text-sm mb-2" style={{ color: ACCENT }}>Order Summary</p>
        <Row label="Tote" value={form.toteStyle} />
        <Row label="Size" value={form.toteSize} />
        <Row label="Occasion" value={form.occasion} />
        <Row label="Qty" value={form.quantity} />
        <Row label="Text" value={form.textToPaint} />
        <Row label="Colors" value={form.colors.join(", ")} />
        {form.addFloral && <Row label="Add-on" value="Floral accents" />}
        {form.addGlitter && <Row label="Add-on" value="Glitter paint" />}
        <Row label="Needed by" value={form.dueDate} />
      </div>

      {error && <p className="text-xs font-display text-red-500 text-center">{error}</p>}

      <div className="flex gap-3">
        <BackBtn onClick={onBack} />
        <button type="submit" disabled={!canSubmit || submitting}
          className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
          style={{ background: canSubmit && !submitting ? ACCENT : BORDER }}>
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
function TextInput({ placeholder, value, onChange, type = "text" }: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-xl px-3 py-2.5 text-sm font-display text-[#3D1830] bg-white mt-1 outline-none"
      style={{ borderColor: BORDER }} />
  );
}
function Checkbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer"
      style={checked ? { background: ACCENT, borderColor: ACCENT } : { background: "white", borderColor: BORDER }}
      onClick={() => onChange(!checked)}>
      {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
    </div>
  );
}
function NextBtn({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="flex-1 py-3.5 rounded-full font-display font-bold text-sm text-white transition-all"
      style={{ background: disabled ? BORDER : ACCENT }}>
      Continue
    </button>
  );
}
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="px-5 py-3.5 rounded-full font-display font-semibold text-sm border text-[#9A607A] transition-all"
      style={{ borderColor: BORDER }}>
      Back
    </button>
  );
}
function SuccessScreen({ name }: { name: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FEF0E0 60%, #FDE4C8 100%)" }}>
      <div className="text-6xl mb-6">👜</div>
      <h1 className="font-script text-4xl mb-3" style={{ color: ACCENT }}>Order received!</h1>
      <p className="font-display text-sm text-[#6B3058] max-w-xs mb-2">
        Thanks {name}! Sophia will reach out within 24–48 hours to confirm and discuss your tote design.
      </p>
      <p className="font-display text-xs text-[#9A607A] mb-8">DM <strong>@signsby.sophia</strong> on Instagram with questions.</p>
      <Link href="/linktree" className="px-8 py-3 rounded-full font-display font-bold text-sm text-white" style={{ background: ACCENT }}>
        Back to links
      </Link>
    </main>
  );
}
