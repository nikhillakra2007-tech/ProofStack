import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ProofStack Cockpit — Autonomous Forensic Verification",
  description: "Evidence-driven performance & security verification gauntlet with cryptographic ledger",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ps-paper text-ps-ink font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}

