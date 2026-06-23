import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FLAGS = ["#F2A7C3", "#7ECBA3", "#C5A8D5", "#F4D06F", "#F4A88A", "#F2A7C3", "#7ECBA3", "#C5A8D5", "#F4D06F", "#F4A88A"];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(145deg, #FFF0F6 0%, #FFE4F0 55%, #FFF8F0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Top flag row */}
        <div style={{ display: "flex", gap: 10, position: "absolute", top: 32, left: 0, right: 0, justifyContent: "center" }}>
          {FLAGS.map((c, i) => (
            <div
              key={i}
              style={{ width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `44px solid ${c}`, opacity: 0.85 }}
            />
          ))}
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div style={{ fontSize: 96, color: "#D4437A", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.1 }}>
            Signs by Sophia
          </div>
          <div style={{ fontSize: 28, color: "#9A607A", fontFamily: "Arial, sans-serif", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 12 }}>
            Invoice Ready
          </div>
          <div style={{ fontSize: 22, color: "#6B3058", fontFamily: "Arial, sans-serif", marginTop: 14, opacity: 0.85 }}>
            Thanks for your order! Here&apos;s your invoice link.
          </div>
        </div>

        {/* Bottom stripe */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg, #D4437A, #F2A7C3, #C5A8D5, #F2A7C3, #D4437A)" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
