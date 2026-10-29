"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type PaletteId =
  | "proofstack-light";

export type DensityMode = "compact" | "comfortable";

export interface PaletteMeta {
  id: PaletteId;
  name: string;
  subtitle: string;
  lightSwatches: string[];
  darkSwatches: string[];
}

export const PALETTES: PaletteMeta[] = [
  {
    id: "proofstack-light",
    name: "Semgrep Cyber Neutral",
    subtitle: "editorial off-white + deep emerald green + charcoal ink",
    lightSwatches: ["#FAFAFA", "#263A35", "#344E48", "#20C9A6"],
    darkSwatches: ["#0F1715", "#E1EBE6", "#ECF5F1", "#20C9A6"],
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
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
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [palette, setPaletteState] = useState<PaletteId>("proofstack-light");
  const [density, setDensityState] = useState<DensityMode>("comfortable");
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Compute resolved theme helper - System Default locked to Light Theme
  const getSystemTheme = useCallback((): ResolvedTheme => {
    return "light";
  }, []);

  // Initialize saved theme from localStorage on client mount (locked to light if unset)
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem("proofstack_theme") as ThemeMode | null;
      const initialTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
      setThemeState(initialTheme);
      setResolvedTheme(initialTheme);

      const savedPalette = (localStorage.getItem("proofstack_palette") as PaletteId) || "proofstack-light";
      const savedDensity = (localStorage.getItem("proofstack_density") as DensityMode) || "comfortable";
      setPaletteState("proofstack-light");
      setDensityState(savedDensity);
    } catch {}
  }, []);

  // Update DOM attributes whenever resolvedTheme, palette, or density change
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.setAttribute("data-palette", palette);
    root.setAttribute("data-density", density);

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [resolvedTheme, palette, density, mounted]);

  // System mode locked to light theme
  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme("light");
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("proofstack_theme", newTheme);
    } catch {}

    const resolved: ResolvedTheme = newTheme === "dark" ? "dark" : "light";
    setResolvedTheme(resolved);
  };

  const toggleTheme = () => {
    if (resolvedTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const setPalette = (p: PaletteId) => {
    setPaletteState(p);
    try {
      localStorage.setItem("proofstack_palette", p);
    } catch {}
  };

  const setDensity = (d: DensityMode) => {
    setDensityState(d);
    try {
      localStorage.setItem("proofstack_density", d);
    } catch {}
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
