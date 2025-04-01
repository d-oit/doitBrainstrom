// src/types/theme.ts
import { ThemeOptions } from '@mui/material/styles';

/**
 * Available theme modes for the application
 */
export type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  mode: ThemeMode;
  useCssVars: boolean;
}

/**
 * Theme settings interface for user preferences
 */
export interface ThemeSettings {
  mode: ThemeMode;
  useCssVars: boolean;
  animations: boolean;
  reducedMotion: boolean;
  colorScheme: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
}

/**
 * Theme context interface
 */
export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  useCssVars: boolean;
  setUseCssVars: (useCssVars: boolean) => void;
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  isHighContrastMode: boolean;
  systemPreference: 'light' | 'dark';
}

/**
 * Theme tokens interface for CSS variables
 */
export interface ThemeTokens {
  colorPrimary: string;
  colorPrimaryLight: string;
  colorPrimaryDark: string;
  colorSecondary: string;
  colorSecondaryLight: string;
  colorSecondaryDark: string;
  colorBackground: string;
  colorSurface: string;
  colorText: string;
  colorTextSecondary: string;
  colorError: string;
  colorSuccess: string;
  colorWarning: string;
  colorInfo: string;
  borderRadius: string;
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSmall: string;
  fontSizeLarge: string;
  fontSizeHeading: string;
  fontWeightNormal: string;
  fontWeightBold: string;
  spacingUnit: string;
  transitionDuration: string;
  shadowLight: string;
  shadowMedium: string;
  shadowHeavy: string;
}

/**
 * Extended theme options with accessibility features
 */
export interface AccessibleThemeOptions extends ThemeOptions {
  accessibility?: {
    highContrast: boolean;
    focusRingWidth: string;
    focusRingColor: string;
    reducedMotion: boolean;
    colorScheme: 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  };
}
