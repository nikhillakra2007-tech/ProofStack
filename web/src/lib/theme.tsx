"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type PaletteId =
  | "proofstack-light"
  | "cobalt-ledger"
  | "sage-walnut";

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
  {
    id: "cobalt-ledger",
    name: "Cobalt Ledger",
    subtitle: "cobalt blue + tangerine orange + cream ivory",
    lightSwatches: ["#F6F1E6", "#1B1F2A", "#1F3FBF", "#F26B1D"],
    darkSwatches: ["#0C1322", "#E2E8F0", "#3B82F6", "#FB923C"],
  },
  {
    id: "sage-walnut",
    name: "Sage & Walnut",
    subtitle: "sage green + walnut brown + amber glow",
    lightSwatches: ["#EDEFE3", "#2A2620", "#4A6A4F", "#E8A33D"],
    darkSwatches: ["#141712", "#E5E7EB", "#5C7F62", "#FBBF24"],
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
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [palette, setPaletteState] = useState<PaletteId>("proofstack-light");
  const [density, setDensityState] = useState<DensityMode>("comfortable");
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Compute resolved theme helper
  const getSystemTheme = useCallback((): ResolvedTheme => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Initialize saved theme from localStorage on client mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem("proofstack_theme") as ThemeMode | null;
      const initialTheme: ThemeMode = savedTheme && ["light", "dark", "system"].includes(savedTheme)
        ? savedTheme
        : "system";
      setThemeState(initialTheme);

      const computedResolved: ResolvedTheme =
        initialTheme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : initialTheme;
      setResolvedTheme(computedResolved);

      const savedPalette = (localStorage.getItem("proofstack_palette") as PaletteId) || "proofstack-light";
      const savedDensity = (localStorage.getItem("proofstack_density") as DensityMode) || "comfortable";
      setPaletteState(savedPalette);
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

  // Listen to OS system color-scheme changes when theme === "system"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("proofstack_theme", newTheme);
    } catch {}

    const resolved: ResolvedTheme =
      newTheme === "system" ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
  };

  const toggleTheme = () => {
    // Cycle: light -> dark -> system -> light
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
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
