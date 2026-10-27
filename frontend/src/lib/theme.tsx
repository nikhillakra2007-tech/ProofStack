"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light";

export type PaletteId =
  | "proofstack-light"
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
    id: "proofstack-light",
    name: "Semgrep Cyber Light",
    subtitle: "editorial off-white + deep emerald green + charcoal ink",
    lightSwatches: ["#FAFAF8", "#17211D", "#167A58", "#167A58"],
    darkSwatches: ["#FAFAF8", "#17211D", "#167A58", "#167A58"],
  },
  {
    id: "cobalt-ledger",
    name: "Cobalt Ledger Light",
    subtitle: "cobalt blue + tangerine orange + cream ivory",
    lightSwatches: ["#F6F1E6", "#1B1F2A", "#1F3FBF", "#F26B1D"],
    darkSwatches: ["#F6F1E6", "#1B1F2A", "#1F3FBF", "#F26B1D"],
  },
  {
    id: "sage-walnut",
    name: "Sage & Walnut",
    subtitle: "sage green + walnut brown + amber glow",
    lightSwatches: ["#EDEFE3", "#2A2620", "#4A6A4F", "#E8A33D"],
    darkSwatches: ["#EDEFE3", "#2A2620", "#4A6A4F", "#E8A33D"],
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light";
  palette: PaletteId;
  density: DensityMode;
  isTampered: boolean;
  isCopilotOpen: boolean;
  isIngestModalOpen: boolean;
  setTheme: (t: string) => void;
  setPalette: (p: PaletteId) => void;
  setDensity: (d: DensityMode) => void;
  setIsTampered: (tampered: boolean) => void;
  setIsCopilotOpen: (open: boolean) => void;
  setIsIngestModalOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<ThemeMode>("light");
  const [resolvedTheme] = useState<"light">("light");
  const [palette, setPaletteState] = useState<PaletteId>("proofstack-light");
  const [density, setDensityState] = useState<DensityMode>("comfortable");
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);

  // Initialize from localStorage (guaranteeing permanent light theme)
  useEffect(() => {
    localStorage.setItem("proofstack_theme", "light");
    const savedPalette = (localStorage.getItem("proofstack_palette") as PaletteId) || "proofstack-light";
    const savedDensity = (localStorage.getItem("proofstack_density") as DensityMode) || "comfortable";

    setPaletteState(savedPalette);
    setDensityState(savedDensity);
  }, []);

  // Update root element attributes - permanently enforce light mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.setAttribute("data-palette", palette);
    root.setAttribute("data-density", density);
    root.classList.remove("dark");
  }, [palette, density]);

  const setTheme = (_t: string) => {
    // Permanent light theme invariant: ignore requests for dark mode
    localStorage.setItem("proofstack_theme", "light");
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
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
    // Invariant: permanent light theme only
    setTheme("light");
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
