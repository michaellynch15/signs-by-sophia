"use client";

import Link from "next/link";
import { usePostHog } from "posthog-js/react";


const SOCIAL = [
  {
    label: "Instagram",
    href: "https://instagram.com/signsby.sophia",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@signsby.sophia25",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
      </svg>
    ),
  },
];

const LINKS = [
  {
    id: "banner-order",
    label: "Order a Banner",
    sublabel: "Custom hand-painted kraft paper banners",
    emoji: "🎉",
    href: "/order/banner",
    internal: true,
    accent: "#D4437A",
    bg: "#FDE8F0",
  },
  {
    id: "jeans-order",
    label: "Order Custom Jeans",
    sublabel: "Hand-painted denim · you send the jeans, she does the rest",
    emoji: "👖",
    href: "/order/jeans",
    internal: true,
    accent: "#8B5CA8",
    bg: "#EDE0F8",
  },
  {
    id: "business-guide",
    label: "Banner Business Guide",
    sublabel: "Learn how to start your own banner biz",
    emoji: "📖",
    href: "https://stan.store/signsbysophia",
    internal: false,
    accent: "#7ECBA3",
    bg: "#E8F8F0",
  },
  {
    id: "supplies",
    label: "Shop My Supplies",
    sublabel: "Everything I use to make banners",
    emoji: "🛒",
    href: "https://www.amazon.com/shop/signsby.sophia?ccs_id=3e0449f9-876f-4c0f-ac57-35436f2fd5eb",
    internal: false,
    accent: "#F4A88A",
    bg: "#FEF0E8",
  },
];

export default function LinktreePage() {
  const posthog = usePostHog();

  function trackLink(linkId: string, label: string, href: string) {
    posthog?.capture("linktree_link_clicked", { link_id: linkId, label, href });
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center px-4 py-12 pb-20"
      style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 60%, #FDE4CC 100%)" }}
    >
      {/* Profile */}
      <div className="flex flex-col items-center mb-8 mt-2">
        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden mb-4 shadow-lg"
          style={{ width: 110, height: 110, border: "3px solid #D4437A" }}
        >
          {/* Replace src with actual photo — add /public/sophia.jpg */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sophia.jpg"
            alt="Sophia Lynch — Signs by Sophia"
            width={110}
            height={110}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback avatar if image not found
              const el = e.currentTarget;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent) {
                parent.style.background = "linear-gradient(135deg, #D4437A, #F2A7C3)";
                parent.style.display = "flex";
                parent.style.alignItems = "center";
                parent.style.justifyContent = "center";
                const s = document.createElement("span");
                s.textContent = "S";
                s.style.cssText = "font-family:var(--font-dancing),cursive;font-size:52px;color:white;font-weight:700;";
                parent.appendChild(s);
              }
            }}
          />
        </div>

        <h1 className="font-script text-3xl mb-1" style={{ color: "#D4437A" }}>
          Signs by Sophia
        </h1>
        <p className="font-display text-sm text-[#9A607A] font-semibold mb-1">@signsby.sophia</p>
        <p className="font-display text-sm text-[#6B3058] text-center max-w-xs leading-snug">
          Custom hand-painted banners for any occasion ✨
        </p>

        {/* Social icons */}
        <div className="flex items-center gap-5 mt-4">
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-[#9A607A] hover:text-[#D4437A] transition-colors"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Link cards */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {LINKS.map((link) => {
          const inner = (
            <div
              className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
              style={{ backgroundColor: link.bg, border: `1.5px solid ${link.accent}22` }}
            >
              <span className="text-2xl flex-shrink-0">{link.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm text-[#3D1830] leading-tight">
                  {link.label}
                </p>
                <p className="font-display text-xs text-[#8A5070] mt-0.5 leading-tight truncate">
                  {link.sublabel}
                </p>
              </div>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
                style={{ color: link.accent }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          );

          return link.internal ? (
            <Link
              key={link.id}
              href={link.href}
              className="block"
              onClick={() => trackLink(link.id, link.label, link.href)}
            >
              {inner}
            </Link>
          ) : (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              onClick={() => trackLink(link.id, link.label, link.href)}
            >
              {inner}
            </a>
          );
        })}
      </div>

      <p className="font-display text-xs text-[#9A607A] font-semibold mt-8 text-center">
        Norman, OK · US Shipping Available
      </p>

      {/* Home link */}
      <a
        href="/"
        className="mt-6 font-display text-sm font-bold tracking-wide text-[#D4437A] underline decoration-dotted underline-offset-4"
      >
        signsbysophia.com
      </a>
    </main>
  );
}
