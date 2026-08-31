import React from "react";
import { cn } from "@/lib/cn";

export interface BrutSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  fillColor?: "acid" | "cyan" | "hot";
}

export const BrutSlider: React.FC<BrutSliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "",
  fillColor = "acid",
  className,
  ...props
}) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const fillClasses = {
    acid: "bg-[#CCFF00]",
    cyan: "bg-[#00D4FF]",
    hot: "bg-[#FF2E93]",
  };

  return (
    <div className={cn("flex flex-col gap-2 w-full select-none", className)}>
      <div className="flex items-center justify-between font-mono font-bold text-xs uppercase tracking-[0.12em]">
        <label htmlFor={`slider-${label}`} className="text-black">
          {label}
        </label>
        <div className="bg-black text-[#CCFF00] px-2 py-0.5 border-[2px] border-black text-xs font-mono font-bold tabular-nums">
          {value > 0 && unit === "%" ? `+${value}` : value}
          {unit}
        </div>
      </div>
      <div className="relative w-full h-8 flex items-center">
        {/* Track border & fill */}
        <div className="absolute inset-x-0 h-6 border-[3px] border-black bg-[#D9D6CC] overflow-hidden pointer-events-none">
          <div
            className={cn("h-full border-r-[3px] border-black transition-none", fillClasses[fillColor])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Native range input with invisible track but interactive thumb */}
        <input
          id={`slider-${label}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="brut-range relative z-10 w-full"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value}${unit}`}
          {...props}
        />
      </div>
    </div>
  );
};
