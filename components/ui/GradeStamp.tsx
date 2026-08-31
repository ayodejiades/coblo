"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export type GradeType = "A" | "B" | "C" | "D" | "F";

export interface GradeStampProps {
  grade: GradeType;
  size?: "sm" | "md" | "lg";
  className?: string;
  animateOnChange?: boolean;
}

function playTactileThud() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch {
    // Audio autoplay restrictions ignored gracefully
  }
}

export const GradeStamp: React.FC<GradeStampProps> = ({
  grade,
  size = "md",
  className,
  animateOnChange = true,
}) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (animateOnChange) {
      setAnimKey((prev) => prev + 1);
      playTactileThud();
    }
  }, [grade, animateOnChange]);

  const gradeColors: Record<GradeType, string> = {
    A: "bg-[#CCFF00] text-black",
    B: "bg-[#00E676] text-black",
    C: "bg-[#FF6B1A] text-black",
    D: "bg-[#FF6B1A] text-black",
    F: "bg-[#FF2E93] text-black",
  };

  const sizeStyles = {
    sm: "w-16 h-16 border-[3px] shadow-[4px_4px_0_0_#000] text-3xl",
    md: "w-24 h-24 sm:w-28 sm:h-28 border-[4px] sm:border-[5px] shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000] text-5xl sm:text-6xl",
    lg: "w-32 h-32 sm:w-40 sm:h-40 border-[5px] shadow-[8px_8px_0_0_#000] sm:shadow-[12px_12px_0_0_#000] text-7xl sm:text-8xl",
  };

  return (
    <div
      key={animKey}
      className={cn(
        "aspect-square border-black flex flex-col items-center justify-center font-display select-none shrink-0 relative",
        "-rotate-3 transition-transform duration-100",
        animateOnChange && "animate-stamp",
        gradeColors[grade] || "bg-[#D9D6CC] text-black",
        sizeStyles[size],
        className
      )}
      style={{ transformOrigin: "center center" }}
      aria-label={`Grade: ${grade}`}
    >
      <span className="font-extrabold uppercase leading-none translate-y-[-2px] sm:translate-y-[-4px]">
        {grade}
      </span>
      <span className="text-[0.55rem] sm:text-[0.65rem] font-mono uppercase font-bold tracking-[0.15em] absolute bottom-1 sm:bottom-1.5 opacity-80">
        GRADE
      </span>
    </div>
  );
};
