import React from "react";
import { cn } from "@/lib/cn";

export interface BrutBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "acid"
    | "hot"
    | "cyan"
    | "violet"
    | "orange"
    | "grey"
    | "canopy"
    | "white"
    | "ink";
  size?: "sm" | "md";
}

export const BrutBadge: React.FC<BrutBadgeProps> = ({
  variant = "acid",
  size = "md",
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    acid: "bg-[#CCFF00] text-black",
    hot: "bg-[#FF2E93] text-black",
    cyan: "bg-[#00D4FF] text-black",
    violet: "bg-[#B14EFF] text-black",
    orange: "bg-[#FF6B1A] text-black",
    grey: "bg-[#D9D6CC] text-black",
    canopy: "bg-[#00E676] text-black",
    white: "bg-white text-black",
    ink: "bg-black text-[#CCFF00]",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.2 text-[0.65rem]",
    md: "px-2 py-0.5 text-[0.7rem]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-[2px] border-black font-mono uppercase font-bold tracking-[0.12em] shadow-[2px_2px_0_0_#000] select-none shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
