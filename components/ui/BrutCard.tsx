import React from "react";
import { cn } from "@/lib/cn";

export interface BrutCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAccent?: "acid" | "hot" | "cyan" | "violet" | "orange" | "grey" | "ink" | "none";
  shadow?: "sm" | "md" | "lg" | "xl" | "none";
  borderHeavy?: boolean;
}

export const BrutCard: React.FC<BrutCardProps> = ({
  title,
  subtitle,
  headerAccent = "acid",
  shadow = "md",
  borderHeavy = false,
  className,
  children,
  ...props
}) => {
  const accentStyles = {
    acid: "bg-[#CCFF00] text-black",
    hot: "bg-[#FF2E93] text-black",
    cyan: "bg-[#00D4FF] text-black",
    violet: "bg-[#B14EFF] text-black",
    orange: "bg-[#FF6B1A] text-black",
    grey: "bg-[#D9D6CC] text-black",
    ink: "bg-black text-[#CCFF00]",
    none: "bg-white text-black",
  };

  const shadowStyles = {
    none: "shadow-none",
    sm: "shadow-[2px_2px_0_0_#000]",
    md: "shadow-[4px_4px_0_0_#000]",
    lg: "shadow-[8px_8px_0_0_#000]",
    xl: "shadow-[12px_12px_0_0_#000]",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-none p-4 sm:p-6 transition-none",
        borderHeavy ? "border-[4px] sm:border-[5px] border-black" : "border-[3px] border-black",
        shadowStyles[shadow],
        className
      )}
      {...props}
    >
      {title && (
        <div
          className={cn(
            "-m-4 sm:-m-6 mb-4 sm:mb-6 px-4 sm:px-6 py-2.5 sm:py-3 border-b-[3px] border-black font-mono uppercase tracking-[0.12em] text-xs sm:text-sm font-bold flex items-center justify-between",
            accentStyles[headerAccent]
          )}
        >
          <div className="flex items-center gap-2 font-bold min-w-0 truncate">{title}</div>
          {subtitle && <div className="text-[0.7rem] sm:text-xs opacity-90 shrink-0">{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
