// Import polyfill first to ensure global is defined before any other imports
import './utils/globalPolyfill';

import React from 'react'
import ReactDOM from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import App from './App'
import './styles/index.css'
import './styles/responsive.css'
import './styles/safeArea.css'
import './styles/theme-transitions.css'
import './styles/grid-system.css'
import './styles/fluid-typography.css'
import './styles/container-queries.css'
import './styles/touch-interactions.css'
import './styles/accessibility.css'
import './styles/theme-variables.css'
import './styles/drawer.css'
import './styles/breadcrumbs.css'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { MindMapContextProvider } from './contexts/MindMapContext'
import { I18nContextProvider } from './contexts/I18nContext'
import { ErrorNotificationContextProvider } from './contexts/ErrorNotificationContext'
import { ResponsiveContextProvider } from './contexts/ResponsiveContext'
import AccessibilityProvider from './components/accessibility/AccessibilityProvider'
import { register as registerServiceWorker } from './serviceWorker'
import { setupGlobalErrorHandler } from './utils/errorHandler'
import { initLogger } from './utils/logger'
import createEmotionCache from './utils/createEmotionCache'
import { runAllMigrations } from './utils/migrationUtils'

// Initialize logger
initLogger();

// Setup global error handler
setupGlobalErrorHandler();

// Register service worker for offline capabilities
registerServiceWorker();

// Run migrations from localStorage to IndexedDB if available
if (typeof runAllMigrations === 'function') {
  runAllMigrations().then(success => {
    if (success) {
      console.log('Successfully migrated data from localStorage to IndexedDB');
    } else {
      console.warn('Some migrations from localStorage to IndexedDB failed, will retry on next app load');
    }
  }).catch(error => {
    console.error('Error running migrations:', error);
  });
} else {
  console.warn('IndexedDB migration not available in this environment');
}

// Create Emotion cache
const emotionCache = createEmotionCache();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CacheProvider value={emotionCache}>
      <I18nContextProvider>
        <ErrorNotificationContextProvider>
          <ThemeContextProvider>
            <ResponsiveContextProvider>
              <AccessibilityProvider>
                <MindMapContextProvider>
                  <App />
                </MindMapContextProvider>
              </AccessibilityProvider>
            </ResponsiveContextProvider>
          </ThemeContextProvider>
        </ErrorNotificationContextProvider>
      </I18nContextProvider>
    </CacheProvider>
  </React.StrictMode>,
)
