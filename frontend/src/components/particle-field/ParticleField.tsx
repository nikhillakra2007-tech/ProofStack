"use client";

import React, { useEffect, useRef } from "react";

interface MoleculeNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  glowColor: string;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  isCore: boolean;
}

export const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check for user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cohesive, vibrant cybersecurity / molecule chemistry palette
    const nodePalette = [
      { color: "rgba(56, 189, 248, 0.85)", glow: "rgba(56, 189, 248, 0.45)" },  // Cyber Cyan
      { color: "rgba(16, 185, 129, 0.9)", glow: "rgba(16, 185, 129, 0.5)" },    // Security Emerald
      { color: "rgba(129, 140, 248, 0.8)", glow: "rgba(129, 140, 248, 0.4)" },  // Tech Violet
      { color: "rgba(248, 250, 252, 0.75)", glow: "rgba(248, 250, 252, 0.35)" },// Radiant White
    ];

    // Richer molecule density for enhanced visual aesthetics
    const count = Math.min(95, Math.max(45, Math.floor((width * height) / 14000)));
    const particles: MoleculeNode[] = [];

    for (let i = 0; i < count; i++) {
      const isCore = Math.random() > 0.65;
      const palette = nodePalette[Math.floor(Math.random() * nodePalette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: isCore ? (Math.random() - 0.5) * 0.22 : (Math.random() - 0.5) * 0.48,
        vy: isCore ? (Math.random() - 0.5) * 0.22 : (Math.random() - 0.5) * 0.48,
        size: isCore ? Math.random() * 2.2 + 1.4 : Math.random() * 1.5 + 0.8,
        color: palette.color,
        glowColor: palette.glow,
        baseAlpha: Math.random() * 0.4 + 0.25,
        pulseSpeed: Math.random() * 0.025 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        isCore,
      });
    }

    // Static fallback for reduced motion preference
    if (prefersReducedMotion) {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      return;
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 160,
      active: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isLightMode =
        document.documentElement.classList.contains("light") ||
        document.documentElement.getAttribute("data-theme") === "light";

      // 1. Draw Connecting Molecular Filaments First
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          const maxDist = 120;

          if (dist < maxDist) {
            const filamentAlpha = (1 - dist / maxDist) * (isLightMode ? 0.08 : 0.18);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isLightMode
              ? `rgba(15, 23, 42, ${filamentAlpha})`
              : `rgba(16, 185, 129, ${filamentAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // 2. Draw Molecule Nodes and Glowing Joints
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const pull = (1 - dist / mouse.radius) * 0.05;
            p.x += dx * pull;
            p.y += dy * pull;
          }
        }

        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = Math.max(0.2, p.baseAlpha + Math.sin(p.pulsePhase) * 0.18);

        // Core glow
        if (p.isCore && !isLightMode) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = p.glowColor;
          ctx.fill();
        }

        // Main molecule circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isLightMode) {
          ctx.fillStyle = `rgba(15, 23, 42, ${currentAlpha * 0.6})`;
        } else {
          ctx.fillStyle = p.color;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.72 }}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
