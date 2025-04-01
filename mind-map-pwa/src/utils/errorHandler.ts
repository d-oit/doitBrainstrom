// src/utils/errorHandler.ts

export class BaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class StorageError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class SyncError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class S3Error extends BaseError {
  constructor(message: string, public readonly type: string, cause?: Error) {
    super(message, cause);
  }
}

export const setupGlobalErrorHandler = () => {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global error:', {
      message,
      source,
      lineno,
      colno,
      error
    });

    // Show error in notification if available
    if (window.ErrorNotificationContext?.showError) {
      window.ErrorNotificationContext.showError(
        error?.message || message?.toString() || 'An unknown error occurred'
      );
    }

    // Don't prevent default error handling
    return false;
  };
};