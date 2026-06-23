import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kraft: {
          light: "#D4A97A",
          DEFAULT: "#B5875A",
          dark: "#8B6340",
        },
        magenta: {
          light: "#F06090",
          DEFAULT: "#D4437A",
          dark: "#A8305C",
        },
        mint: {
          light: "#B2E8D0",
          DEFAULT: "#7ECBA3",
          dark: "#55A880",
        },
        blush: {
          light: "#FCD5E0",
          DEFAULT: "#F2A7C3",
          dark: "#E070A0",
        },
        lavender: {
          light: "#E0D0F0",
          DEFAULT: "#C5A8D5",
          dark: "#9B7AB8",
        },
        lemon: {
          light: "#FBF0C0",
          DEFAULT: "#F4D06F",
          dark: "#E0B030",
        },
        peach: {
          light: "#FDE8D8",
          DEFAULT: "#F4A88A",
          dark: "#E07850",
        },
        cream: "#FFF8F0",
        "dark-brown": "#5C3D2E",
      },
      fontFamily: {
        script: ["var(--font-dancing)", "cursive"],
        display: ["var(--font-nunito)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      backgroundImage: {
        "kraft-texture": `
          radial-gradient(ellipse at 20% 30%, rgba(180,130,80,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(160,110,60,0.06) 0%, transparent 50%),
          linear-gradient(135deg, rgba(200,150,90,0.05) 0%, transparent 100%)
        `,
      },
      animation: {
        "paint-in": "paintIn 0.8s ease forwards",
        "fade-up": "fadeUp 0.6s ease forwards",
        "unroll": "unroll 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        paintIn: {
          from: { backgroundPosition: "100% 0%" },
          to: { backgroundPosition: "0% 0%" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        unroll: {
          from: { transform: "scaleX(0.02)", borderRadius: "9999px" },
          to: { transform: "scaleX(1)", borderRadius: "12px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
