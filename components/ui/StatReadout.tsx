import React from "react";
import { cn } from "@/lib/cn";
import { BrutCard } from "./BrutCard";

export interface StatReadoutProps {
  label: string;
  value: string | number;
  unit?: string;
  subline?: string;
  headerAccent?: "acid" | "hot" | "cyan" | "violet" | "orange" | "grey" | "ink" | "none";
  className?: string;
  valueClassName?: string;
}

export const StatReadout: React.FC<StatReadoutProps> = ({
  label,
  value,
  unit,
  subline,
  headerAccent = "cyan",
  className,
  valueClassName,
}) => {
  return (
    <BrutCard
      title={label}
      headerAccent={headerAccent}
      className={cn("flex flex-col justify-between", className)}
    >
      <div className="flex items-baseline gap-1 my-1">
        <span className={cn("t-stat font-bold tabular-nums tracking-tight text-black", valueClassName)}>
          {value}
        </span>
        {unit && (
          <span className="text-xl sm:text-2xl font-mono font-bold text-black/80">{unit}</span>
        )}
      </div>
      {subline && (
        <div className="text-[0.7rem] sm:text-xs font-mono text-black/70 mt-2 border-t-[2px] border-black/20 pt-1.5 leading-tight">
          {subline}
        </div>
      )}
    </BrutCard>
  );
};
