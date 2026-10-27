"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme";

export default function CopilotFab() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  // Position: null means default bottom: 20px, right: 20px
  // NOT saved in localStorage, so refresh resets to default
  const [position, setPosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
    hasMoved: boolean;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Monitor DOM for tour popover to offset FAB and prevent overlap
  useEffect(() => {
    const checkTour = () => {
      const active = Boolean(document.querySelector(".tour-popover-card"));
      setIsTourActive(active);
    };
    checkTour();
    const observer = new MutationObserver(checkTour);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Only handle primary mouse button
    if (e.button !== 0) return;
    e.preventDefault();

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
    };

    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: rect.left,
      initialTop: rect.top,
      hasMoved: false,
    };

    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }

      // Constrain inside viewport
      const buttonWidth = buttonRef.current?.offsetWidth || 140;
      const buttonHeight = buttonRef.current?.offsetHeight || 44;
      const maxX = window.innerWidth - buttonWidth - 10;
      const maxY = window.innerHeight - buttonHeight - 10;

      const newX = Math.max(10, Math.min(maxX, dragRef.current.initialLeft + dx));
      const newY = Math.max(10, Math.min(maxY, dragRef.current.initialTop + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragRef.current.startX;
      const dy = touch.clientY - dragRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }

      const buttonWidth = buttonRef.current?.offsetWidth || 140;
      const buttonHeight = buttonRef.current?.offsetHeight || 44;
      const maxX = window.innerWidth - buttonWidth - 10;
      const maxY = window.innerHeight - buttonHeight - 10;

      const newX = Math.max(10, Math.min(maxX, dragRef.current.initialLeft + dx));
      const newY = Math.max(10, Math.min(maxY, dragRef.current.initialTop + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        if (!dragRef.current.hasMoved) {
          // It was a single click without dragging -> toggle drawer
          setIsCopilotOpen(!isCopilotOpen);
        }
        dragRef.current = null;
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      if (dragRef.current) {
        if (!dragRef.current.hasMoved) {
          setIsCopilotOpen(!isCopilotOpen);
        }
        dragRef.current = null;
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, setIsCopilotOpen]);

  // Double-click resets to default bottom-right position
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition({ x: null, y: null });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="fab"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      title="Click to chat · Drag to move · Double-click to reset position"
      aria-label="Toggle AI Co-Pilot drawer (Draggable)"
      style={{
        position: "fixed",
        left: position.x !== null ? `${position.x}px` : undefined,
        top: position.y !== null ? `${position.y}px` : undefined,
        bottom: position.y === null ? (isTourActive ? "24px" : "20px") : undefined,
        right: position.x === null ? (isTourActive ? "420px" : "20px") : undefined,
        zIndex: 9995,
        cursor: isDragging ? "grabbing" : "pointer",
        userSelect: "none",
        touchAction: "none",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "9999px",
        backgroundColor: "#10B981",
        color: "#FFFFFF",
        boxShadow: isDragging
          ? "0 14px 28px rgba(16, 185, 129, 0.45), 0 0 16px rgba(16, 185, 129, 0.5)"
          : "0 6px 18px rgba(16, 185, 129, 0.35)",
        transform: isDragging ? "scale(1.05)" : "scale(1)",
        transition: isDragging ? "none" : "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Drag Grip Icon */}
      <span
        style={{
          cursor: "grab",
          opacity: 0.75,
          fontSize: "13px",
          lineHeight: 1,
          letterSpacing: "-1px",
          display: "inline-flex",
          alignItems: "center",
        }}
        title="Drag grip"
      >
        ⋮⋮
      </span>

      {/* Sparkle Icon */}
      <svg
        style={{
          width: "16px",
          height: "16px",
          minWidth: "16px",
          minHeight: "16px",
          flexShrink: 0,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
        viewBox="0 0 24 24"
      >
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
      </svg>

      <div style={{ fontWeight: 600, fontSize: "13px", letterSpacing: "0.01em" }}>
        ✨ AI Co-Pilot
      </div>
    </button>
  );
}
