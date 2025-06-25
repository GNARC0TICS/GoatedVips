import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
}

/**
 * LoadingSpinner component for loading states
 * Consolidated implementation with better accessibility and variants
 */
export function LoadingSpinner({
  size = "md",
  variant = "primary",
  className,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-solid border-current border-r-transparent",
          
          // Size variants
          {
            "h-4 w-4": size === "sm",
            "h-8 w-8": size === "md", 
            "h-12 w-12": size === "lg",
          },
          
          // Color variants
          {
            "text-[#D7FF00]": variant === "primary",
            "text-white": variant === "white",
          }
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}