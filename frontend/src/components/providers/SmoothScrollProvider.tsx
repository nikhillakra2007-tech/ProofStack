"use client";

import React, { useEffect, useRef } from "react";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let lenisInstance: any = null;
    let rafId: number;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Fast-path: On mobile or small screens, use native browser scrolling without RAF loop
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth <= 960 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ));

    if (!prefersReducedMotion && !isMobile) {
      import("lenis")
        .then(({ default: Lenis }) => {
          const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.0,
            infinite: false,
            syncTouch: false,
          });

          lenisRef.current = lenis;
          lenisInstance = lenis;

          // Throttle is-scrolling class to pause heavy background animations during active scroll
          let isScrolling = false;
          let scrollTimeout: NodeJS.Timeout;

          const onScroll = () => {
            if (!isScrolling) {
              isScrolling = true;
              document.body.classList.add("is-scrolling");
            }
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              isScrolling = false;
              document.body.classList.remove("is-scrolling");
            }, 120);
          };

          lenis.on("scroll", onScroll);

          function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
          }
          rafId = requestAnimationFrame(raf);
        })
        .catch((err) => {
          console.warn("Lenis smooth scroll failed to initialize:", err);
        });
    }

    // Global in-page anchor navigation handler with sticky header offset (-72px)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          const targetTop = element.getBoundingClientRect().top + window.pageYOffset - 72;

          if (prefersReducedMotion || isMobile) {
            window.scrollTo({ top: targetTop, behavior: "auto" });
          } else if (lenisRef.current) {
            lenisRef.current.scrollTo(element as HTMLElement, {
              offset: -72,
              duration: 0.7,
            });
          } else {
            window.scrollTo({ top: targetTop, behavior: "smooth" });
          }
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { passive: false });

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
