/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { I18nContextProvider, useI18n } from './I18nContext';

// Test component that uses the i18n context
const TestComponent = () => {
  const { t, locale, setLocale } = useI18n();
  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="translated-text">{t('app.title')}</span>
      <button onClick={() => setLocale('de')} data-testid="switch-to-de">
        Switch to German
      </button>
    </div>
  );
};

describe('I18nContext', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
  });

  it('provides English translations by default', () => {
    render(
      <I18nContextProvider>
        <TestComponent />
      </I18nContextProvider>
    );

    const localeElement = screen.getByTestId('current-locale');
    const textElement = screen.getByTestId('translated-text');

    expect(localeElement).toHaveTextContent('en');
    expect(textElement).toHaveTextContent('d.o. Brainstroming');
  });

  it('switches to German locale and loads German translations', async () => {
    render(
      <I18nContextProvider>
        <TestComponent />
      </I18nContextProvider>
    );

    // Click the button to switch to German
    const switchButton = screen.getByTestId('switch-to-de');
    await userEvent.click(switchButton);

    // Wait for the locale to change
    const localeElement = await screen.findByTestId('current-locale');
    const textElement = await screen.findByTestId('translated-text');
    
    expect(localeElement).toHaveTextContent('de');
    expect(textElement).toHaveTextContent('d.o. Brainstroming');
  });

  it('persists locale preference in localStorage', async () => {
    const { unmount } = render(
      <I18nContextProvider>
        <TestComponent />
      </I18nContextProvider>
    );

    // Switch to German
    const switchButton = screen.getByTestId('switch-to-de');
    await userEvent.click(switchButton);

    // Verify localStorage was updated
    expect(localStorage.getItem('locale')).toBe('de');

    // Unmount and remount to verify persistence
    unmount();

    render(
      <I18nContextProvider>
        <TestComponent />
      </I18nContextProvider>
    );

    // Should still be German
    const localeElement = screen.getByTestId('current-locale');
    expect(localeElement).toHaveTextContent('de');
  });

  it('handles missing translations gracefully', async () => {
    const NonexistentKeyComponent = () => {
      const { t } = useI18n();
      return (
        <span data-testid="missing-translation">
          {t('nonexistent.key')}
        </span>
      );
    };

    render(
      <I18nContextProvider>
        <NonexistentKeyComponent />
      </I18nContextProvider>
    );

    const missingElement = screen.getByTestId('missing-translation');
    expect(missingElement).toHaveTextContent('nonexistent.key');
  });

  it('updates document attributes when changing locale', async () => {
    render(
      <I18nContextProvider>
        <TestComponent />
      </I18nContextProvider>
    );

    // Switch to German
    const switchButton = screen.getByTestId('switch-to-de');
    await userEvent.click(switchButton);

    // Check if HTML lang attribute was updated
    expect(document.documentElement.lang).toBe('de');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('loads translations for nested keys correctly', async () => {
    const NestedComponent = () => {
      const { t } = useI18n();
      return (
        <div>
          <span data-testid="nested-translation">
            {t('mindMap.mainIdea')}
          </span>
        </div>
      );
    };

    render(
      <I18nContextProvider>
        <NestedComponent />
      </I18nContextProvider>
    );

    // Switch to German
    act(() => {
      const { setLocale } = useI18n();
      setLocale('de');
    });

    // Verify nested translation is correct
    const nestedElement = await screen.findByTestId('nested-translation');
    expect(nestedElement).toHaveTextContent('Hauptidee');
  });
});