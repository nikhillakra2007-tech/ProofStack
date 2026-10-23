import React from "react";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { ScrollProvider } from "@/components/scroll-provider/ScrollProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CurtainProvider } from "@/components/layout/CurtainTransition";

export const metadata: Metadata = {
  title: "Sentinel Gate | Deterministic AST Security & Exploit Oracle",
  description: "Autonomous AST vulnerability remediation, 12 DAST exploit sandboxes, and SHA-256 Merkle audit chains powered by NVIDIA Nemotron.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[var(--bg)] text-[var(--ink)] min-h-screen selection:bg-emerald-500/25 selection:text-[var(--ink)] antialiased font-sans">
        <ScrollProvider>
          <AuthProvider>
            <CurtainProvider>
              {children}
            </CurtainProvider>
          </AuthProvider>
        </ScrollProvider>
      </body>
    </html>
  );
}
