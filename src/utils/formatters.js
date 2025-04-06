/**
 * Generates initials from a user's name.
 * @param {string | undefined | null} name - The user's full name.
 * @returns {string} - The generated initials (e.g., "NV") or a default ("U").
 */
export const getInitials = (name) => {
  if (!name) return "U"; // Default if no name
  
  // Split name by spaces, take the first character of each part,
  // join them, convert to uppercase, and take the first two characters.
  const initials = name
    .split(" ")
    .map(part => part[0]) // Get first char of each part
    .filter(Boolean)     // Remove empty strings if there are multiple spaces
    .join("")           // Join the chars
    .toUpperCase();
    
  return initials.substring(0, 2); // Return max 2 initials
};

// Add other formatting functions here later (e.g., formatDate, formatNumber) 