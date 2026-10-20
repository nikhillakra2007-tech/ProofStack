"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
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
  isStar: boolean;
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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Multi-color cyber palette for stellar constellation nodes
    const nodePalette = [
      { color: "rgba(255, 255, 255, 0.95)", glow: "rgba(255, 255, 255, 0.7)" },  // Starlight White
      { color: "rgba(56, 189, 248, 0.95)", glow: "rgba(56, 189, 248, 0.6)" },   // Electric Azure
      { color: "rgba(245, 158, 11, 0.95)", glow: "rgba(245, 158, 11, 0.6)" },   // Cyber Gold
      { color: "rgba(16, 185, 129, 0.95)", glow: "rgba(16, 185, 129, 0.6)" },   // Neon Emerald
      { color: "rgba(168, 85, 247, 0.95)", glow: "rgba(168, 85, 247, 0.6)" },   // Cosmic Violet
      { color: "rgba(244, 63, 94, 0.90)", glow: "rgba(244, 63, 94, 0.55)" },    // Oracle Crimson
    ];

    // Create mixture of background twinkling stars and mobile network nodes
    const count = Math.min(110, Math.floor((width * height) / 12000));
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const isStar = Math.random() > 0.45;
      const palette = nodePalette[Math.floor(Math.random() * nodePalette.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: isStar ? (Math.random() - 0.5) * 0.15 : (Math.random() - 0.5) * 0.65,
        vy: isStar ? (Math.random() - 0.5) * 0.15 : (Math.random() - 0.5) * 0.65,
        size: isStar ? Math.random() * 1.5 + 0.8 : Math.random() * 2.4 + 1.2,
        color: palette.color,
        glowColor: palette.glow,
        baseAlpha: Math.random() * 0.5 + 0.35,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        isStar,
      });
    }

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 200,
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

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const isLightMode = document.documentElement.classList.contains("light") || 
                          document.documentElement.getAttribute("data-theme") === "light";

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion
        p.x += p.vx;
        p.y += p.vy;

        // Bounce borders smoothly
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        // Gravitational interaction with mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const pull = (1 - dist / mouse.radius) * 0.07;
            p.x += dx * pull;
            p.y += dy * pull;

            // Connect mouse to nearby nodes with a laser filament
            if (!isLightMode) {
              const mouseAlpha = (1 - dist / mouse.radius) * 0.45;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${mouseAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Twinkle pulsating opacity
        p.pulsePhase += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.25;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isLightMode) {
          // Clean architectural slate/azure in light mode
          ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0.2, currentAlpha * 0.6)})`;
          ctx.fill();
        } else {
          // Vibrant glowing stars & cyber nodes in dark mode
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = p.isStar ? 4 : 8;
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw networking filament connections between close nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          const maxDist = 125;

          if (dist < maxDist) {
            const filamentAlpha = (1 - dist / maxDist) * (isLightMode ? 0.12 : 0.28);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            if (isLightMode) {
              ctx.strokeStyle = `rgba(2, 132, 199, ${filamentAlpha})`;
              ctx.lineWidth = 0.7;
            } else {
              // Cyber network filament connecting nodes
              ctx.strokeStyle = `rgba(56, 189, 248, ${filamentAlpha})`;
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();
          }
        }
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
      style={{ opacity: 0.85 }}
    />
  );
};

export default ParticleField;
