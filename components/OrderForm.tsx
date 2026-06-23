"use client";

import { useState, useRef, useEffect } from "react";

const PRODUCTS = [
  { id: "banner", label: "Brown Paper Banner", emoji: "🎉" },
  { id: "linen-banner", label: "Linen Banner", emoji: "✨" },
  { id: "senior-jeans", label: "Senior Jeans", emoji: "👖" },
  { id: "tote-bag", label: "Tote Bag", emoji: "👜" },
  { id: "classroom-decor", label: "Classroom Decor", emoji: "🍎" },
  { id: "how-to-book", label: "How-To Book", emoji: "📖" },
];

const OCCASIONS = [
  "Graduation", "Birthday", "Bachelorette", "Baby Shower",
  "Wedding", "Senior Year", "Classroom", "Other",
];

const SIZES: Record<string, string[]> = {
  banner: ["2ft x 5ft", "2ft x 8ft", "2ft x 10ft", "2ft x 12ft", "Custom"],
  "linen-banner": ["2ft x 5ft", "2ft x 8ft", "Custom"],
  "senior-jeans": ["XS", "S", "M", "L", "XL", "XXL"],
  "tote-bag": ["Standard", "Large"],
  "classroom-decor": ["Small sign", "Full banner", "Custom set"],
  "how-to-book": ["Digital PDF", "Printed copy"],
};

interface FormData {
  product: string;
  occasion: string;
  name: string;
  email: string;
  phone: string;
  nameOnItem: string;
  colors: string;
  text: string;
  size: string;
  dueDate: string;
  notes: string;
}

const empty: FormData = {
  product: "banner",
  occasion: "",
  name: "",
  email: "",
  phone: "",
  nameOnItem: "",
  colors: "",
  text: "",
  size: "",
  dueDate: "",
  notes: "",
};

