"use client";

import { useEffect, useRef } from "react";

const products = [
  {
    id: "banner",
    name: "Brown Paper Banner",
    emoji: "🎉",
    description:
      "The signature Sophia sign — fully custom painted on kraft paper. Perfect for any party, graduation, or celebration. Every one is one-of-a-kind.",
    accent: "#D4437A",
    bg: "#FDE8F0",
    badge: "Most Popular",
  },
  {
    id: "linen-banner",
    name: "Linen Banner",
    emoji: "✨",
    description:
      "All the charm of the classic banner on soft linen fabric — a keepsake-quality piece you'll want to hang up forever.",
    accent: "#7ECBA3",
    bg: "#E8F8F0",
  },
  {
    id: "senior-jeans",
    name: "Senior Jeans",
    emoji: "👖",
    description:
      "Custom hand-painted senior jeans with the graduate's name, grad year, school colors, and personal touches. A senior-year must-have.",
    accent: "#C5A8D5",
    bg: "#F0E8F8",
  },
  {
    id: "tote-bag",
    name: "Tote Bag",
    emoji: "👜",
    description:
      "Hand-painted canvas tote bags — great as party favors, bridesmaid gifts, or just a stylish everyday bag with your name on it.",
    accent: "#F4D06F",
    bg: "#FDF8E8",
  },
  {
    id: "classroom-decor",
    name: "Classroom Decor",
    emoji: "🍎",
    description:
      "Brighten up a classroom with custom painted banners, door signs, and decorative pieces. Teachers love these as gifts.",
    accent: "#F4A88A",
    bg: "#FEF0E8",
  },
  {
    id: "how-to-book",
    name: "How-To Book",
    emoji: "📖",
    description:
      "Learn Sophia's techniques yourself. A step-by-step guide to painting your own brown paper banners at home — fonts, layouts, and all.",
    accent: "#F2A7C3",
    bg: "#FEE8F0",
  },
];

const ORDER_LINKS: Record<string, string> = {
  "banner": "/order/banner",
  "senior-jeans": "/order/jeans",
  "tote-bag": "/order/tote",
};

export default function ProductsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = () => {
      const cards = sectionRef.current?.querySelectorAll(".product-card");
      cards?.forEach((card, i) => setTimeout(() => card.classList.add("visible"), i * 80));
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
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    const t = setTimeout(reveal, 300);
    return () => { observer.disconnect(); clearTimeout(t); };
  }, []);

  return (
    <section id="products" className="py-20 px-5 max-w-6xl mx-auto" ref={sectionRef}>
      {/* Heading */}
      <div className="text-center mb-12">
        <p className="font-display text-xs font-bold tracking-widest uppercase text-[#9A607A] mb-2">
          What I make
        </p>
        <h2 className="font-script text-5xl md:text-6xl" style={{ color: "#3D1830" }}>
          What can I make for you?
        </h2>
        <p className="font-display text-[#6B3058] mt-3 text-base max-w-lg mx-auto">
          Every piece is completely custom — you choose the colors, text, and theme.
          No two are ever the same.
        </p>
      </div>

      {/* Banner featured card — full width */}
      {(() => {
        const banner = products[0];
        return (
          <a
            href={ORDER_LINKS[banner.id] ?? "/linktree"}
            className="product-card fade-up relative rounded-3xl overflow-hidden mb-6 cursor-pointer card-hover shadow-md block"
            style={{ backgroundColor: banner.bg }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
              <div className="w-full md:w-auto flex-shrink-0">
                <KraftBannerIllustration />
              </div>
              <div className="flex-1 text-center md:text-left">
                {banner.badge && (
                  <span
                    className="inline-block text-xs font-display font-bold px-3 py-1 rounded-full text-white mb-3"
                    style={{ backgroundColor: banner.accent }}
                  >
                    {banner.badge}
                  </span>
                )}
                <h3 className="font-script text-4xl md:text-5xl mb-3" style={{ color: banner.accent }}>
                  {banner.name}
                </h3>
                <p className="font-display text-[#3D1830] text-base leading-relaxed max-w-md">
                  {banner.description}
                </p>
                <span
                  className="mt-6 inline-flex items-center gap-2 font-display font-bold text-base px-7 py-3.5 rounded-full text-white shadow-md"
                  style={{ backgroundColor: banner.accent }}
                >
                  Order a Banner
                  <span>→</span>
                </span>
              </div>
            </div>
          </a>
        );
      })()}

      {/* Other products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.slice(1).map((product) => (
          <a
            key={product.id}
            href={ORDER_LINKS[product.id] ?? "/linktree"}
            className="product-card fade-up rounded-3xl p-7 cursor-pointer card-hover shadow-sm border border-white/60 flex flex-col gap-3 block"
            style={{ backgroundColor: product.bg }}
          >
            <span className="text-3xl">{product.emoji}</span>
            <h3 className="font-script text-3xl" style={{ color: product.accent }}>
              {product.name}
            </h3>
            <p className="font-display text-sm text-[#3D1830] leading-relaxed flex-1">
              {product.description}
            </p>
            <span
              className="mt-2 self-start font-display font-bold text-sm px-5 py-2.5 rounded-full border-2"
              style={{ borderColor: product.accent, color: product.accent }}
            >
              Order This
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function KraftBannerIllustration() {
  return (
    <svg
      viewBox="0 0 340 160"
      className="w-full md:w-80 h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="8" y="12" width="324" height="142" rx="6" fill="rgba(160,120,60,0.12)" />
      <rect x="4" y="8" width="324" height="142" rx="6" fill="url(#kraft-grad)" />
      <line x1="4" y1="20" x2="328" y2="20" stroke="#9A7A50" strokeWidth="1" opacity="0.4" />
      {[60, 100, 140, 180, 220, 260].map((x, i) => {
        const colors = ["#F2A7C3","#7ECBA3","#C5A8D5","#F4D06F","#F4A88A","#F2A7C3"];
        return <polygon key={i} points={`${x-12},8 ${x+12},8 ${x},34`} fill={colors[i]} opacity="0.8" />;
      })}
      <text x="162" y="100" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontSize="48" fill="#D4437A" fontWeight="700">
        Congrats!
      </text>
      {[[30,60],[30,100],[300,60],[300,100],[162,130]].map(([cx,cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="white" opacity="0.5" />
      ))}
      <defs>
        <linearGradient id="kraft-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DDB888" />
          <stop offset="50%" stopColor="#C8A070" />
          <stop offset="100%" stopColor="#B88E58" />
        </linearGradient>
      </defs>
    </svg>
  );
}
