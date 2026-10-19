"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/lib/theme";
import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import Footer from "@/components/footer/Footer";
import CopilotFab from "@/components/copilot/CopilotFab";
import CommandPalette from "@/components/command-palette/CommandPalette";
import IngestModal from "@/components/ingest-modal/IngestModal";
import AICopilotDrawer from "@/components/copilot/AICopilotDrawer";
import { ROLES } from "@/lib/roles";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, role, isInitialized } = useAuth();
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    isIngestModalOpen,
    setIsIngestModalOpen,
  } = useTheme();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [gKeyPressed, setGKeyPressed] = useState(false);

  const roleDef = ROLES[role] || ROLES.developer;

  // Global hotkeys & keyboard navigation (PDF p. 34)
  useEffect(() => {
    let gTimer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when inside input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Esc closes modal / drawer / command palette
      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isIngestModalOpen) {
          setIsIngestModalOpen(false);
          return;
        }
        if (isCopilotOpen) {
          setIsCopilotOpen(false);
          return;
        }
      }

      // Ctrl + / or Cmd + / -> Toggle AI Co-Pilot
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsCopilotOpen(!isCopilotOpen);
        return;
      }

      // Ctrl + K or Cmd + K -> Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // Two-key chord: "G then D", "G then S", "G then L"
      if (e.key.toLowerCase() === "g") {
        setGKeyPressed(true);
        clearTimeout(gTimer);
        gTimer = setTimeout(() => setGKeyPressed(false), 1000);
        return;
      }

      if (gKeyPressed) {
        setGKeyPressed(false);
        clearTimeout(gTimer);
        if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          router.push("/");
          return;
        }
        if (e.key.toLowerCase() === "s" && roleDef.canAccessStudio) {
          e.preventDefault();
          router.push("/studio");
          return;
        }
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          router.push("/ledger");
          return;
        }
      }

      // 1-6 keys for Cockpit tabs when inside /cockpit
      if (pathname.startsWith("/cockpit") && /^[1-6]$/.test(e.key)) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("proofstack:switch-cockpit-tab", {
            detail: { tab: parseInt(e.key) },
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(gTimer);
    };
  }, [
    isCommandPaletteOpen,
    isIngestModalOpen,
    isCopilotOpen,
    gKeyPressed,
    pathname,
    router,
    roleDef,
    setIsCopilotOpen,
    setIsIngestModalOpen,
  ]);

  // Public marketing homepage and login page have their own full-bleed layouts
  if (pathname === "/home" || (pathname === "/" && !session && isInitialized)) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)" }}>
        {children}
      </div>
    );
  }

  // Login page has its own standalone 2-panel layout
  if (pathname === "/login") {
    return (
      <div className="ps nosidebar app-frame" style={{ width: "100%", height: "100vh" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="ps app-frame">
      {/* 248px Left Sidebar */}
      <Sidebar onOpenNewTaskModal={() => setIsIngestModalOpen(true)} />

      {/* Main Area: Topbar (56px), Page Content (1fr), Footer (34px) */}
      <div className="main">
        <Topbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNewTaskModal={() => setIsIngestModalOpen(true)}
          onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        />

        <main className="page" id="main-content">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="page-container"
          >
            {children}
          </motion.div>
        </main>

        <Footer />
      </div>

      {/* Bottom-right Floating AI Co-Pilot Pill */}
      <CopilotFab />

      {/* AI Co-Pilot 400px Right Drawer */}
      <AICopilotDrawer />

      {/* Ingest Repo / New Task Modal */}
      <IngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
      />

      {/* Ctrl K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
      />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppShellInner>{children}</AppShellInner>
      </ThemeProvider>
    </AuthProvider>
  );
}
