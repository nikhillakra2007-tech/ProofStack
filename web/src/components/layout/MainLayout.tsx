"use client";

import React, { ReactNode } from "react";
import HorizonNav from "@/components/horizon-nav/HorizonNav";
import Footer from "@/components/footer/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Ambient Celestial Glows (Quantum Aurora: Obsidian, Cyan, Indigo) */}
      <div
        className="orb-glow-1"
        style={{
          position: "fixed",
          top: "-150px",
          left: "15%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="orb-glow-2"
        style={{
          position: "fixed",
          top: "40%",
          right: "-150px",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129, 140, 248, 0.10) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Horizon Navigation Dock (Zero sidebars) */}
      <HorizonNav />

      {/* Main Content Viewport */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px 24px 64px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>

      {/* High-Tech Soothing Footer */}
      <Footer />
    </div>
  );
}
