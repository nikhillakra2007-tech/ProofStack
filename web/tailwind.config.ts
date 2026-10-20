import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ebony: {
          DEFAULT: "#515A47",
          50: "#F4F6F2",
          100: "#E6EBE2",
          200: "#CCD5C5",
          300: "#A9B79E",
          400: "#7A8C6F",
          500: "#515A47",
          600: "#3F4737",
          700: "#2F362A",
          800: "#22271E",
          900: "#161A14",
          950: "#0E120D",
        },
        fawn: {
          DEFAULT: "#D7BE82",
          50: "#FDFBF7",
          100: "#FAF4E8",
          200: "#F3E7CE",
          300: "#EAD6B0",
          400: "#E0C695",
          500: "#D7BE82",
          600: "#C2A35E",
          700: "#A18244",
          800: "#7F6435",
          900: "#5E4826",
          950: "#3D2E17",
        },
        saddle: {
          DEFAULT: "#7A4419",
          50: "#FDF6F0",
          100: "#FAE9DC",
          200: "#F3D0B4",
          300: "#E9B086",
          400: "#B86A2D",
          500: "#7A4419",
          600: "#653713",
          700: "#502B0F",
          800: "#3D1F0B",
          900: "#281407",
          950: "#1A0C04",
        },
        // Semantic aliases
        bg: {
          base: "#0E120D",
          surface: "#151B13",
          elevated: "#1B2319",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
