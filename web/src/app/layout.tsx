import "./globals.css";
import LenisScrollProvider from "@/components/scroll-provider/ScrollProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/lib/theme";
import { CurtainProvider } from "@/components/layout/CurtainTransition";

export const metadata = {
  title: "ProofStack | Autonomous DevSecOps Engine",
  description: "Autonomous Security Remediation & Cryptographic AST Verification Platform with NVIDIA Nemotron",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" data-palette="quantum-aurora">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-[#07090E] text-[#F8FAFC]">
        <LenisScrollProvider>
          <ThemeProvider>
            <AuthProvider>
              <CurtainProvider>
                {children}
              </CurtainProvider>
            </AuthProvider>
          </ThemeProvider>
        </LenisScrollProvider>
      </body>
    </html>
  );
}
