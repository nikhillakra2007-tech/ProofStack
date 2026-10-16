import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ps-paper": "#E9EEF2",
        "ps-sheet": "#F7F9FB",
        "ps-ink": "#13202B",
        "ps-ink-2": "#3F5262",
        "ps-rule": "#B8C6D1",
        "ps-edge": "#6F8392",
        "ps-focus": "#0B5CAD",
        "ps-seated": "#0F6B4F",
        "ps-breach": "#B42318",
        "ps-hold": "#8A5A00",
        "ps-notrun": "#566775",
      },
    },
  },
  plugins: [],
};
export default config;
