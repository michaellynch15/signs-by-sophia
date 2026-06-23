"use client";

import { useRef, useEffect } from "react";

const steps = [
  {
    num: "01",
    icon: "📝",
    title: "Fill out the order form",
    body: "Share the occasion, name(s) to include, color scheme, size, and due date. The more details the better!",
    accent: "#D4437A",
    bg: "#FDE8F0",
  },
  {
    num: "02",
    icon: "🎨",
    title: "Sophia gets to work",
    body: "Once payment is received, work begins on your banner. A digital mockup will be sent 1–2 weeks before your event date with one round of revisions.",
    accent: "#7ECBA3",
    bg: "#E8F8F0",
  },
  {
    num: "03",
    icon: "🎉",
    title: "Receive & celebrate!",
    body: "Your custom banner arrives ready to hang. Tag @signsby.sophia in your party photos — we'd love to see it in action!",
    accent: "#C5A8D5",
    bg: "#F0E8F8",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = () => {
      const cards = sectionRef.current?.querySelectorAll(".hiw-card");
      cards?.forEach((c, i) => setTimeout(() => c.classList.add("visible"), i * 120));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    const t = setTimeout(reveal, 300);
    return () => { observer.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <section id="how-it-works" className="py-20 px-5 bg-white/60" ref={sectionRef}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-display text-xs font-bold tracking-widest uppercase text-[#9A607A] mb-2">
            The process
          </p>
          <h2 className="font-script text-5xl md:text-6xl" style={{ color: "#3D1830" }}>
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting dotted line on desktop */}
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-[#E8B0C8] opacity-40 z-0" />

          {steps.map((step) => (
            <div
              key={step.num}
              className="hiw-card fade-up relative z-10 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm"
              style={{ backgroundColor: step.bg }}
            >
              <span className="text-4xl mb-4">{step.icon}</span>
              <span
                className="font-script text-6xl opacity-10 absolute top-4 right-6 leading-none select-none"
                style={{ color: step.accent }}
              >
                {step.num}
              </span>
              <h3
                className="font-script text-2xl mb-3"
                style={{ color: step.accent }}
              >
                {step.title}
              </h3>
              <p className="font-display text-sm text-[#3D1830] leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ blurb */}
        <div className="mt-14 rounded-3xl p-8 text-center"
          style={{ backgroundColor: "#FEF8E8", border: "2px dashed #F4D06F" }}>
          <p className="font-script text-3xl mb-2" style={{ color: "#9A607A" }}>
            A few things to know
          </p>
          <ul className="font-display text-sm text-[#3D1830] space-y-2 max-w-xl mx-auto text-left mt-4">
            <li className="flex items-start gap-2">
              <span style={{ color: "#D4437A" }}>✦</span>
              <span>At least 2 weeks&apos; notice is required to create your banner. Rush orders (under 2 weeks) are accepted for an additional $15 fee.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#7ECBA3" }}>✦</span>
              <span>Payment is due upon order submission to secure your spot — work begins once payment is received.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#C5A8D5" }}>✦</span>
              <span>Local pickup available in Norman, OK. US shipping is a flat $10 — out-of-state customers have shipping included in their invoice.</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: "#F4D06F" }}>✦</span>
              <span>Every banner is fully custom. A digital mockup will be sent 1–2 weeks before your event date, with one round of revisions included.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
