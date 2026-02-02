import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default theme colors - Maroon/Gold traditional wedding theme
const defaultTheme = {
  primary: '#8B1538',      // Deep maroon/burgundy
  primaryDark: '#6B0F2B',  // Darker maroon
  primaryLight: '#A91D45', // Lighter maroon
  gold: '#D4AF37',         // Classic gold
  goldLight: '#F5E6B0',    // Light gold
  maroon: '#7a1f2b',       // Maroon accent
  ivory: '#FFFAF0',        // Ivory background
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
      const response = await axios.get(`${API_BASE_URL}/settings/theme`);
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

  // Refresh theme from server
  const refreshTheme = async () => {
    await fetchTheme();
  };

  const value = {
    theme,
    loading,
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
