"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import BrandLogo from "@/components/common/BrandLogo";
import { ArrowRight, Menu, X, Play } from "lucide-react";

interface MarketingHeaderProps {
  onOpenTour?: () => void;
}

const SECTION_LINKS = [
  { id: "hero", label: "Overview" },
  { id: "capabilities", label: "Capabilities" },
  { id: "showcase", label: "Showcase" },
  { id: "workflow", label: "How It Works" },
  { id: "trust", label: "Trust & Security" },
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
        rootMargin: "-25% 0px -65% 0px", // Focus trigger zone in top third of viewport
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
            ? "rgba(250, 250, 250, 0.94)"
            : "rgba(250, 250, 250, 0.8)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: isScrolled
            ? "1px solid var(--line, #DCE3E0)"
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
              background: "var(--surface, #FFFFFF)",
              padding: "4px 6px",
              borderRadius: "9999px",
              border: "1px solid var(--line-subtle, #EDF2F0)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
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
                    padding: "5px 13px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive
                      ? "var(--heading-primary, #344E48)"
                      : "var(--ink2, #42534E)",
                    background: isActive
                      ? "var(--surface-green, #E8F1EE)"
                      : "transparent",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {onOpenTour && (
              <button
                type="button"
                onClick={onOpenTour}
                style={{
                  display: "none",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12.5px",
                  color: "var(--ink2, #42534E)",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  background: "transparent",
                  fontWeight: 500,
                  transition: "all 150ms ease",
                }}
                className="lg:inline-flex hover:bg-[#E8F1EE]"
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
                color: "var(--ink2, #42534E)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "9999px",
                transition: "color 150ms ease, background 150ms ease",
              }}
              className="hover:text-[#263A35] hover:bg-[#E8F1EE]"
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
                border: "1px solid var(--line, #DCE3E0)",
                background: "var(--surface, #FFFFFF)",
                color: "var(--ink, #263A35)",
              }}
              className="md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(250, 250, 250, 0.98)",
            zIndex: 99,
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            borderBottom: "1px solid var(--line, #DCE3E0)",
            overflowY: "auto",
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
                letterSpacing: "0.1em",
                color: "var(--ink3, #71807A)",
                marginBottom: "4px",
                paddingLeft: "8px",
              }}
            >
              Navigation
            </span>
            {SECTION_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: activeSection === link.id ? 600 : 500,
                  color: "var(--ink, #263A35)",
                  background:
                    activeSection === link.id
                      ? "var(--surface-green, #E8F1EE)"
                      : "transparent",
                  textDecoration: "none",
                }}
              >
                {link.label}
                <ArrowRight size={14} style={{ opacity: 0.6 }} />
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "20px",
              borderTop: "1px solid var(--line, #DCE3E0)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pill-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Sign in to Workspace
            </Link>
            <Link
              href="/cockpit/TASK9142"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-pill-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Launch Live Cockpit
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
