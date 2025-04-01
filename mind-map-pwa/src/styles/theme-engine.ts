// src/styles/theme-engine.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode, AccessibleThemeOptions, ThemeSettings } from '../types/theme';

// Color palettes
const lightPalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
};

const darkPalette = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
};

const highContrastPalette = {
  primary: {
    main: '#ffffff',
    light: '#f5f5f5',
    dark: '#e0e0e0',
    contrastText: '#000000',
  },
  secondary: {
    main: '#ffff00',
    light: '#ffff8d',
    dark: '#ffea00',
    contrastText: '#000000',
  },
  background: {
    default: '#000000',
    paper: '#121212',
  },
  text: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    disabled: '#bdbdbd',
  },
  error: {
    main: '#ff6b6b',
    light: '#ff8a8a',
    dark: '#ff5252',
  },
  warning: {
    main: '#ffd600',
    light: '#ffea00',
    dark: '#ffc400',
  },
  info: {
    main: '#40c4ff',
    light: '#80d8ff',
    dark: '#00b0ff',
  },
  success: {
    main: '#00e676',
    light: '#69f0ae',
    dark: '#00c853',
  },
};

// Common theme options
const commonThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: '48px',
          borderRadius: '4px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'hidden',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          transition: 'background-color 0.3s ease, color 0.3s ease',
          scrollBehavior: 'smooth',
        },
        // Improved focus styles for accessibility
        '& :focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        // Smooth scrolling for anchor links
        'html': {
          scrollBehavior: 'smooth',
        },
        // Reduced motion support
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.001ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.001ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }),
    },
  },
};

// Create theme options for different modes
const createThemeOptions = (mode: ThemeMode, settings?: ThemeSettings): AccessibleThemeOptions => {
  const isHighContrast = mode === 'high-contrast';
  const reducedMotion = settings?.reducedMotion ?? false;
  const colorScheme = settings?.colorScheme ?? 'default';

  let palette;
  switch (mode) {
    case 'dark':
      palette = darkPalette;
      break;
    case 'high-contrast':
      palette = highContrastPalette;
      break;
    default:
      palette = lightPalette;
  }

  // Apply color scheme adjustments for color blindness
  if (colorScheme !== 'default') {
    palette = applyColorBlindnessAdjustments(palette, colorScheme);
  }

  return {
    ...commonThemeOptions,
    palette: {
      mode: isHighContrast ? 'dark' : (mode === 'dark' ? 'dark' : 'light'),
      ...palette,
    },
    accessibility: {
      highContrast: isHighContrast,
      focusRingWidth: '3px',
      focusRingColor: isHighContrast ? '#ffff00' : palette.primary.main,
      reducedMotion,
      colorScheme,
    },
    components: {
      ...commonThemeOptions.components,
      MuiCssBaseline: {
        styleOverrides: {
          ...(typeof commonThemeOptions.components?.MuiCssBaseline?.styleOverrides === 'object' ? commonThemeOptions.components?.MuiCssBaseline?.styleOverrides : {}),
          // Add high contrast specific styles
          ...(isHighContrast && {
            '& :focus-visible': {
              outline: `3px solid ${highContrastPalette.secondary.main}`,
              outlineOffset: '2px',
            },
            '& a': {
              color: highContrastPalette.secondary.main,
              textDecoration: 'underline',
            },
            '& button': {
              border: `2px solid ${highContrastPalette.primary.main}`,
            },
          }),
          // Add reduced motion styles
          ...(reducedMotion && {
            '*': {
              animationDuration: '0.001ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.001ms !important',
              scrollBehavior: 'auto !important',
            },
          }),
        },
      },
    },
  };
};

// Apply color adjustments for color blindness
const applyColorBlindnessAdjustments = (palette: any, colorScheme: string) => {
  const adjustedPalette = { ...palette };

  switch (colorScheme) {
    case 'protanopia': // Red-blind
      adjustedPalette.error.main = '#d79e00'; // Yellow instead of red
      adjustedPalette.success.main = '#0072c6'; // Blue instead of green
      break;
    case 'deuteranopia': // Green-blind
      adjustedPalette.success.main = '#0072c6'; // Blue instead of green
      adjustedPalette.error.main = '#d79e00'; // Yellow instead of red
      break;
    case 'tritanopia': // Blue-blind
      adjustedPalette.info.main = '#9c27b0'; // Purple instead of blue
      adjustedPalette.primary.main = '#ff9800'; // Orange instead of blue
      break;
    case 'achromatopsia': // Complete color blindness
      // Use high contrast black and white with different patterns
      adjustedPalette.primary.main = '#000000';
      adjustedPalette.secondary.main = '#ffffff';
      adjustedPalette.error.main = '#000000';
      adjustedPalette.success.main = '#ffffff';
      break;
  }

  return adjustedPalette;
};

// Create theme for Material UI v7
export const createAppTheme = (mode: ThemeMode, settings?: ThemeSettings) => {
  const themeOptions = createThemeOptions(mode, settings);
  return createTheme(themeOptions);
};

// Create theme for Material UI v5 (fallback)
export const createLegacyTheme = (mode: ThemeMode, settings?: ThemeSettings) => {
  const themeOptions = createThemeOptions(mode, settings);
  return createTheme(themeOptions);
};

// Detect system color scheme preference
export const detectSystemPreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// Watch for system preference changes
export const watchSystemPreference = (callback: (preference: 'light' | 'dark') => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const listener = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  // Add listener with modern API
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }
  // Fallback for older browsers
  else if ('addListener' in mediaQuery) {
    // For older browsers
    mediaQuery.addListener(listener);
    return () => {
      // For older browsers
      mediaQuery.removeListener(listener);
    };
  }

  return () => {};
};

// Load theme settings from localStorage
export const loadThemeSettings = (): ThemeSettings => {
  if (typeof window === 'undefined') {
    return {
      mode: 'system',
      useCssVars: true,
      animations: true,
      reducedMotion: false,
      colorScheme: 'default',
    };
  }

  try {
    const savedSettings = localStorage.getItem('theme-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Failed to load theme settings from localStorage:', error);
  }

  return {
    mode: 'system',
    useCssVars: true,
    animations: true,
    reducedMotion: false,
    colorScheme: 'default',
  };
};

// Save theme settings to localStorage
export const saveThemeSettings = (settings: ThemeSettings): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('theme-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save theme settings to localStorage:', error);
  }
};
