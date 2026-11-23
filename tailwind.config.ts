import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        surface: "#F3ECE1",
        burgundy: {
          DEFAULT: "#5C1A26",
          hover: "#46121C",
        },
        footer: "#3E1019",
        terracotta: "#C2654A",
        charcoal: "#2B2625",
      },
      fontFamily: {
        serif: ["var(--font-serif-luxury)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans-clean)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

