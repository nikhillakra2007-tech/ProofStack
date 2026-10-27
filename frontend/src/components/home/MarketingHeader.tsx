"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import ThemeSelector from "@/components/common/ThemeSelector";
import { ArrowRight, Menu, X, Play } from "lucide-react";

interface MarketingHeaderProps {
  onOpenTour?: () => void;
}

const SECTION_LINKS = [
  { id: "hero", label: "Overview" },
  { id: "capabilities", label: "Capabilities" },
  { id: "workflow", label: "Workflow" },
  { id: "action", label: "Cockpit" },
];

export default function MarketingHeader({ onOpenTour }: MarketingHeaderProps) {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const sectionElements = SECTION_LINKS.map((link) =>
      document.getElementById(link.id)
    ).filter(Boolean) as HTMLElement[];

    if (!sectionElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "60px",
          background: isScrolled
            ? "color-mix(in srgb, var(--bg) 92%, transparent)"
            : "color-mix(in srgb, var(--bg) 80%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: isScrolled
            ? "1px solid var(--line)"
            : "1px solid transparent",
          transition: "border-color 200ms ease, background 200ms ease",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            width: "100%",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Brand Lockup */}
          <Link
            href="#hero"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <BrandLogo size="sm" showTagline={false} />
          </Link>

          {/* Center: In-Page Section Pills (Desktop) */}
          <nav
            style={{
              display: "none",
              alignItems: "center",
              gap: "4px",
              background: "var(--surface)",
              padding: "4px 6px",
              borderRadius: "9999px",
              border: "1px solid var(--line-subtle, var(--line))",
              boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.03))",
            }}
            className="md:flex"
          >
            {SECTION_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-pill ${isActive ? "active" : ""}`}
                  style={{
                    fontSize: "12.5px",
                    padding: "5px 14px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? "var(--heading-primary)"
                      : "var(--ink2)",
                    background: isActive
                      ? "var(--surface-green)"
                      : "transparent",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Theme Selector (Light / Dark / System) */}
            <ThemeSelector compact={true} />

            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  color: "var(--ink2)",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 150ms ease",
                }}
                className="lg:inline-flex hover:bg-[var(--surface-green)]"
              >
                <Play size={13} style={{ fill: "currentColor", opacity: 0.8 }} />
                Tour
              </button>
            )}

            <Link
              href="/login"
              style={{
                fontFamily: "var(--f-ui, 'Inter', sans-serif)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--ink2)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "9999px",
                transition: "color 150ms ease, background 150ms ease",
              }}
              className="hover:text-[var(--ink)] hover:bg-[var(--surface-green)]"
            >
              Sign in
            </Link>

            <Link
              href="/cockpit/TASK9142"
              className="btn-pill-primary"
              style={{
                height: "36px",
                padding: "0 16px",
                fontSize: "12.5px",
              }}
            >
              <span>Launch Cockpit</span>
              <ArrowRight size={13} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
              className="md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with Smooth Reveal */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "color-mix(in srgb, var(--bg) 98%, transparent)",
            zIndex: 99,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderBottom: "1px solid var(--line)",
            overflowY: "auto",
            animation: "fadeIn 150ms ease-out",
          }}
          className="md:hidden"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--f-mono, monospace)",
                fontSize: "10.5px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ink3)",
                marginBottom: "4px",
              }}
            >
              Section Jump
            </span>
            {SECTION_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background:
                    activeSection === link.id
                      ? "var(--surface-green)"
                      : "transparent",
                  color:
                    activeSection === link.id
                      ? "var(--heading-primary)"
                      : "var(--ink)",
                  fontWeight: activeSection === link.id ? 600 : 500,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{link.label}</span>
                {activeSection === link.id && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--brand)",
                    }}
                  />
                )}
              </a>
            ))}
          </div>

          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid var(--line)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px" }}>
              <span style={{ fontSize: "13px", color: "var(--ink2)", fontWeight: 500 }}>Color Theme</span>
              <ThemeSelector compact={false} />
            </div>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
                borderRadius: "9999px",
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontWeight: 500,
                fontSize: "13.5px",
                textDecoration: "none",
              }}
            >
              Sign In (4 Judge Demo Accounts)
            </Link>

            <Link
              href="/cockpit/TASK9142"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pill-primary"
              style={{
                height: "40px",
                fontSize: "13.5px",
                width: "100%",
              }}
            >
              <span>Launch Live Cockpit</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
