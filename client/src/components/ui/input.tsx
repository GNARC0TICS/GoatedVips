import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 md:text-sm text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          className,
        )}
        ref={ref}
        style={{
          WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
          WebkitAppearance: 'none', // Remove default styling on iOS
          MozAppearance: 'none', // Remove default styling on Firefox
          appearance: 'none', // Remove default styling
        }}
        {...props}
        // Add onTouchStart handler to ensure inputs work properly on mobile
        onTouchStart={(e) => {
          // Allow default behavior to ensure focus
          if (props.onTouchStart) {
            props.onTouchStart(e);
          }
        }}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
