// src/theme/theme.ts
import { createTheme, responsiveFontSizes, extendTheme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';
import { ThemeMode, ThemeSettings } from '../types/theme';

// Extend the palette to include gradient properties
declare module '@mui/material/styles' {
  interface Palette {
    gradient: {
      primary: string;
      surface: string;
    };
  }
  
  interface PaletteOptions {
    gradient?: {
      primary?: string;
      surface?: string;
    };
  }
}

const baseTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: mode === 'light' ? '#6366f1' : '#818cf8' },
    secondary: { main: mode === 'light' ? '#10b981' : '#34d399' },
    gradient: {
      primary: mode === 'light'
        ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
        : 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
      surface: mode === 'light'
        ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
        : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundImage: 'var(--gradient-primary)',
          fontWeight: 600,
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.3)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'var(--gradient-surface)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
});

// Enhanced theme with accessibility features
export const createAppTheme = (mode: ThemeMode, settings?: ThemeSettings) => {
  const isHighContrast = mode === 'high-contrast';
  const reducedMotion = settings?.reducedMotion ?? false;
  const effectiveMode = isHighContrast ? 'dark' : (mode === 'dark' ? 'dark' : 'light');
  
  const theme = responsiveFontSizes(baseTheme(effectiveMode));
  
  // Apply accessibility overrides
  if (isHighContrast) {
    theme.palette.primary.main = '#ffffff';
    theme.palette.secondary.main = '#ffff00';
    theme.palette.background.default = '#000000';
    theme.palette.background.paper = '#121212';
    theme.palette.text.primary = '#ffffff';
    theme.palette.text.secondary = '#ffff00';
    
    // Override gradients for high contrast
    theme.palette.gradient = {
      primary: 'none',
      surface: 'none'
    };
    
    // Override component styles for high contrast
    theme.components = {
      ...theme.components,
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '2px solid #ffffff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#333333'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#121212',
            border: '2px solid #ffffff'
          }
        }
      }
    };
  }
  
  // Apply reduced motion settings
  if (reducedMotion) {
    theme.transitions = {
      ...theme.transitions,
      create: () => 'none',
    };
    
    // Override component animations
    if (theme.components?.MuiButton?.styleOverrides?.root) {
      const buttonRoot = theme.components.MuiButton.styleOverrides.root as any;
      buttonRoot.transition = 'none';
      buttonRoot['&:hover'] = {
        ...buttonRoot['&:hover'],
        transform: 'none'
      };
    }
  }
  
  return theme;
};

// CSS variables theme for Material UI v7
export const createCssVarsTheme = (mode: ThemeMode, settings?: ThemeSettings) => {
  const isHighContrast = mode === 'high-contrast';
  const reducedMotion = settings?.reducedMotion ?? false;
  const effectiveMode = isHighContrast ? 'dark' : (mode === 'dark' ? 'dark' : 'light');
  
  const theme = extendTheme({
    cssVarPrefix: 'mind-map',
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#6366f1' },
          secondary: { main: '#10b981' },
          background: {
            default: '#f8fafc',
            paper: '#ffffff',
          },
          gradient: {
            primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            surface: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }
        },
      },
      dark: {
        palette: {
          primary: { main: '#818cf8' },
          secondary: { main: '#34d399' },
          background: {
            default: '#0f172a',
            paper: '#1e293b',
          },
          gradient: {
            primary: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
            surface: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)'
          }
        },
      },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundImage: 'var(--mind-map-palette-gradient-primary)',
            fontWeight: 600,
            transition: reducedMotion ? 'none' : 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: reducedMotion ? 'none' : 'translateY(-2px)',
              boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.3)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'var(--mind-map-palette-gradient-surface)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }
      }
    }
  });
  
  // Apply high contrast overrides for CSS vars theme
  if (isHighContrast) {
    // Override the dark color scheme with high contrast colors
    theme.colorSchemes.dark = {
      ...theme.colorSchemes.dark,
      palette: {
        ...theme.colorSchemes.dark.palette,
        primary: { main: '#ffffff' },
        secondary: { main: '#ffff00' },
        background: {
          default: '#000000',
          paper: '#121212',
        },
        text: {
          primary: '#ffffff',
          secondary: '#ffff00',
        },
        gradient: {
          primary: 'none',
          surface: 'none'
        }
      }
    };
    
    // Override component styles for high contrast
    theme.components = {
      ...theme.components,
      MuiButton: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '2px solid #ffffff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#333333'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: '#121212',
            border: '2px solid #ffffff'
          }
        }
      }
    };
  }
  
  return theme;
};

// Export color palette for use in other components
export const modernColors = {
  electricViolet: '#6366f1',
  mediumSlateBlue: '#818cf8',
  emeraldGreen: '#10b981',
  mintGreen: '#34d399',
  cosmicPurple: '#a855f7',
  twilightBlue: '#0f172a'
};

// Export gradient presets
export const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  success: 'linear-gradient(45deg, #10b981 0%, #34d399 100%)',
  error: 'linear-gradient(45deg, #ef4444 0%, #f97316 100%)'
};

// Export motion configuration
export const motion = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
  spring: { type: 'spring', stiffness: 400, damping: 15 }
};
