import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofStack Cockpit",
  description: "Evidence-driven Python performance investigation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ps-paper text-ps-ink font-sans">{children}</body>
    </html>
  );
}
