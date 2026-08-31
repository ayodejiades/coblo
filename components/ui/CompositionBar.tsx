import React from "react";
import { cn } from "@/lib/cn";
import { CBClass } from "@/lib/classes";

export interface CompositionSegment {
  classKey: CBClass | "OTHER";
  label: string;
  percentage: number;
  color: string;
}

export interface CompositionBarProps {
  composition: Record<string, number>; // percentages summing to ~100
  className?: string;
}

const CLASS_COLORS: Record<string, string> = {
  CANOPY: "#00E676",
  LOW_GREEN: "#CCFF00",
  PAVED: "#FF2E93",
  BUILT: "#B14EFF",
  BARE: "#FF6B1A",
  WATER: "#0066FF",
  SKY: "#00D4FF",
  TRANSIENT: "#D9D6CC",
  OTHER: "#8C887E",
};

export const CompositionBar: React.FC<CompositionBarProps> = ({
  composition,
  className,
}) => {
  // Filter out 0% classes, group items < 4% into OTHER
  const rawEntries = Object.entries(composition).filter(([, pct]) => pct > 0);

  const mainSegments: CompositionSegment[] = [];
  let otherPct = 0;

  for (const [cls, pct] of rawEntries) {
    if (pct < 4 && rawEntries.length > 3) {
      otherPct += pct;
    } else {
      mainSegments.push({
        classKey: cls as CBClass,
        label: cls.replace("_", " "),
        percentage: pct,
        color: CLASS_COLORS[cls] || "#8C887E",
      });
    }
  }

  if (otherPct > 0) {
    mainSegments.push({
      classKey: "OTHER",
      label: "OTHER",
      percentage: Math.round(otherPct * 10) / 10,
      color: CLASS_COLORS.OTHER,
    });
  }

  // Ensure total displays cleanly
  return (
    <div className={cn("w-full flex flex-col gap-2 select-none", className)}>
      <div className="w-full h-10 sm:h-12 border-[3px] border-black flex bg-[#D9D6CC] shadow-[4px_4px_0_0_#000] overflow-hidden">
        {mainSegments.map((seg, idx) => (
          <div
            key={seg.classKey}
            className={cn(
              "h-full flex items-center justify-center font-mono font-bold text-[0.65rem] sm:text-xs text-black min-w-0 overflow-hidden px-1 transition-none",
              idx < mainSegments.length - 1 && "border-r-[3px] border-black"
            )}
            style={{
              width: `${seg.percentage}%`,
              backgroundColor: seg.color,
            }}
            title={`${seg.label}: ${seg.percentage}%`}
          >
            {seg.percentage >= 8 && (
              <span className="truncate drop-shadow-sm font-extrabold">
                {seg.percentage >= 15 ? `${seg.label} ` : ""}
                {Math.round(seg.percentage)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
