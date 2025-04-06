import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

/**
 * Combines multiple class names and Tailwind CSS classes safely
 * Resolves conflicts and ensures proper application of Tailwind utilities
 * 
 * @param inputs - Array of class values to combine
 * @returns Combined class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}