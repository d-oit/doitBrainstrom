import { createTheme, ThemeOptions } from '@mui/material/styles';
import { breakpoints } from './breakpoints';

// Define common theme options
const commonThemeOptions: ThemeOptions = {
  breakpoints: {
    values: breakpoints,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Fluid typography for responsive font sizes
    h1: {
      fontSize: 'clamp(2.5rem, 1.5rem + 2vw, 3.5rem)',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(2rem, 1.2rem + 1.6vw, 3rem)',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'clamp(1.75rem, 1.1rem + 1.2vw, 2.5rem)',
      fontWeight: 600,
    },
    h4: {
      fontSize: 'clamp(1.5rem, 1rem + 1vw, 2rem)',
      fontWeight: 600,
    },
    h5: {
      fontSize: 'clamp(1.25rem, 0.9rem + 0.7vw, 1.5rem)',
      fontWeight: 500,
    },
    h6: {
      fontSize: 'clamp(1rem, 0.8rem + 0.5vw, 1.25rem)',
      fontWeight: 500,
    },
    body1: {
      fontSize: 'clamp(1rem, 0.75rem + 0.5vw, 1.125rem)',
    },
    body2: {
      fontSize: 'clamp(0.875rem, 0.7rem + 0.35vw, 1rem)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Ensure touch-friendly size (min 44px)
          minHeight: '44px',
          borderRadius: '8px',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Ensure touch-friendly size (min 44px)
          minHeight: '44px',
          minWidth: '44px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: '44px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          [breakpoints.up('sm')]: {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
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
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...commonThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#f48fb1',
      light: '#fce4ec',
      dark: '#f06292',
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
  },
});

// System theme (based on user's system preference)
export const getSystemTheme = (): typeof lightTheme | typeof darkTheme => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return darkTheme;
  }
  return lightTheme;
};

export default {
  light: lightTheme,
  dark: darkTheme,
  system: getSystemTheme(),
};
