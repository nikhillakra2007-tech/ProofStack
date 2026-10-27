"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

interface ThemeSelectorProps {
  compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const nextMode = resolvedTheme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextMode} mode`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className="theme-toggle-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? "0" : "6px",
        height: "34px",
        width: compact ? "34px" : "auto",
        padding: compact ? "0" : "0 12px",
        borderRadius: "9999px",
        background: "var(--surface)",
        color: "var(--heading-primary)",
        border: "1px solid var(--line)",
        cursor: "pointer",
        fontSize: "12.5px",
        fontWeight: 600,
        transition: "all 150ms ease",
      }}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={15} style={{ color: "var(--brand)" }} />
      ) : (
        <Moon size={15} style={{ color: "var(--brand)" }} />
      )}
      {!compact && (
        <span style={{ fontSize: "12px", color: "var(--ink2)" }}>
          {resolvedTheme === "dark" ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
