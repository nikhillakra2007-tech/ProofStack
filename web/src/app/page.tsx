"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PublicHomePage from "./home/page";
import DashboardSections from "@/components/dashboard-sections/DashboardSections";

export default function DashboardPage() {
  const { session, isAuthenticated, isInitialized } = useAuth();

  // If not initialized yet, display minimal loader
  if (!isInitialized) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "80vh" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: "13px", color: "var(--ink2)" }}>
          Loading ProofStack workspace…
        </div>
      </div>
    );
  }

  // 1. Unauthenticated visitors see the editorial Marketing Homepage
  if (!isAuthenticated || !session) {
    return <PublicHomePage />;
  }

  // 2. Authenticated team members see the peaceful, visual, multi-section Dashboard with HorizonNav
  return (
    <MainLayout>
      <DashboardSections />
    </MainLayout>
  );
}
