import { format, getTime, formatDistanceToNow } from "date-fns";

export function fDate(date) {
  return format(new Date(date), "dd MMMM yyyy");
}

export function fDateTime(date) {
  return format(new Date(date), "dd MMM yyyy HH:mm");
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), "dd/MM/yyyy hh:mm p");
}

/**
 * Formats a date as a relative time (e.g., "2 hours ago")
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted relative time
 */
export function formatTimeAgo(dateString) {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
  });
}

// For backward compatibility
export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}
