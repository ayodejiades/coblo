import React from "react";
import { cn } from "@/lib/cn";

export interface LoadingBarProps {
  progress?: number; // 0 to 100
  label?: string;
  statusText?: string;
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress = 0,
  label = "PROCESSING",
  statusText,
  className,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("w-full flex flex-col gap-2 select-none", className)}>
      <div className="flex items-center justify-between font-mono text-xs font-bold uppercase tracking-[0.12em] text-black">
        <span className="truncate">{label}</span>
        <span className="tabular-nums shrink-0">{clampedProgress.toFixed(0)}%</span>
      </div>
      <div className="w-full h-7 sm:h-8 border-[3px] border-black bg-[#D9D6CC] shadow-[4px_4px_0_0_#000] p-0.5 overflow-hidden">
        <div
          className="h-full bg-hazard animate-hazard border-r-[2px] border-black transition-all duration-150 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {statusText && (
        <div className="font-mono text-[0.7rem] sm:text-xs text-black/80 font-bold uppercase tracking-wider truncate">
          {statusText}
        </div>
      )}
    </div>
  );
};
