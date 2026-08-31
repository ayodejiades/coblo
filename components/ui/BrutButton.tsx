import React from "react";
import { cn } from "@/lib/cn";

export interface BrutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "ghost" | "ink" | "cyan";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const BrutButton = React.forwardRef<HTMLButtonElement, BrutButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-[#CCFF00] text-[#000000] hover:bg-[#b8e600]",
      danger: "bg-[#FF2E93] text-[#000000] hover:bg-[#e62280]",
      ghost: "bg-[#FFFFFF] text-[#000000] hover:bg-[#F5F2E8]",
      ink: "bg-[#000000] text-[#CCFF00] hover:bg-[#1a1a1a]",
      cyan: "bg-[#00D4FF] text-[#000000] hover:bg-[#00bfe6]",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs border-[3px] shadow-[3px_3px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]",
      md: "px-5 py-2.5 text-sm border-[3px] shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]",
      lg: "px-8 py-4 text-base border-[5px] shadow-[8px_8px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[4px_4px_0_0_#000]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-mono uppercase font-bold tracking-[0.12em]",
          "border-black rounded-none select-none",
          "transition-[transform,box-shadow,background-color] duration-75 ease-out cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          disabled &&
            "bg-[#D9D6CC] text-black/40 shadow-none translate-x-[4px] translate-y-[4px] cursor-not-allowed pointer-events-none active:translate-x-[4px] active:translate-y-[4px]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutButton.displayName = "BrutButton";
