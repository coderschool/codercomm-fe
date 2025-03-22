import React from 'react';

// Theme is now handled by Tailwind CSS in index.css
function ThemeProvider({ children }) {
  return <>{children}</>;
}

export default ThemeProvider;