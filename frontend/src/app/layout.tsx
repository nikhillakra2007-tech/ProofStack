import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://sentinel-gate-seven.vercel.app"
  ),
  title: {
    default: "ProofStack | Autonomous DevSecOps & Evidence Ledger",
    template: "%s | ProofStack",
  },
  description:
    "Autonomous DevSecOps engine with zero-compromise compiler gates, live microVM DAST, NVIDIA Nemotron neural remediation, and cryptographic Merkle evidence ledger.",
  keywords: [
    "ProofStack",
    "DevSecOps",
    "NVIDIA Nemotron",
    "AST Repair",
    "Deterministic Verification",
    "DAST Sandbox",
    "Merkle Ledger",
    "Ed25519 Hardware Attestation",
  ],
  authors: [{ name: "ProofStack Engineering Team" }],
  openGraph: {
    title: "ProofStack | Autonomous DevSecOps & Evidence Ledger",
    description:
      "Deterministic code decides; generative AI only proposes. Constrained AST remediation powered by NVIDIA Nemotron with 8-gate compiler interlocks.",
    siteName: "ProofStack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProofStack | Autonomous DevSecOps & Evidence Ledger",
    description:
      "Deterministic compiler verification engine with live DAST exploit replays and cryptographic Merkle ledgers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className="light" data-palette="proofstack-light" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
