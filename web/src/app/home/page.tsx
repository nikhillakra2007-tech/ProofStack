"use client";

import React, { useState } from "react";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import ScrollRevealObserver from "@/components/providers/ScrollRevealObserver";
import MarketingHeader from "@/components/home/MarketingHeader";
import MarketingHero from "@/components/home/MarketingHero";
import CoreProductSections from "@/components/home/CoreProductSections";
import TourModal from "@/components/home/TourModal";

export default function PublicHomePage() {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  return (
    <SmoothScrollProvider>
      <ScrollRevealObserver />
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg, #FAFAFA)",
          color: "var(--ink, #263A35)",
          overflowX: "hidden",
        }}
      >
        {/* Section A: Sticky Semgrep-Style Header with In-Page Scroll-Spy Navigation */}
        <MarketingHeader onOpenTour={() => setIsTourModalOpen(true)} />

        {/* Section B: Semgrep Composition Hero with Massive Framed Product Visual */}
        <MarketingHero onOpenTour={() => setIsTourModalOpen(true)} />

        {/* Sections C, D, E, F, G & Footer: Capabilities, Showcase, Workflow, Trust, Final CTA & Footer */}
        <CoreProductSections />

        {/* Interactive Tour Modal */}
        <TourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
        />
      </div>
    </SmoothScrollProvider>
  );
}
