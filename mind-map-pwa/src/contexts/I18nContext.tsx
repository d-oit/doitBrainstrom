// src/contexts/I18nContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveLocaleSettings, loadLocaleSettings } from '../services/settingsService';
import { runAllMigrations } from '../utils/migrationUtils';

// Define supported locales
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' }
];

interface I18nContextProps {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  dir: 'ltr' | 'rtl';
  isReady: boolean;
}

export const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [isReady, setIsReady] = useState(false);

  // Load translations for the current locale
  useEffect(() => {
    const loadTranslations = async () => {
      // Load English translations first
      const enModule = await import('../locales/en.json');
      const enTranslations = enModule.default;
      try {
        // Set English translations first to ensure we always have something
        setTranslations(enTranslations);

        // Only try to load non-English translations dynamically
        if (locale !== 'en') {
          // Dynamic import of translation file
          const module = await import(`../locales/${locale}.json`);
          setTranslations(module.default || enTranslations);
        }

        // Set text direction
        const localeInfo = SUPPORTED_LOCALES.find(l => l.code === locale);
        setDir(localeInfo?.dir as 'ltr' | 'rtl' || 'ltr');

        // Update HTML attributes
        document.documentElement.lang = locale;
        document.documentElement.dir = localeInfo?.dir || 'ltr';
      } catch (error) {
        console.error(`Failed to load translations for ${locale}`, error);
        // Keep using English translations as fallback
        setTranslations(enTranslations);
      }
    };

    loadTranslations();
  }, [locale]);

  // Initialize with browser language if available
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        // Run migrations from localStorage to IndexedDB
        await runAllMigrations();

        // Try to load locale from IndexedDB
        const storedLocale = await loadLocaleSettings();
        if (storedLocale) {
          setLocale(storedLocale);
          return;
        }

        // If not in IndexedDB, try localStorage for backward compatibility
        const localStorageLocale = localStorage.getItem('locale');
        if (localStorageLocale) {
          setLocale(localStorageLocale);
          return;
        }

        // If no stored preference, use browser language if supported
        const browserLang = navigator.language.split('-')[0];
        const isSupported = SUPPORTED_LOCALES.some(l => l.code === browserLang);
        if (isSupported) {
          setLocale(browserLang);
        }
      } catch (error) {
        console.error('Failed to initialize locale from IndexedDB:', error);

        // Fallback to localStorage
        const localStorageLocale = localStorage.getItem('locale');
        if (localStorageLocale) {
          setLocale(localStorageLocale);
        } else {
          // If no stored preference, use browser language if supported
          const browserLang = navigator.language.split('-')[0];
          const isSupported = SUPPORTED_LOCALES.some(l => l.code === browserLang);
          if (isSupported) {
            setLocale(browserLang);
          }
        }
      }
    };

    initializeLocale();
  }, []);

  // Save locale preference
  useEffect(() => {
    // Save to localStorage for backward compatibility
    localStorage.setItem('locale', locale);

    // Save to IndexedDB if available
    if (typeof saveLocaleSettings === 'function') {
      saveLocaleSettings(locale).catch(error => {
        console.error('Failed to save locale to IndexedDB:', error);
      });
    }
  }, [locale]);

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = translations;

    // Navigate through the nested structure
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found
        return key; // Return the key itself as fallback
      }
    }

    // If the value is not a string, return the key
    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce<string>(
        (str, [param, val]: [string, string]) => str.replace(new RegExp(`{{${param}}}`, 'g'), val),
        value
      );
    }

    return value;
  };

  useEffect(() => {
    setIsReady(true);
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, isReady }}>
      {isReady ? children : null}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nContextProvider');
  }
  return context;
};
