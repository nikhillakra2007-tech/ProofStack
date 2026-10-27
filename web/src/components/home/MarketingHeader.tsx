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
  { id: "overview", label: "Overview" },
  { id: "product", label: "Product" },
  { id: "capabilities", label: "Capabilities" },
  { id: "workflow", label: "How it works" },
  { id: "faq", label: "FAQ" },
];

export default function MarketingHeader({ onOpenTour }: MarketingHeaderProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for backdrop blur and subtle border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
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
        rootMargin: "-15% 0px -55% 0px",
        threshold: 0,
      }
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Smooth scroll handler with 70px offset for sticky header
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      const top = elem.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(targetId);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "64px",
          background: isScrolled
            ? "color-mix(in srgb, var(--bg) 94%, transparent)"
            : "color-mix(in srgb, var(--bg) 84%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
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
          {/* Brand Lockup: Logo immediately to the left of the website name, horizontally aligned */}
          <Link
            href="#overview"
            onClick={(e) => handleNavClick(e, "overview")}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            aria-label="ProofStack NVIDIA MODEL Home"
          >
            <BrandLogo size="md" showTagline={false} />
          </Link>

          {/* Center: In-Page Section Links (Desktop Navigation - Guaranteed Visible) */}
          <nav
            className="header-desktop-nav"
            aria-label="Landing page section navigation"
          >
            {SECTION_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className={`nav-pill ${isActive ? "active" : ""}`}
                  style={{
                    fontSize: "13px",
                    padding: "5px 14px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? "var(--heading-primary)"
                      : "var(--ink2)",
                    background: isActive
                      ? "var(--surface-green)"
                      : "transparent",
                    textDecoration: "none",
                    borderRadius: "9999px",
                    transition: "all 140ms ease",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Simple 1-Click Light/Dark Toggle */}
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
              className="btn-pill-primary"
              style={{
                height: "36px",
                padding: "0 18px",
                fontSize: "13px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>Sign in</span>
              <ArrowRight size={13} />
            </Link>

            {/* Mobile Hamburger Button (Strictly hidden on desktop via .header-mobile-btn) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="header-mobile-btn"
              style={{
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
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with Smooth Reveal & Clean Links in BOTH Directions */}
      <div
        className={`mobile-menu-drawer ${mobileMenuOpen ? "is-open" : ""}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink3)", marginBottom: "4px" }}>
          Sections
        </div>
        {SECTION_LINKS.map((link) => {
          const isActive = activeSection === link.id;
          return (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              style={{
                fontSize: "15px",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--brand)" : "var(--heading-primary)",
                padding: "10px 14px",
                borderRadius: "8px",
                background: isActive ? "var(--surface-green)" : "var(--surface)",
                border: `1px solid ${isActive ? "var(--brand)" : "var(--line)"}`,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 180ms ease",
              }}
            >
              <span>{link.label}</span>
              {isActive && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--brand)" }} />}
            </a>
          );
        })}

        <div style={{ height: "1px", background: "var(--line)", margin: "10px 0" }} />

        <Link
          href="/login"
          onClick={() => setMobileMenuOpen(false)}
          className="btn-pill-primary"
          style={{
            height: "42px",
            justifyContent: "center",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          <span>Sign in</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
