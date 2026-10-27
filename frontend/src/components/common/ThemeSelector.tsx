"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/lib/theme";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeSelectorProps {
  compact?: boolean;
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Keyboard Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <Sun size={13} /> },
    { id: "dark", label: "Dark", icon: <Moon size={13} /> },
    { id: "system", label: "System", icon: <Laptop size={13} /> },
  ];

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Theme selector: currently ${theme}`}
        aria-expanded={isOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: compact ? "0" : "6px",
          height: "32px",
          width: compact ? "32px" : "auto",
          padding: compact ? "0" : "0 10px",
          borderRadius: "9999px",
          background: "var(--surface)",
          color: "var(--ink2)",
          border: "1px solid var(--line)",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: 500,
          transition: "all 150ms ease",
        }}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
      >
        {resolvedTheme === "dark" ? (
          <Moon size={14} style={{ color: "var(--brand)" }} />
        ) : (
          <Sun size={14} style={{ color: "var(--brand)" }} />
        )}
        {!compact && (
          <span style={{ textTransform: "capitalize", fontSize: "11.5px" }}>{theme}</span>
        )}
      </button>

      {/* Dropdown Menu with Exit Animation */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Theme options"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 110,
            minWidth: "130px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "10px",
            padding: "4px",
            boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.12))",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            animation: "fadeIn 120ms ease-out",
          }}
        >
          {modes.map((m) => {
            const isSelected = theme === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setTheme(m.id);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: isSelected ? "var(--surface-green)" : "transparent",
                  color: isSelected ? "var(--heading-primary)" : "var(--ink2)",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: isSelected ? 600 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 100ms ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                {isSelected && <Check size={13} style={{ color: "var(--brand)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
