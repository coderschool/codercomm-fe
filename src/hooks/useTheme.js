import { useEffect } from 'react';
import useStore from '../lib/store';

export const useTheme = () => {
  const mode = useStore((state) => state.ui.themeMode);
  const toggleTheme = useStore((state) => state.toggleTheme);
  
  useEffect(() => {
    // Apply the dark class to the document element when in dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);
  
  return { mode, toggleTheme };
};