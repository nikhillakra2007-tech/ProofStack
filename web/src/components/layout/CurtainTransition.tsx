"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";

interface CurtainContextType {
  navigateWithCurtain: (href: string, label?: string) => void;
  isBusy: boolean;
}

const CurtainContext = createContext<CurtainContextType>({
  navigateWithCurtain: () => {},
  isBusy: false,
});

export const useCurtain = () => useContext(CurtainContext);

export function CurtainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("Sentinel Gate");
  const [isBusy, setIsBusy] = useState(false);
  
  const topBladeRef = useRef<HTMLDivElement>(null);
  const bottomBladeRef = useRef<HTMLDivElement>(null);
  const centerBadgeRef = useRef<HTMLDivElement>(null);

  const navigateWithCurtain = useCallback(
    (href: string, targetLabel = "Sentinel Gate") => {
      if (isBusy) return;

      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }

      setIsBusy(true);
      setLabel(targetLabel);
      setIsOpen(true);

      const topBlade = topBladeRef.current;
      const bottomBlade = bottomBladeRef.current;
      const centerBadge = centerBadgeRef.current;

      if (!topBlade || !bottomBlade) {
        router.push(href);
        setIsBusy(false);
        setIsOpen(false);
        return;
      }

      const ease = "cubic-bezier(.76, 0, .24, 1)";
      
      // Top blade slides down from -100% to 0
      const animTopIn = topBlade.animate(
        [{ transform: "translateY(-100%)" }, { transform: "translateY(0%)" }],
        { duration: 420, easing: ease, fill: "forwards" }
      );

      // Bottom blade slides up in reverse from 100% to 0
      const animBottomIn = bottomBlade.animate(
        [{ transform: "translateY(100%)" }, { transform: "translateY(0%)" }],
        { duration: 420, easing: ease, fill: "forwards" }
      );

      // Center badge fades and scales in
      if (centerBadge) {
        centerBadge.animate(
          [{ opacity: 0, transform: "scale(0.85)" }, { opacity: 1, transform: "scale(1)" }],
          { duration: 320, delay: 180, easing: "ease-out", fill: "forwards" }
        );
      }

      Promise.all([animTopIn.finished, animBottomIn.finished])
        .then(() => {
          router.push(href);

          // Wait a tick for router to mount new view
          setTimeout(() => {
            // Reverse slide out: top blade slides back up to -100%, bottom blade slides back down to 100%
            const animTopOut = topBlade.animate(
              [{ transform: "translateY(0%)" }, { transform: "translateY(-100%)" }],
              { duration: 440, easing: ease, fill: "forwards" }
            );

            const animBottomOut = bottomBlade.animate(
              [{ transform: "translateY(0%)" }, { transform: "translateY(100%)" }],
              { duration: 440, easing: ease, fill: "forwards" }
            );

            if (centerBadge) {
              centerBadge.animate(
                [{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.1)" }],
                { duration: 250, easing: "ease-in", fill: "forwards" }
              );
            }

            Promise.all([animTopOut.finished, animBottomOut.finished])
              .then(() => {
                animTopIn.cancel();
                animBottomIn.cancel();
                animTopOut.cancel();
                animBottomOut.cancel();
                setIsOpen(false);
                setIsBusy(false);
              })
              .catch(() => {
                setIsOpen(false);
                setIsBusy(false);
              });
          }, 150);
        })
        .catch(() => {
          setIsOpen(false);
          setIsBusy(false);
        });
    },
    [isBusy, router]
  );

  return (
    <CurtainContext.Provider value={{ navigateWithCurtain, isBusy }}>
      {children}
      
      {/* Reverse Dual-Blade Sliding Overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          pointerEvents: isOpen ? "auto" : "none",
          display: isOpen ? "block" : "none",
        }}
      >
        {/* Top Blade (Slides down from top) */}
        <div
          ref={topBladeRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50.5%",
            background: "linear-gradient(180deg, #0E120D 0%, #151B13 70%, #20291D 100%)",
            borderBottom: "1.5px solid rgba(215, 190, 130, 0.4)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.7)",
            transform: "translateY(-100%)",
          }}
        />

        {/* Bottom Blade (Slides up from bottom in reverse) */}
        <div
          ref={bottomBladeRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "50.5%",
            background: "linear-gradient(0deg, #0E120D 0%, #151B13 70%, #20291D 100%)",
            borderTop: "1.5px solid rgba(215, 190, 130, 0.4)",
            boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.7)",
            transform: "translateY(100%)",
          }}
        />

        {/* Center Glowing Seam & Badge */}
        <div
          ref={centerBadgeRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            opacity: 0,
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "rgba(21, 27, 19, 0.95)",
              border: "1.5px solid #D7BE82",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 35px rgba(215, 190, 130, 0.35)",
              color: "#D7BE82",
            }}
          >
            <ShieldCheck style={{ width: "28px", height: "28px" }} />
          </div>

          <div
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "#D7BE82",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(14, 18, 13, 0.8)",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(215, 190, 130, 0.25)",
            }}
          >
            <Sparkles style={{ width: "12px", height: "12px", color: "#D7BE82" }} />
            <span>TRANSITIONING TO {label.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </CurtainContext.Provider>
  );
}

export default CurtainProvider;
