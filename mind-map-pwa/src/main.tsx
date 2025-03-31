import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { MindMapContextProvider } from './contexts/MindMapContext'
import { I18nContextProvider } from './contexts/I18nContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nContextProvider>
      <ThemeContextProvider>
        <MindMapContextProvider>
          <App />
        </MindMapContextProvider>
      </ThemeContextProvider>
    </I18nContextProvider>
  </React.StrictMode>,
)
