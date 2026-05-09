import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg2)",
        sidebar: "var(--sidebar)",
        surface: "var(--surface)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "hover-surface": "var(--hover-surface)",
        primary: "var(--accent)",
        "primary-hover": "var(--accent-hover)",
        "primary-glow": "var(--accent-glow)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        "muted-2": "var(--muted2)",
        "muted-bg": "var(--muted-bg)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
      },
      borderRadius: {
        "btn": "12px",
        "input": "14px",
        "card": "20px",
        "card-lg": "24px",
      },
      boxShadow: {
        "glow": "0 0 30px rgba(124,92,252,0.35)",
        "glow-sm": "0 0 16px rgba(124,92,252,0.2)",
        "card": "0 10px 30px rgba(0,0,0,0.35)",
        "card-hover": "0 10px 40px rgba(124,92,252,0.12)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionDuration: {
        "fast": "180ms",
      },
      spacing: {
        "sidebar": "260px",
      },
    },
  },
  plugins: [],
} satisfies Config;
