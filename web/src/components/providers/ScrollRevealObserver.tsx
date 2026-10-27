"use client";

import React, { useEffect } from "react";

export default function ScrollRevealObserver() {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const elements = document.querySelectorAll(".scroll-reveal:not(.is-revealed)");
    elements.forEach((el) => observer.observe(el));

    // Fallback safety timeout: ensure any elements in viewport are revealed even if observer is delayed
    const timer = setTimeout(() => {
      document.querySelectorAll(".scroll-reveal:not(.is-revealed)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150) {
          el.classList.add("is-revealed");
        }
      });
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return null;
}
