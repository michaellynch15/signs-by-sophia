import type { CSSProperties } from "react";
import { CHRISTMAS } from "@/lib/seasonal";

// Deterministic values (no Math.random) so server and client render identically.
const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 10 + ((i * 7) % 9),
  duration: 12 + ((i * 5) % 11),
  delay: -Math.round((i * 37) % 200) / 10,
  drift: (i % 2 ? 1 : -1) * (15 + ((i * 13) % 40)),
  opacity: 0.55 + (i % 5) * 0.09,
}));

export function Snowfall() {
  if (!CHRISTMAS) return null;
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-40" aria-hidden="true">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            fontSize: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            "--drift": `${f.drift}px`,
          } as CSSProperties}
        >
          ❄
        </span>
      ))}
    </div>
  );
}

const BULB_COLORS = ["#E23B3B", "#2E9E5B", "#F4C542", "#F28CB8", "#3B8FE2"];

export function LightString({ className = "" }: { className?: string }) {
  if (!CHRISTMAS) return null;
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true" style={{ height: 30 }}>
      <svg className="absolute inset-x-0 top-0 w-full" height="8" preserveAspectRatio="none" viewBox="0 0 100 8">
        <path d="M0 3 Q 2.5 6.5 5 3 T 10 3 T 15 3 T 20 3 T 25 3 T 30 3 T 35 3 T 40 3 T 45 3 T 50 3 T 55 3 T 60 3 T 65 3 T 70 3 T 75 3 T 80 3 T 85 3 T 90 3 T 95 3 T 100 3" fill="none" stroke="#2F5F44" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute inset-x-0 top-1 flex justify-around px-2">
        {Array.from({ length: 16 }, (_, i) => {
          const c = BULB_COLORS[i % BULB_COLORS.length];
          return (
            <span key={i} className="flex flex-col items-center" style={{ marginTop: i % 2 ? 3 : 0 }}>
              <span style={{ width: 3, height: 5, background: "#2F5F44" }} />
              <span
                className="xmas-bulb"
                style={{
                  width: 9,
                  height: 13,
                  borderRadius: "45% 45% 55% 55%",
                  background: c,
                  boxShadow: `0 0 8px 2px ${c}99`,
                  animationDelay: `${(i * 0.37) % 2.4}s`,
                }}
              />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function SantaHat({ className = "" }: { className?: string }) {
  if (!CHRISTMAS) return null;
  return (
    <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 80" aria-hidden="true">
      <path d="M12 56 C 18 20, 52 6, 78 14 C 70 24, 74 40, 90 56 Z" fill="#D93232" />
      <path d="M60 18 C 72 20, 80 36, 90 56 L 76 56 C 74 40, 68 28, 60 18 Z" fill="#B82525" opacity="0.55" />
      <rect x="6" y="52" width="90" height="18" rx="9" fill="#FFFFFF" />
      <circle cx="80" cy="14" r="9" fill="#FFFFFF" />
    </svg>
  );
}

export function Holly({ className = "", style }: { className?: string; style?: CSSProperties }) {
  if (!CHRISTMAS) return null;
  return (
    <svg className={`pointer-events-none ${className}`} style={style} viewBox="0 0 80 60" aria-hidden="true">
      <path d="M40 34 C 28 14, 8 14, 4 28 C 12 26, 14 36, 10 42 C 22 40, 34 44, 40 34 Z" fill="#2E8B57" />
      <path d="M40 34 C 52 14, 72 14, 76 28 C 68 26, 66 36, 70 42 C 58 40, 46 44, 40 34 Z" fill="#247047" />
      <circle cx="34" cy="40" r="6" fill="#D93232" />
      <circle cx="46" cy="40" r="6" fill="#C42B2B" />
      <circle cx="40" cy="47" r="6" fill="#E04040" />
      <circle cx="32" cy="38" r="1.6" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}
