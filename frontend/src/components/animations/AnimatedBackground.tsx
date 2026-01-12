"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AnimatedBackgroundProps {
  variant?: "default" | "subtle";
}

/**
 * Animated gradient background component matching Home page design system
 * Uses GSAP for smooth, premium gradient animation
 */
export default function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        backgroundPosition: "200% 200%",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "linear",
      });
    }
  }, []);

  return (
    <>
      {/* Animated Gradient Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-[length:300%_300%] bg-gradient-to-br
        from-indigo-500/30 via-purple-500/30 to-cyan-400/30
        dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-cyan-900/40"
      />

      {/* Floating Glow Blobs */}
      {variant === "default" && (
        <>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/40 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/40 blur-3xl rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
        </>
      )}

      {variant === "subtle" && (
        <>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/20 blur-3xl rounded-full" />
        </>
      )}
    </>
  );
}
