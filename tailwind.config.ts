import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#070A08",
        bgSecondary: "#0E1410",
        bgCard: "#111713",
        greenPrimary: "#22C55E",
        greenElectric: "#7CFF6B",
        textPrimary: "#F8FAF8",
        textMuted: "#8B968D",
        danger: "#EF4444",
        positive: "#22C55E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-slower": "float-slower 9s ease-in-out infinite",
        "shimmer-border": "shimmer-border 3s linear infinite",
        "ci-draw": "ci-draw 2s ease-out forwards",
        "sheet-up": "sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "sheet-down": "sheet-down 0.26s cubic-bezier(0.4, 0, 1, 1) forwards",
        "fade-in": "fade-in 0.22s ease-out forwards",
        "fade-out": "fade-out 0.18s ease-in forwards",
        "trophy-glow": "trophy-glow 3s ease-in-out infinite",
        "shine": "shine 3.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 4px rgba(124, 255, 107, 0.4), 0 0 8px rgba(124, 255, 107, 0.2)",
            opacity: "0.7",
          },
          "50%": {
            "box-shadow": "0 0 16px rgba(124, 255, 107, 0.8), 0 0 32px rgba(124, 255, 107, 0.4), 0 0 64px rgba(34, 197, 94, 0.2)",
            opacity: "1",
          },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "25%": { transform: "translateY(-8px) rotate(0.5deg)" },
          "75%": { transform: "translateY(-4px) rotate(-0.5deg)" },
        },
        "shimmer-border": {
          "0%": { "background-position": "-200% center" },
          "100%": { "background-position": "200% center" },
        },
        "ci-draw": {
          "0%": { "stroke-dashoffset": "1000" },
          "100%": { "stroke-dashoffset": "0" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "sheet-down": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "trophy-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 4px rgba(234, 179, 8, 0.4))" },
          "50%": { filter: "drop-shadow(0 0 14px rgba(234, 179, 8, 0.75))" },
        },
        "shine": {
          "0%": { "background-position": "-200% 50%" },
          "100%": { "background-position": "200% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