export default function OrderForm({
  initialProduct,
}: {
  initialProduct?: string;
}) {
  const [form, setForm] = useState<FormData>({
    ...empty,
    product: initialProduct || "banner",
  });
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  // Sync external product selection
  useEffect(() => {
    if (initialProduct) {
      setForm((f) => ({ ...f, product: initialProduct }));
      setStep(1);
    }
  }, [initialProduct]);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setSubmitted(true);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setError("Something went wrong — please try again or DM @signsby.sophia on Instagram.");
    } finally {
      setLoading(false);
    }
  }

  const selectedProduct = PRODUCTS.find((p) => p.id === form.product);
  const sizes = SIZES[form.product] || [];

  return (
    <section id="order" className="py-20 px-5" ref={topRef}
      style={{ background: "linear-gradient(to bottom, #FDEEE0, #FFF8F0)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-display text-xs font-bold tracking-widest uppercase text-[#9A607A] mb-2">
            Let's get started
          </p>
          <h2 className="font-script text-5xl md:text-6xl" style={{ color: "#3D1830" }}>
            Place your order
          </h2>
          <p className="font-display text-[#6B3058] mt-3 text-base">
            Fill this out and you'll hear back within 48 hours to confirm your order and pricing.
          </p>
        </div>

        {submitted ? (
          <SuccessCard onReset={() => { setSubmitted(false); setForm(empty); setStep(1); }} />
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-7 md:p-10 border border-[#F4D06F]/30">
            {/* Progress */}
            <StepProgress step={step} />

            <form onSubmit={handleSubmit} className="mt-8">
              {/* Step 1: Product + Occasion */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-display font-bold text-sm text-[#3D1830] mb-3">
                      What would you like? <span className="text-[#D4437A]">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {PRODUCTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => set("product", p.id)}
                          className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all text-center ${
                            form.product === p.id
                              ? "border-[#D4437A] bg-[#FDE8F0]"
                              : "border-[#F0D0E0] bg-[#FFF8F0] hover:border-[#D4437A]/50"
                          }`}
                        >
                          <span className="text-2xl">{p.emoji}</span>
                          <span className="font-display text-xs font-semibold text-[#3D1830] leading-tight">
                            {p.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-bold text-sm text-[#3D1830] mb-2">
                      What's the occasion? <span className="text-[#D4437A]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => set("occasion", o)}
                          className={`px-4 py-2 rounded-full border-2 font-display text-sm font-semibold transition-all ${
                            form.occasion === o
                              ? "border-[#D4437A] bg-[#D4437A] text-white"
                              : "border-[#F0D0E0] text-[#3D1830] hover:border-[#D4437A]/50"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-bold text-sm text-[#3D1830] mb-2">
                      Size {sizes.length > 0 && <span className="text-[#D4437A]">*</span>}
                    </label>
                    {sizes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => set("size", s)}
                            className={`px-4 py-2 rounded-full border-2 font-display text-sm font-semibold transition-all ${
                              form.size === s
                                ? "border-[#7ECBA3] bg-[#7ECBA3] text-white"
                                : "border-[#F0D0E0] text-[#3D1830] hover:border-[#7ECBA3]/50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <NextButton
                    onClick={() => setStep(2)}
                    disabled={!form.product || !form.occasion || (sizes.length > 0 && !form.size)}
                  />
                </div>
              )}

              {/* Step 2: Customization details */}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="font-script text-2xl" style={{ color: "#D4437A" }}>
                    All about your {selectedProduct?.label.toLowerCase()}
                  </p>

                  <Field
                    label="Name(s) to include on the item"
                    placeholder="e.g. Kennedy, Class of 2026"
                    value={form.nameOnItem}
                    onChange={(v) => set("nameOnItem", v)}
                    required
                  />

                  <Field
                    label="Colors / theme"
                    placeholder="e.g. OSU orange + white, hot pink + lemon, boho floral"
                    value={form.colors}
                    onChange={(v) => set("colors", v)}
                    required
                  />

                  <TextareaField
                    label="Any specific text for the banner?"
                    placeholder="e.g. 'Freshly Graduated · Class of 2026 · Norman, OK 73072'"
                    value={form.text}
                    onChange={(v) => set("text", v)}
                  />

                  <Field
                    label="When do you need it?"
                    type="date"
                    value={form.dueDate}
                    onChange={(v) => set("dueDate", v)}
                    required
                  />

                  <TextareaField
                    label="Anything else? (inspo photos, school, zip code, special requests)"
                    placeholder="Share any extra details, vibes, or inspo!"
                    value={form.notes}
                    onChange={(v) => set("notes", v)}
                  />

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-full border-2 border-[#F0D0E0] font-display font-bold text-[#3D1830] text-sm hover:border-[#9A607A] transition-colors"
                    >
                      Back
                    </button>
                    <NextButton
                      label="Next: Your info →"
                      onClick={() => setStep(3)}
                      disabled={!form.nameOnItem || !form.colors || !form.dueDate}
                      className="flex-[2]"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Contact info */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="font-script text-2xl" style={{ color: "#D4437A" }}>
                    Last step — your contact info
                  </p>

                  <Field
                    label="Your name"
                    placeholder="First & last name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    required
                  />

                  <Field
                    label="Email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    required
                  />

                  <Field
                    label="Phone (optional but appreciated!)"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                  />

                  {error && (
                    <p className="text-sm font-display text-red-500 bg-red-50 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  {/* Order summary */}
                  <div className="rounded-2xl p-5 space-y-2" style={{ backgroundColor: "#FFF8F0", border: "1px solid #F4D06F" }}>
                    <p className="font-display font-bold text-sm text-[#3D1830]">Order summary</p>
                    <SummaryRow label="Product" value={`${selectedProduct?.emoji} ${selectedProduct?.label}`} />
                    {form.size && <SummaryRow label="Size" value={form.size} />}
                    <SummaryRow label="Occasion" value={form.occasion} />
                    <SummaryRow label="Name(s)" value={form.nameOnItem} />
                    <SummaryRow label="Colors" value={form.colors} />
                    <SummaryRow label="Due date" value={form.dueDate} />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 py-3.5 rounded-full border-2 border-[#F0D0E0] font-display font-bold text-[#3D1830] text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !form.name || !form.email}
                      className="flex-[2] py-3.5 rounded-full font-display font-bold text-base text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                      style={{ backgroundColor: "#D4437A" }}
                    >
                      {loading ? "Sending..." : "Send Order Request ✨"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

function StepProgress({ step }: { step: number }) {
  const labels = ["Choose product", "Customize", "Your info"];
  return (
    <div className="flex items-center gap-0">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all ${
                  done
                    ? "bg-[#7ECBA3] text-white"
                    : active
                    ? "bg-[#D4437A] text-white"
                    : "bg-[#F0D0E0] text-[#9A607A]"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span className={`text-xs font-display font-semibold hidden sm:block ${active ? "text-[#D4437A]" : "text-[#9A607A]"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mt-[-12px]"
                style={{ backgroundColor: done ? "#7ECBA3" : "#F0D0E0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange, required,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block font-display font-bold text-sm text-[#3D1830] mb-1.5">
        {label} {required && <span className="text-[#D4437A]">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border-2 border-[#F0D0E0] bg-[#FFF8F0] px-4 py-3 font-display text-sm text-[#3D1830] placeholder:text-[#C4889A] focus:border-[#D4437A] focus:outline-none transition-colors"
      />
    </div>
  );
}

function TextareaField({
  label, placeholder, value, onChange,
}: {
  label: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block font-display font-bold text-sm text-[#3D1830] mb-1.5">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-xl border-2 border-[#F0D0E0] bg-[#FFF8F0] px-4 py-3 font-display text-sm text-[#3D1830] placeholder:text-[#C4889A] focus:border-[#D4437A] focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="font-display text-[#9A607A] w-24 shrink-0">{label}</span>
      <span className="font-display font-semibold text-[#3D1830]">{value}</span>
    </div>
  );
}

function NextButton({
  label = "Next →",
  onClick,
  disabled,
  className = "w-full",
}: {
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} py-3.5 rounded-full font-display font-bold text-base text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95`}
      style={{ backgroundColor: "#D4437A" }}
    >
      {label}
    </button>
  );
}

function SuccessCard({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-10 text-center border border-[#F4D06F]/30">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="font-script text-4xl mb-3" style={{ color: "#D4437A" }}>
        Order request sent!
      </h3>
      <p className="font-display text-[#3D1830] text-base leading-relaxed max-w-sm mx-auto">
        Sophia will be in touch within 48 hours to confirm the details and send pricing. Can't wait to make something special for you!
      </p>
      <p className="mt-4 font-display text-sm text-[#9A607A]">
        Questions in the meantime? DM{" "}
        <a
          href="https://instagram.com/signsby.sophia"
          className="font-bold underline decoration-dotted"
          style={{ color: "#D4437A" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          @signsby.sophia
        </a>
      </p>
      <button
        onClick={onReset}
        className="mt-6 font-display font-semibold text-sm text-[#9A607A] underline decoration-dotted"
      >
        Place another order
      </button>
    </div>
  );
}
