import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Merges Tailwind CSS classes intelligently, handling conflicts.
 * Uses `clsx` for conditional classes and `twMerge` to resolve Tailwind conflicts.
 * @param {...import("clsx").ClassValue} inputs - Class names or conditional class objects.
 * @returns {string} - The merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with abbreviations (k, M, B).
 * @param {number} num - The number to format.
 * @param {number} [digits=0] - The number of decimal places for the abbreviated number.
 * @returns {string} The formatted number string (e.g., "1.2k", "5M").
 */
export function fNumber(num, digits = 0) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
  ];
  // Regex to remove trailing zeros after decimal point unless it's the only digit (e.g., 1.0 -> 1, 1.20 -> 1.2)
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(item => num >= item.value);
    
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}