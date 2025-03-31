// src/utils/errorHandler.ts
import React from 'react';
import { logError, logErrorWithStack, logWarn } from './logger';

// Error types
export enum ErrorType {
  STORAGE = 'STORAGE',
  NETWORK = 'NETWORK',
  SYNC = 'SYNC',
  VALIDATION = 'VALIDATION',
  RENDERING = 'RENDERING',
  UNKNOWN = 'UNKNOWN'
}

// Custom error class
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public original?: Error,
    public data?: any
  ) {
    super(message);
    this.name = 'AppError';

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Storage-specific error
export class StorageError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.STORAGE, original, data);
    this.name = 'StorageError';
  }
}

// Network-specific error
export class NetworkError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.NETWORK, original, data);
    this.name = 'NetworkError';
  }
}

// Sync-specific error
export class SyncError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.SYNC, original, data);
    this.name = 'SyncError';
  }
}

// Validation-specific error
export class ValidationError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.VALIDATION, original, data);
    this.name = 'ValidationError';
  }
}

// Rendering-specific error
export class RenderingError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.RENDERING, original, data);
    this.name = 'RenderingError';
  }
}

// Global error handler setup
export const setupGlobalErrorHandler = (): void => {
  // Handle uncaught exceptions
  window.onerror = (message, _source, _lineno, _colno, error) => {
    logErrorWithStack('Global Error Handler:', error || new Error(String(message)));
    handleError(error || new Error(String(message)));
    return true; // Prevent default browser error handling
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logErrorWithStack('Unhandled Promise Rejection:', event.reason);
    handleError(event.reason);
    event.preventDefault();
  });

  // Log initialization
  logWarn('Global error handler initialized');
};

// Error boundary for React components
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logErrorWithStack('Component Error Boundary:', error);
    handleError(new RenderingError('Component rendering error', error, errorInfo));
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong. Please try again.</div>;
    }

    return this.props.children;
  }
}

// Main error handling function
export const handleError = (error: Error | unknown): void => {
  if (error instanceof AppError) {
    // Handle specific error types
    switch (error.type) {
      case ErrorType.STORAGE:
        handleStorageError(error);
        break;
      case ErrorType.NETWORK:
        handleNetworkError(error);
        break;
      case ErrorType.SYNC:
        handleSyncError(error);
        break;
      case ErrorType.VALIDATION:
        handleValidationError(error);
        break;
      case ErrorType.RENDERING:
        handleRenderingError(error);
        break;
      default:
        handleUnknownError(error);
    }
  } else if (error instanceof Error) {
    // Handle standard Error objects
    handleUnknownError(new AppError(error.message, ErrorType.UNKNOWN, error));
  } else {
    // Handle non-Error objects
    handleUnknownError(new AppError(String(error)));
  }
};

// Storage error handler
const handleStorageError = (error: AppError): void => {
  let userMessage = 'Unable to save your changes offline. Please try again.';

  // Specific storage error messages
  if (error.original?.name === 'QuotaExceededError') {
    userMessage = 'Storage space is full. Please clear some data.';
  } else if (error.original?.name === 'InvalidStateError') {
    userMessage = 'Storage is not available. Please check your browser settings.';
  }

  displayUserFriendlyError(userMessage);
  logError('Storage Error:', error);
};

// Network error handler
const handleNetworkError = (error: AppError): void => {
  displayUserFriendlyError('Network connection issue. Changes will be saved offline.');
  logError('Network Error:', error);
};

// Sync error handler
const handleSyncError = (error: AppError): void => {
  displayUserFriendlyError('Unable to sync changes. Will retry automatically when online.');
  logError('Sync Error:', error);
};

// Validation error handler
const handleValidationError = (error: AppError): void => {
  displayUserFriendlyError(error.message || 'Invalid input. Please check your data.');
  logError('Validation Error:', error);
};

// Rendering error handler
const handleRenderingError = (error: AppError): void => {
  displayUserFriendlyError('An error occurred while displaying the content. Please refresh the page.');
  logError('Rendering Error:', error);
};

// Unknown error handler
const handleUnknownError = (error: AppError): void => {
  displayUserFriendlyError('An unexpected error occurred. Please try again.');
  logError('Unknown Error:', error);
};

// Display user-friendly error message
export const displayUserFriendlyError = (message: string): void => {
  // Use ErrorNotificationContext to display error message if available
  if (window.ErrorNotificationContext?.showError) {
    window.ErrorNotificationContext.showError(message);
  } else {
    // Fallback if context is not available
    console.error('User-friendly error:', message);

    // Optional: Show a simple alert if no UI component is available
    // alert(message);
  }
};

// Declare global ErrorNotificationContext for TypeScript
declare global {
  interface Window {
    ErrorNotificationContext?: {
      showError: (message: string) => void;
    };
  }
}
