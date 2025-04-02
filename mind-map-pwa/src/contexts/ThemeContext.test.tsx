// src/contexts/ThemeContext.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { ThemeContextProvider, useTheme } from './ThemeContext';

// Mock the theme-engine module
vi.mock('../styles/theme-engine', () => ({
  detectSystemPreference: vi.fn().mockReturnValue('light'),
  watchSystemPreference: vi.fn().mockReturnValue(() => {}),
  loadThemeSettings: vi.fn().mockReturnValue({
    mode: 'light',
    useCssVars: true,
    animations: true,
    reducedMotion: false,
    colorScheme: 'default'
  }),
  saveThemeSettings: vi.fn()
}));

// Mock the theme module
vi.mock('../theme/theme', () => ({
  createAppTheme: vi.fn().mockReturnValue({}),
  createCssVarsTheme: vi.fn().mockReturnValue({})
}));

// Mock Material UI's ThemeProvider
vi.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock other dependencies
vi.mock('../services/settingsService', () => ({
  saveThemeSettings: vi.fn().mockResolvedValue(true),
  loadThemeSettings: vi.fn().mockResolvedValue(null)
}));

vi.mock('../utils/migrationUtils', () => ({
  runAllMigrations: vi.fn().mockResolvedValue(true)
}));

describe('ThemeContext', () => {
  it('exists and can be imported', () => {
    expect(ThemeContextProvider).toBeDefined();
    expect(useTheme).toBeDefined();
  });
});
