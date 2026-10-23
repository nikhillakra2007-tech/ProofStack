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
      {/* Interactive Particle & Star Constellation Network */}
      <ParticleField />

      {/* Restrained Cyber Ambient Radiance */}
      <div
        className="orb-ambient-1 pointer-events-none fixed -top-40 left-[10%] w-[550px] h-[550px] rounded-full blur-[120px] -z-10"
        style={{
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 70%)",
        }}
      />
      <div
        className="orb-ambient-2 pointer-events-none fixed top-[45%] -right-40 w-[600px] h-[600px] rounded-full blur-[130px] -z-10"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 70%)",
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
