// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider, Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import themes, { lightTheme, darkTheme, getSystemTheme, lightThemeCssVars } from '../styles/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  useCssVars: boolean;
  setUseCssVars: (useCssVars: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [useCssVars, setUseCssVars] = useState<boolean>(true); // Default to using CSS variables
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => {
    const storedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const storedUseCssVars = localStorage.getItem('useCssVars');

    if (storedMode) {
      setMode(storedMode);
    }

    if (storedUseCssVars !== null) {
      setUseCssVars(storedUseCssVars === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('useCssVars', String(useCssVars));
  }, [useCssVars]);

  const getTheme = (mode: ThemeMode) => {
    switch (mode) {
      case 'dark':
        return darkTheme;
      case 'light':
        return lightTheme;
      case 'system':
        return getSystemTheme();
      default:
        return lightTheme;
    }
  };

  const theme = getTheme(mode);
  const currentMode = mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;

  return (
    <ThemeContext.Provider value={{ mode, setMode, useCssVars, setUseCssVars }}>
      {useCssVars ? (
        <CssVarsProvider
          theme={lightThemeCssVars}
          defaultMode={currentMode}
          modeStorageKey="mind-map-theme-mode"
        >
          <CssBaseline />
          {children}
        </CssVarsProvider>
      ) : (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      )}
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
