import "./globals.css";
import AppShell from "@/components/AppShell";
import LenisScrollProvider from "@/components/LenisScrollProvider";

export const metadata = {
  title: "ProofStack | Autonomous DevSecOps Engine",
  description: "Autonomous DevSecOps Studio & Self-Healing Verification Engine with NVIDIA Nemotron & SHA-256 Evidence Ledger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" data-palette="cobalt-ledger">
      <body>
        <LenisScrollProvider>
          <AppShell>{children}</AppShell>
        </LenisScrollProvider>
      </body>
    </html>
  );
}
