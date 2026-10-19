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
          950: "#060A12",
          900: "#0B1220", // Authoritative dark ink background
          850: "#0E1729",
          800: "#131D31",
          700: "#1E293B",
          600: "#334155",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        nemotron: {
          DEFAULT: "#6366F1",
          glow: "#818CF8",
          dark: "#4338CA",
        },
        proof: {
          accept: "#10B981",
          reject: "#F43F5E",
          inconclusive: "#F59E0B",
          neutral: "#64748B",
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      borderColor: {
        hairline: "rgba(255, 255, 255, 0.08)",
        subtle: "rgba(255, 255, 255, 0.14)",
      }
    },
  },
  plugins: [],
};
