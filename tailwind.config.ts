import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        energy: {
          DEFAULT: "hsl(210 100% 56%)",
          glow: "hsl(198 95% 60%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["Satoshi", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg": [
          "clamp(3rem, 6vw, 4.75rem)",
          { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "800" },
        ],
        "display-md": [
          "clamp(2.25rem, 4vw, 3.25rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" },
        ],
        "display-sm": [
          "clamp(1.75rem, 3vw, 2.25rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" },
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.6)" },
          "50%": { boxShadow: "0 0 0 14px hsl(var(--primary) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      backgroundImage: {
        "grid-dark":
          "linear-gradient(to right, hsl(0 0% 100% / 0.04) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 100% / 0.04) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(circle at 50% 0%, hsl(210 100% 56% / 0.25), transparent 60%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
