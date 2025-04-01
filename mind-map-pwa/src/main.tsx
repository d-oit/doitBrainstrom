// Import polyfill first to ensure global is defined before any other imports
import './utils/globalPolyfill';

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import './styles/responsive.css'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { MindMapContextProvider } from './contexts/MindMapContext'
import { I18nContextProvider } from './contexts/I18nContext'
import { ErrorNotificationContextProvider } from './contexts/ErrorNotificationContext'
import { ResponsiveContextProvider } from './contexts/ResponsiveContext'
import { register as registerServiceWorker } from './serviceWorker'
import { setupGlobalErrorHandler } from './utils/errorHandler'
import { initLogger } from './utils/logger'

// Initialize logger
initLogger();

// Setup global error handler
setupGlobalErrorHandler();

// Register service worker for offline capabilities
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nContextProvider>
      <ErrorNotificationContextProvider>
        <ThemeContextProvider>
          <ResponsiveContextProvider>
            <MindMapContextProvider>
              <App />
            </MindMapContextProvider>
          </ResponsiveContextProvider>
        </ThemeContextProvider>
      </ErrorNotificationContextProvider>
    </I18nContextProvider>
  </React.StrictMode>,
)
