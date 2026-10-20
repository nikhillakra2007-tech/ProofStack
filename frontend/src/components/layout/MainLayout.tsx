"use client";

import React, { ReactNode } from "react";
import HorizonNav from "@/components/horizon-nav/HorizonNav";
import Footer from "@/components/footer/Footer";
import ParticleField from "@/components/particle-field/ParticleField";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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
      {/* Interactive Particle Constellation Joining Background */}
      <ParticleField />

      {/* Ambient Radiant Glows in Soft Fawn (D7BE82) & Saddle Brown (7A4419) & Ebony (515A47) */}
      <div
        className="orb-ambient-1"
        style={{
          position: "fixed",
          top: "-160px",
          left: "15%",
          width: "650px",
          height: "650px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(215, 190, 130, 0.14) 0%, rgba(81, 90, 71, 0.08) 50%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="orb-ambient-2"
        style={{
          position: "fixed",
          top: "45%",
          right: "-160px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(122, 68, 25, 0.16) 0%, rgba(215, 190, 130, 0.06) 50%, transparent 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Sticky Top Horizon Dock */}
      <HorizonNav />

      {/* Main Viewport */}
      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "36px 24px 64px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>

      {/* Engineering Footer */}
      <Footer />
    </div>
  );
}

export default MainLayout;
