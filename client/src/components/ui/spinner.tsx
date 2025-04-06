import React from "react";
import { cn } from "@/utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "accent" | "white";
}

/**
 * Spinner component for loading states
 * 
 * @example
 * // Default spinner
 * <Spinner />
 * 
 * @example
 * // Large primary spinner
 * <Spinner size="lg" variant="primary" />
 * 
 * @example
 * // Small white spinner with custom class
 * <Spinner size="sm" variant="white" className="opacity-70" />
 */
export function Spinner({
  size = "md",
  variant = "primary",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
        
        // Size variants
        {
          "h-3 w-3": size === "xs",
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-8 w-8": size === "lg",
          "h-12 w-12": size === "xl",
        },
        
        // Color variants
        {
          "text-primary": variant === "primary",
          "text-secondary": variant === "secondary",
          "text-accent": variant === "accent",
          "text-white": variant === "white",
        },
        
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}