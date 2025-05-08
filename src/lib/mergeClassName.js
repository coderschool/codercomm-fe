import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently, handling conflicts.
 * Uses `clsx` for conditional classes and `twMerge` to resolve Tailwind conflicts.
 * @param {...import("clsx").ClassValue} inputs - Class names or conditional class objects.
 * @returns {string} - The merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
