import { createContext, useContext, useState, useEffect } from 'react';
import { adminSettingsAPI } from '../utils/adminApi';

// Default theme colors
const defaultTheme = {
  primary: '#1EA826',
  primaryDark: '#0B7813',
  primaryLight: '#1f7a4d',
  gold: '#FFFFFF',
  goldLight: '#f5e6b0',
  maroon: '#7a1f2b',
  ivory: '#fffaf0',
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);
  const [loading, setLoading] = useState(true);

  // Fetch theme from server on mount
  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await adminSettingsAPI.getTheme();
      if (response.data.theme) {
        setTheme(response.data.theme);
        applyTheme(response.data.theme);
      } else {
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
      // Use default theme if fetch fails
      applyTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to CSS variables
  const applyTheme = (themeColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeColors.primary);
    root.style.setProperty('--color-primary-dark', themeColors.primaryDark);
    root.style.setProperty('--color-primary-light', themeColors.primaryLight);
    root.style.setProperty('--color-gold', themeColors.gold);
    root.style.setProperty('--color-gold-light', themeColors.goldLight);
    root.style.setProperty('--color-maroon', themeColors.maroon);
    root.style.setProperty('--color-ivory', themeColors.ivory);
  };

  // Update theme (used by AdminSettings)
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Refresh theme from server
  const refreshTheme = async () => {
    await fetchTheme();
  };

  const value = {
    theme,
    loading,
    updateTheme,
    refreshTheme,
    defaultTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
