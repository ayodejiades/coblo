import React from "react";
import { cn } from "@/lib/cn";

export interface SegLegendItem {
  label: string;
  percentage: number;
  color: string;
  description?: string;
}

export interface SegLegendProps {
  items: SegLegendItem[];
  className?: string;
}

export const SegLegend: React.FC<SegLegendProps> = ({ items, className }) => {
  const visibleItems = items.filter((item) => item.percentage > 0);

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 select-none",
        className
      )}
    >
      {visibleItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-2 p-1.5 sm:p-2 bg-white border-[2px] border-black shadow-[2px_2px_0_0_#000] min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 border-[2px] border-black shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-mono font-bold text-[0.7rem] sm:text-xs uppercase tracking-wider text-black truncate">
              {item.label}
            </span>
          </div>
          <span className="font-mono font-bold text-xs sm:text-sm text-black tabular-nums shrink-0">
            {item.percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};
