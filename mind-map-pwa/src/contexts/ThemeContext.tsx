// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');

  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    if (storedMode) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const getTheme = (mode: ThemeMode) => {
    let themeMode: 'light' | 'dark' = 'light';
    if (mode === 'dark') {
      themeMode = 'dark';
    } else if (mode === 'system') {
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeMode = prefersDarkMode ? 'dark' : 'light';
    } else {
      themeMode = 'light';
    }

    return createTheme({
      palette: {
        mode: themeMode,
      },
    });
  };

  const theme = getTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  return context;
};
