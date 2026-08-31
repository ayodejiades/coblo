import React from "react";
import { cn } from "@/lib/cn";

export interface MarqueeProps {
  text?: string;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  text = "COBLO · RUNS ENTIRELY ON YOUR DEVICE · 0 BYTES OF IMAGE DATA UPLOADED · 0 J SERVER INFERENCE ENERGY · STREET-SCALE HEAT AUDIT · ON-DEVICE SEMANTIC SEGMENTATION · ",
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full bg-black text-[#CCFF00] border-b-[3px] border-black py-2 overflow-hidden select-none z-50",
        className
      )}
      aria-hidden="true"
    >
      <div className="animate-marquee whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.2em] flex items-center">
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
};
