"use client";

import { useEffect } from "react";

/**
 * Adds `.is-in` to every `[data-rv]` element once it scrolls into view.
 * Mirrors the reference site's reveal system: opacity 0 + 16px Y offset,
 * animating to rest with contentFadeUp (1s, cubic-bezier(.22,.61,.36,1)).
 */
export default function ScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rv]")
    );
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
          } else {
            // Reverse transition when scrolling away
            entry.target.classList.remove("is-in");
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
