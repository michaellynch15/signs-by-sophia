"use client";

import Image from "next/image";

const galleryItems = [
  { id: 1,  label: "Kellan's 16th",         src: "/24C09416-CE7C-4F98-AF5D-7E5AA69DDDBC.jpeg" },
  { id: 2,  label: "She's Freshly Graduated", src: "/IMG_6992.jpeg" },
  { id: 3,  label: "Mamma Mia!",             src: "/IMG_6608.jpeg" },
  { id: 4,  label: "Taylor Turns 16",        src: "/IMG_6963.jpeg" },
  { id: 5,  label: "Mount Pom Sisterhood",   src: "/IMG_7012.jpeg" },
  { id: 6,  label: "Freshly Fourteen",       src: "/IMG_7075.jpeg" },
  { id: 7,  label: "Maxinne Is 13",          src: "/IMG_7193.jpeg" },
  { id: 8,  label: "Congratulations Lela",   src: "/IMG_7382.jpeg" },
  { id: 9,  label: "Pierce & Hudson",        src: "/IMG_7407.jpeg" },
  { id: 10, label: "Parker & Beau",          src: "/IMG_7688.jpeg" },
  { id: 11, label: "Madeline Is Fifteen",    src: "/IMG_6616.jpeg" },
  { id: 12, label: "Congrats Kennedy",       src: "/A5C20049-4386-4C0A-80A6-62A0722CA205.jpeg" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-20 overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #FFF8F0, #FDEEE0)" }}>

      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <p className="font-display text-xs font-bold tracking-widest uppercase text-[#9A607A] mb-2">
            Recent work
          </p>
          <h2 className="font-script text-5xl md:text-6xl" style={{ color: "#3D1830" }}>
            From the studio
          </h2>
          <p className="font-display text-[#6B3058] mt-3 text-base">
            Follow along on Instagram{" "}
            <a href="https://instagram.com/signsby.sophia" target="_blank" rel="noopener noreferrer"
              className="font-bold underline decoration-dotted" style={{ color: "#D4437A" }}>
              @signsby.sophia
            </a>{" "}
            for the latest drops
          </p>
        </div>
      </div>

      {/* Marquee row — fades at edges */}
      <div
        className="relative"
        style={{ WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)", maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}
      >
        <div className="flex gap-5 marquee-track">
          {[...galleryItems, ...galleryItems].map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl overflow-hidden shadow-md"
              style={{ width: 260, height: 300 }}
            >
              {item.src ? (
                <Image
                  src={item.src}
                  alt={item.label}
                  width={260}
                  height={300}
                  className="w-full h-full object-cover"
                  priority={i < 5}
                />
              ) : (
                <Placeholder item={item} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-10 px-5">
        <a
          href="https://instagram.com/signsby.sophia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-display font-bold text-sm px-6 py-3 rounded-full border-2 border-[#D4437A] text-[#D4437A] hover:bg-[#D4437A] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          See more on Instagram
        </a>
      </div>
    </section>
  );
}

function Placeholder({ item }: { item: { label: string; colors?: string[] } }) {
  const colors = item.colors ?? ["#F2A7C3", "#C5A8D5"];
  return (
    <div className="w-full h-full flex items-center justify-center relative"
      style={{ background: `linear-gradient(145deg, ${colors[0]}50, ${colors[1]}70)` }}>
      <div className="absolute top-0 left-0 right-0 flex justify-center gap-3 pt-1 overflow-hidden" style={{ height: 28 }}>
        {[...colors, ...colors].map((c, i) => (
          <div key={i} className="flex-shrink-0"
            style={{ width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: `16px solid ${c}`, opacity: 0.85 }} />
        ))}
      </div>
      <span className="font-script text-2xl text-center px-6 leading-tight"
        style={{ color: colors[0], textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
        {item.label}
      </span>
    </div>
  );
}
