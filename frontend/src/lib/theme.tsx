"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

export type PaletteId =
  | "cobalt-ledger"
  | "sage-walnut"
  | "blush-jet"
  | "black-magenta"
  | "charcoal-silver"
  | "jet-amethyst-cyan"
  | "beige-forest-citrus"
  | "white-charcoal-taupe"
  | "ivory-scarlet"
  | "trueblue-jade"
  | "cyan-ink";

export type DensityMode = "compact" | "comfortable";

export interface PaletteMeta {
  id: PaletteId;
  name: string;
  subtitle: string;
  lightSwatches: string[]; // [bg, ink, brand, accent]
  darkSwatches: string[];
}

export const PALETTES: PaletteMeta[] = [
  {
    id: "cobalt-ledger",
    name: "Cobalt Ledger",
    subtitle: "cobalt blue + tangerine orange + cream ivory",
    lightSwatches: ["#F6F1E6", "#1B1F2A", "#1F3FBF", "#F26B1D"],
    darkSwatches: ["#0F1220", "#F3EEE0", "#7C98FF", "#FF8A3D"],
  },
  {
    id: "sage-walnut",
    name: "Sage & Walnut",
    subtitle: "sage green + walnut brown + amber glow",
    lightSwatches: ["#EDEFE3", "#2A2620", "#4A6A4F", "#E8A33D"],
    darkSwatches: ["#14160F", "#EFEBDD", "#9DBF98", "#F2B24C"],
  },
  {
    id: "blush-jet",
    name: "Blush & Jet",
    subtitle: "blush pink + jet black + half-tone green",
    lightSwatches: ["#FBF1F1", "#111111", "#111111", "#4F8A62"],
    darkSwatches: ["#0C0C0C", "#F7E9EA", "#F2B8BE", "#8DBB98"],
  },
  {
    id: "black-magenta",
    name: "Black, Ivory & Magenta",
    subtitle: "black + off-white + magenta",
    lightSwatches: ["#F4F2EE", "#0E0E10", "#B8126F", "#0E0E10"],
    darkSwatches: ["#0A0A0B", "#F4F2EE", "#F047A8", "#F4F2EE"],
  },
  {
    id: "charcoal-silver",
    name: "Charcoal, Silver & Red",
    subtitle: "charcoal grey + moonlight silver + single red",
    lightSwatches: ["#ECEDEF", "#1E2024", "#2B2E35", "#C62828"],
    darkSwatches: ["#15171A", "#E6E8EB", "#C9CDD4", "#FF5A4F"],
  },
  {
    id: "jet-amethyst-cyan",
    name: "Jet, Amethyst & Cyan",
    subtitle: "jet black + royal amethyst + electric cyan",
    lightSwatches: ["#F3F1F8", "#12101A", "#5B2FA6", "#00788C"],
    darkSwatches: ["#0B0A10", "#F1EFFA", "#B08CF0", "#22D8F5"],
  },
  {
    id: "beige-forest-citrus",
    name: "Beige, Forest & Citrus",
    subtitle: "creamy beige + deep forest green + citrus yellow",
    lightSwatches: ["#F2EBDA", "#1C2A22", "#1E4D36", "#D9AE00"],
    darkSwatches: ["#101812", "#F0EAD6", "#7DBF98", "#F3CE2B"],
  },
  {
    id: "white-charcoal-taupe",
    name: "White, Charcoal & Muted Violet",
    subtitle: "white + deep charcoal + muted violet",
    lightSwatches: ["#F7F6F4", "#24242A", "#6D5A86", "#8C7A66"],
    darkSwatches: ["#141416", "#EEEBE6", "#B7A2D1", "#C2B19D"],
  },
  {
    id: "ivory-scarlet",
    name: "Ivory, Charcoal & Scarlet",
    subtitle: "ivory + charcoal black + vibrant scarlet",
    lightSwatches: ["#FAF6EC", "#1D1D1F", "#1D1D1F", "#D6221F"],
    darkSwatches: ["#121212", "#F6F1E4", "#F6F1E4", "#FF4D3D"],
  },
  {
    id: "trueblue-jade",
    name: "True Blue, Jade & Autumn",
    subtitle: "true blue + jade green + sparkling cosmos",
    lightSwatches: ["#EFF5F8", "#0F2230", "#0B5CAD", "#D9822B"],
    darkSwatches: ["#0B1230", "#EAF1F8", "#6DAEFF", "#F0A04B"],
  },
  {
    id: "cyan-ink",
    name: "Electric Cyan on Ink",
    subtitle: "electric cyan paired with ink + paper",
    lightSwatches: ["#F2F6F7", "#0A1114", "#00788C", "#0A1114"],
    darkSwatches: ["#060B0D", "#E9F4F6", "#19E3FF", "#E9F4F6"],
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  palette: PaletteId;
  density: DensityMode;
  isTampered: boolean;
  isCopilotOpen: boolean;
  isIngestModalOpen: boolean;
  setTheme: (t: ThemeMode) => void;
  setPalette: (p: PaletteId) => void;
  setDensity: (d: DensityMode) => void;
  setIsTampered: (tampered: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  setIsIngestModalOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [palette, setPaletteState] = useState<PaletteId>("cobalt-ledger");
  const [density, setDensityState] = useState<DensityMode>("comfortable");
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // Initialize from localStorage or media query
  useEffect(() => {
    const savedTheme = (localStorage.getItem("proofstack_theme") as ThemeMode) || "system";
    const savedPalette = (localStorage.getItem("proofstack_palette") as PaletteId) || "cobalt-ledger";
    const savedDensity = (localStorage.getItem("proofstack_density") as DensityMode) || "comfortable";

    setThemeState(savedTheme);
    setPaletteState(savedPalette);
    setDensityState(savedDensity);
  }, []);

  // Update root element attributes when theme, resolvedTheme, palette, or density changes
  useEffect(() => {
    let activeTheme: "light" | "dark" = "light";
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      activeTheme = prefersDark ? "dark" : "light";
    } else {
      activeTheme = theme;
    }
    setResolvedTheme(activeTheme);

    const root = document.documentElement;
    root.setAttribute("data-theme", activeTheme);
    root.setAttribute("data-palette", palette);
    root.setAttribute("data-density", density);

    // Also support class dark for compatibility
    if (activeTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, palette, density]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("proofstack_theme", t);
  };

  const setPalette = (p: PaletteId) => {
    setPaletteState(p);
    localStorage.setItem("proofstack_palette", p);
  };

  const setDensity = (d: DensityMode) => {
    setDensityState(d);
    localStorage.setItem("proofstack_density", d);
  };

  const toggleTheme = () => {
    const next: ThemeMode = resolvedTheme === "light" ? "dark" : "light";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        palette,
        density,
        isTampered,
        isCopilotOpen,
        isIngestModalOpen,
        setTheme,
        setPalette,
        setDensity,
        setIsTampered,
        setIsCopilotOpen,
        setIsIngestModalOpen,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
