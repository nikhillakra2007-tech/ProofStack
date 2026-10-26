"use client";

import React, { useState } from "react";
import MarketingHeader from "@/components/home/MarketingHeader";
import MarketingHero from "@/components/home/MarketingHero";
import ScrollStorySections from "@/components/home/ScrollStorySections";
import TourModal from "@/components/home/TourModal";

export default function PublicHomePage() {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        overflowX: "hidden",
      }}
    >
      {/* Sticky Marketing Header (64px, 56px on scroll) */}
      <MarketingHeader onOpenTour={() => setIsTourModalOpen(true)} />

      {/* Hero Section (Above the Fold) */}
      <MarketingHero onOpenTour={() => setIsTourModalOpen(true)} />

      {/* 14-Section Scroll Story */}
      <ScrollStorySections />

      {/* Interactive 2-Minute Tour Modal */}
      <TourModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />
    </div>
  );
}
