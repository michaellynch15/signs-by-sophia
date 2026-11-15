"use client";

import { useEffect, useState } from "react";

export default function HeroSection() {
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.booking_notice) setBookingNotice(d.booking_notice);
    });
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-5"
      style={{
        backgroundColor: "#FFF0F6",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23FFF0F6'/%3E%3Crect width='60' height='18' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='60' height='18' y='42' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='18' height='60' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='18' height='60' x='42' fill='%23F5B8D4' opacity='0.28'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
      }}
    >
      <div className="flex flex-col items-center text-center w-full pt-16 md:pt-0">
        {/* Kraft paper banner */}
        <div
          className="kraft-paper relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-12 px-10 md:py-16 md:px-16 shadow-2xl rounded-sm mb-10"
        >
          <BannerFlags />
          <TapeStrip className="absolute -top-3 left-16 rotate-[-7deg]" />
          <TapeStrip className="absolute -top-3 right-16 rotate-[7deg]" />
          <TapeStrip className="absolute -top-3 left-1/2 -translate-x-1/2" />

          <p className="font-display text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-[#7A3A60] mb-4 opacity-70">
            Custom hand-painted
          </p>

          <span
            className="font-script block"
            style={{
              fontSize: "clamp(52px, 8vw, 100px)",
              lineHeight: 1.05,
              color: "#D4437A",
            }}
          >
            Signs by Sophia
          </span>

          <p className="font-display text-[#6B3058] text-sm md:text-base mt-5 max-w-sm font-medium leading-relaxed">
            Hand-painted banners for every occasion —<br className="hidden md:block" /> birthdays, graduations, bachelorettes & more
          </p>

          {/* Decorative dots on paper */}
          {[[28,72],[28,150],[290,72],[290,150]].map(([x,y],i) => (
            <div key={i} className="absolute rounded-full pointer-events-none hidden md:block"
              style={{ left: x, top: y, width: 8, height: 8, backgroundColor:"white", opacity:0.3 }} />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/linktree"
            className="w-full sm:w-auto text-center bg-[#D4437A] text-white font-display font-bold text-base md:text-lg px-10 py-4 rounded-full shadow-lg hover:bg-[#A8305C] transition-colors"
          >
            Order a Banner
          </a>
          <a
            href="#gallery"
            className="w-full sm:w-auto text-center border-2 border-[#9A607A] text-[#9A607A] font-display font-semibold text-sm md:text-base px-8 py-3.5 rounded-full hover:bg-[#9A607A] hover:text-white transition-colors"
          >
            See the work
          </a>
        </div>

        <p className="mt-5 text-xs md:text-sm font-display text-[#9A607A] font-semibold">
          Norman, OK · US Shipping Available
        </p>
      </div>
    </section>
  );
}

function TapeStrip({ className }: { className?: string }) {
  return (
    <div className={`w-14 h-5 rounded-sm absolute ${className}`}
      style={{
        background: "linear-gradient(to right, rgba(244,224,140,0.45), rgba(244,224,140,0.72), rgba(244,224,140,0.45))",
        border: "1px solid rgba(200,170,60,0.25)",
      }}
    />
  );
}

function BannerFlags() {
  const colors = ["#F2A7C3","#7ECBA3","#C5A8D5","#F4D06F","#F4A88A","#F2A7C3","#7ECBA3","#C5A8D5","#F4D06F"];
  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden pointer-events-none" style={{ height: 38 }}>
      <svg viewBox="0 0 900 38" className="w-full h-full" preserveAspectRatio="none">
        <line x1="0" y1="5" x2="900" y2="5" stroke="#7A3A60" strokeWidth="1" opacity="0.4" />
        {colors.map((c, i) => {
          const x = 50 + i * 95;
          return <polygon key={i} points={`${x-16},2 ${x+16},2 ${x},32`} fill={c} opacity="0.82" />;
        })}
      </svg>
    </div>
  );
}

function Confetti() {
  const dots = [
    { x:"6%", y:"14%", r:11, c:"#F2A7C3" }, { x:"14%", y:"72%", r:15, c:"#7ECBA3" },
    { x:"89%", y:"18%", r:13, c:"#C5A8D5" }, { x:"93%", y:"68%", r:9, c:"#F4D06F" },
    { x:"4%",  y:"48%", r:7,  c:"#F4A88A" }, { x:"82%", y:"82%", r:11, c:"#F2A7C3" },
    { x:"21%", y:"90%", r:9,  c:"#7ECBA3" }, { x:"77%", y:"10%", r:15, c:"#C5A8D5" },
  ];
  return (
    <>
      {dots.map((d,i) => (
        <div key={i} className="absolute rounded-full opacity-25 pointer-events-none"
          style={{ left:d.x, top:d.y, width:d.r*2, height:d.r*2, backgroundColor:d.c }} />
      ))}
    </>
  );
}
