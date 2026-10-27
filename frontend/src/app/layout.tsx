import "../styles/tokens.css";
import "../styles/app-components.css";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
