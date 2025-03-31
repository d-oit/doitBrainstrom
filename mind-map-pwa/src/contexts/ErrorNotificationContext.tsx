// src/contexts/ErrorNotificationContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Snackbar, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useI18n } from './I18nContext';
import { logInfo } from '../utils/logger';

interface ErrorNotificationContextProps {
  errorMessage: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const ErrorNotificationContext = createContext<ErrorNotificationContextProps | undefined>(undefined);

export const ErrorNotificationContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { dir } = useI18n();

  // Make the context available globally for error handler
  useEffect(() => {
    window.ErrorNotificationContext = {
      showError: (message: string) => {
        showError(message);
      }
    };

    return () => {
      delete window.ErrorNotificationContext;
    };
  }, []);

  const showError = (message: string) => {
    logInfo('Showing error notification:', message);
    setErrorMessage(message);
    setOpen(true);
  };

  const clearError = () => {
    setOpen(false);
    // Don't clear the message immediately to allow for smooth transition
    setTimeout(() => {
      setErrorMessage(null);
    }, 300);
  };

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    clearError();
  };

  const value: ErrorNotificationContextProps = {
    errorMessage,
    showError,
    clearError,
  };

  return (
    <ErrorNotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        dir={dir}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </ErrorNotificationContext.Provider>
  );
};

export const useErrorNotification = () => {
  const context = useContext(ErrorNotificationContext);
  if (!context) {
    throw new Error('useErrorNotification must be used within a ErrorNotificationContextProvider');
  }
  return context;
};
