import * as React from "react";
import { cn } from "@/lib/utils";

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-[#1A1B21]/80 border border-[#2A2B31] rounded-xl p-6 transition-all duration-200 hover:border-[#3A3B41]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";