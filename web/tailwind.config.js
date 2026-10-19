/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a09",
          900: "#121210",
          850: "#141412",
          800: "#1a1917",
          750: "#201f1c",
          700: "#2a2825",
          600: "#3a3733",
          500: "#6d6862",
          400: "#7a766c",
          300: "#9c978b",
          200: "#cfc9bb",
          100: "#e2ddd2",
          50: "#e9e5da",
        },
        nemotron: {
          DEFAULT: "#8e5a36",
          glow: "#c98d5e",
          dark: "#5c3a22",
        },
        proof: {
          accept: "#7fae7a",
          reject: "#c26b5e",
          inconclusive: "#b08a4a",
          neutral: "#7a766c",
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderColor: {
        hairline: "rgba(233, 229, 218, 0.10)",
        subtle: "rgba(233, 229, 218, 0.18)",
      }
    },
  },
  plugins: [],
};
