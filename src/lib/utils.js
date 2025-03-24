import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
/**
 * Combine and merge class names with Tailwind utilities
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number with a specified decimal place
 * @param {number} num - The number to format
 * @param {number} [digits=0] - The number of decimal places
 * @returns {string} The formatted number
 */
export function fNumber(num, digits = 0) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

/**
 * Create pagination parameters for API requests
 * @param {Object} options - Pagination options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit] - Items per page
 * @param {string} [options.filter] - Filter string
 * @param {string} [options.filterKey='name'] - Key to filter by
 * @returns {Object} Parameter object for API request
 */
export function getPaginationParams({ 
  page = 1, 
  limit,
  filter = '',
  filterKey = 'name'
}) {
  const params = { page };
  
  // Add limit if specified
  if (limit) params.limit = limit;
  
  // Add filter if specified
  if (filter) params[filterKey] = filter;
  
  return params;
}