import React, { createContext, useContext, useEffect, useState } from 'react';

// Define ThemeContext
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // Light/Dark mode
  const [color, setColor] = useState('default'); // Default color scheme

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('color') || 'default';

    setTheme(savedTheme);
    setColor(savedColor);

    const root = document.documentElement;
  
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'light-red', 'dark-red', 'light-blue', 'dark-blue', 'light-green', 'dark-green');

    document.documentElement.classList.add(savedTheme);
    if (savedColor !== 'default') {
      document.documentElement.classList.add(`${savedTheme}-${savedColor}`);
    }
  }, []);

  // Update the theme (light/dark mode)
  const updateTheme = (newTheme) => {
    const root = document.documentElement;
  
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
  
    // Apply new theme
    root.classList.add(newTheme);
  
    // Save to localStorage
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Update the color scheme
  const updateColor = (newColor) => {
    const root = document.documentElement;
  
    // Determine the current theme (light/dark)
    const currentTheme = theme;
  
    // Remove existing color classes
    root.classList.remove('light-red', 'dark-red', 'light-blue', 'dark-blue', 'light-green', 'dark-green');
  
    // Apply new color class if not "default"
    if (newColor !== 'default') {
      root.classList.add(`${currentTheme}-${newColor}`);
    }
  
    // Save to localStorage
    setColor(newColor);
    localStorage.setItem('color', newColor);
  };

  return (
    <ThemeContext.Provider value={{ theme, color, updateTheme, updateColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use ThemeContext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
