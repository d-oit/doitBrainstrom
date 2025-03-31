# specs/ERROR-005.md

## Phase 5: Error Handling and Logging (ERROR-005)
**Functional Requirements:**

1.  **Global Error Handling:** Implement a global error handling mechanism to catch and manage unhandled exceptions and errors in the application.
2.  **Custom Error Pages/Components:** Create user-friendly error pages or components to display when errors occur, with full internationalization support.
3.  **Detailed Error Logging:** Implement a custom logging utility to log errors, warnings, and informational messages. Logs should include timestamps, error details, user context (including locale), and stack traces where applicable.
4.  **Error Reporting (Optional):**  Consider implementing error reporting to an external service (e.g., Sentry, Bugsnag) for production error tracking, with support for multiple languages.
5.  **User Notifications for Errors:** Display user-friendly notifications or alerts in the user's preferred language to inform users about errors and guide them on possible actions.
6.  **Localized Error Messages:** Implement a system for managing and displaying error messages in multiple languages.
5.  **User Notifications for Errors:** Display user-friendly notifications or alerts to inform users about errors and guide them on possible actions.

**Edge Cases:**

1.  **Unhandled Exceptions:** Ensure all unhandled exceptions are caught and logged gracefully without crashing the application.
2.  **Asynchronous Error Handling:** Properly handle errors in asynchronous operations (Promises, async/await), including IndexedDB transactions.
3.  **Storage Errors:** Handle storage-related errors (IndexedDB failures, quota exceeded, permissions) and provide appropriate fallbacks.
4.  **Network Errors:** Specifically handle network-related errors (e.g., API request failures, S3 connection errors) with localized messages.
4.  **Component Rendering Errors:** Catch errors that occur during React component rendering, including i18n-related rendering issues.
5.  **Logging Failures:** Handle potential errors in the logging system itself (e.g., disk space issues, logging service failures).
6.  **Security Considerations in Logging:** Ensure sensitive information is not logged inadvertently and logs are secured.
7.  **Missing Translations:** Handle cases where error message translations are missing for certain languages.
8.  **RTL Text in Error Messages:** Ensure error messages display correctly in both LTR and RTL layouts.

**Constraints:**

1.  **Implement comprehensive error handling and custom logging.**
2.  **Provide user-friendly error messages and notifications in multiple languages.**
3.  **Consider security and performance implications of logging.**
4.  **Initial error reporting to external services is optional.**
5.  **Support internationalization in all error handling components.**
6.  **Use translation keys for all error messages.**

**Pseudocode:**

```pseudocode
// Module: error_handling_logging.ts

// Function: setupGlobalErrorHandler
// Sets up a global error handler for unhandled exceptions
function setupGlobalErrorHandler(): Result<Success, Error> {
  // Vitest test example:
  // describe('setupGlobalErrorHandler', () => {
  //   it('should set up window.onerror handler', () => {
  //     setupGlobalErrorHandler();
  //     expect(window.onerror).toBeDefined();
  //     // Simulate error and verify handler
  //     const error = new Error('Test Error');
  //     window.onerror('Test Error', 'test.js', 1, 1, error);
  //     // Add assertions for error handling behavior
  //   });
  //   it('should set up unhandledrejection handler', async () => {
  //     setupGlobalErrorHandler();
  //     const handler = vi.fn();
  //     window.addEventListener('unhandledrejection', handler);
  //     // Simulate unhandled rejection
  //     await Promise.reject(new Error('Test Rejection'));
  //     expect(handler).toHaveBeenCalled();
  //   });
  // });

  log("Setting up global error handler...");
  global_error_handler_code = `
    // src/utils/errorHandler.ts
    import { logError } from './logger';

    // Error types
    export enum ErrorType {
      STORAGE = 'STORAGE',
      NETWORK = 'NETWORK',
      SYNC = 'SYNC',
      VALIDATION = 'VALIDATION',
      UNKNOWN = 'UNKNOWN'
    }

    // Custom error class
    export class AppError extends Error {
      constructor(
        message: string,
        public type: ErrorType,
        public original?: Error
      ) {
        super(message);
        this.name = 'AppError';
      }
    }

    // Storage-specific error handling
    export class StorageError extends AppError {
      constructor(message: string, original?: Error) {
        super(message, ErrorType.STORAGE, original);
        this.name = 'StorageError';
      }
    }

    export const setupGlobalErrorHandler = () => {
      window.onerror = (message, source, lineno, colno, error) => {
        logError('Global Error Handler:', message, source, lineno, colno, error);
        handleError(error);
        return true;
      };

      window.addEventListener('unhandledrejection', (event) => {
        logError('Unhandled Promise Rejection:', event.reason, event.promise);
        handleError(event.reason);
        event.preventDefault();
      });
    };

    // Enhanced error handling function
    export const handleError = (error: Error | unknown) => {
      if (error instanceof AppError) {
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
          default:
            displayUserFriendlyError('An unexpected error occurred. Please try again.');
        }
      } else {
        displayUserFriendlyError('An unexpected error occurred. Please try again.');
      }
    };

    // Storage error handler
    const handleStorageError = (error: AppError) => {
      switch(error.message) {
        case 'QuotaExceededError':
          displayUserFriendlyError('Storage space is full. Please clear some data.');
          break;
        case 'InvalidStateError':
          displayUserFriendlyError('Storage is not available. Please check your browser settings.');
          break;
        default:
          displayUserFriendlyError('Unable to save your changes offline. Please try again.');
      }
      // Log detailed error information
      logError('Storage Error:', error);
    };

    // Network error handler
    const handleNetworkError = (error: AppError) => {
      displayUserFriendlyError('Network connection issue. Changes will be saved offline.');
      logError('Network Error:', error);
    };

    // Sync error handler
    const handleSyncError = (error: AppError) => {
      displayUserFriendlyError('Unable to sync changes. Will retry automatically when online.');
      logError('Sync Error:', error);
    };

    const displayUserFriendlyError = (message: string) => {
      // Use ErrorNotificationContext to display error message
      if (window.ErrorNotificationContext?.showError) {
        window.ErrorNotificationContext.showError(message);
      } else {
        console.error("User-friendly error:", message);
      }
    };
  `;
  create_directory("src/utils");
  write_to_file("src/utils/errorHandler.ts", global_error_handler_code);

  index_tsx_import_and_setup_content = `
    // src/index.tsx
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import { ThemeContextProvider } from './contexts/ThemeContext';
    import { MindMapContextProvider } from './contexts/MindMapContext';
    import { setupGlobalErrorHandler } from './utils/errorHandler'; // Import global error handler

    setupGlobalErrorHandler(); // Setup global error handling at app start


    // ... rest of index.tsx content (ReactDOM.render etc.)
  `;
  read_file("src/index.tsx");
  apply_diff>
    <path>src/index.tsx</path>
    <diff>
<<<<<<< SEARCH
:start_line:6
:end_line:6
-------
import { MindMapContextProvider } from './contexts/MindMapContext';
=======
import { MindMapContextProvider } from './contexts/MindMapContext';
import { setupGlobalErrorHandler } from './utils/errorHandler'; // Import global error handler

setupGlobalErrorHandler(); // Setup global error handling at app start
>>>>>>> REPLACE
    </diff>
  </apply_diff>


  if (file_write_successful && apply_diff_successful) {
    log("Global error handler setup implemented.");
    return Success;
  } else {
    log_error("Global error handler setup failed.");
    return Error("Global error handler setup failed.");
  }
}

// Function: implementCustomLogger
// Implements a custom logging utility
function implementCustomLogger(): Result<Success, Error> {
  // Vitest test example:
  // describe('CustomLogger', () => {
  //   it('should log messages at appropriate levels', () => {
  //     const debugSpy = vi.spyOn(console, 'debug');
  //     const infoSpy = vi.spyOn(console, 'info');
  //     const warnSpy = vi.spyOn(console, 'warn');
  //     const errorSpy = vi.spyOn(console, 'error');
  //
  //     logDebug('Debug message');
  //     logInfo('Info message');
  //     logWarn('Warning message');
  //     logError('Error message');
  //
  //     expect(debugSpy).toHaveBeenCalledWith('[DEBUG]', expect.any(String), 'Debug message');
  //     expect(infoSpy).toHaveBeenCalledWith('[INFO]', expect.any(String), 'Info message');
  //     expect(warnSpy).toHaveBeenCalledWith('[WARN]', expect.any(String), 'Warning message');
  //     expect(errorSpy).toHaveBeenCalledWith('[ERROR]', expect.any(String), 'Error message');
  //   });
  // });

  log("Implementing custom logger...");
  custom_logger_code = `
    // src/utils/logger.ts
    const logLevels = {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARN: 'WARN',
      ERROR: 'ERROR',
    };

    const currentLogLevel = logLevels.DEBUG; // Default log level - configurable via .env?

    export const logDebug = (...args: any[]) => {
      if (currentLogLevel <= logLevels.DEBUG) {
        console.debug('[DEBUG]', new Date().toISOString(), ...args);
      }
    };

    export const logInfo = (...args: any[]) => {
      if (currentLogLevel <= logLevels.INFO) {
        console.info('[INFO]', new Date().toISOString(), ...args);
      }
    };

    export const logWarn = (...args: any[]) => {
      if (currentLogLevel <= logLevels.WARN) {
        console.warn('[WARN]', new Date().toISOString(), ...args);
      }
    };

    export const logError = (...args: any[]) => {
      if (currentLogLevel <= logLevels.ERROR) {
        console.error('[ERROR]', new Date().toISOString(), ...args);
      }
    };

    // Example usage in other modules:
    // import { logError, logInfo } from './logger';
    // logError('Something went wrong', errorDetails);
    // logInfo('User action performed', actionDetails);
  `;
  write_to_file("src/utils/logger.ts", custom_logger_code);
  if (file_write_successful) {
    log("Custom logger implemented.");
    return Success;
  } else {
    log_error("Custom logger implementation failed.");
    return Error("Custom logger implementation failed.");
  }
}

// Function: implementUserErrorNotifications
// Implements user-friendly error notifications (e.g., using a context/state and component)
function implementUserErrorNotifications(): Result<Success, Error> {
  // Vitest test example:
  // describe('ErrorNotificationContext', () => {
  //   it('should show error message', () => {
  //     const { result } = renderHook(() => useErrorNotification(), {
  //       wrapper: ErrorNotificationContextProvider
  //     });
  //
  //     act(() => {
  //       result.current.showError('Test error message');
  //     });
  //
  //     expect(result.current.errorMessage).toBe('Test error message');
  //   });
  //
  //   it('should clear error message', () => {
  //     const { result } = renderHook(() => useErrorNotification(), {
  //       wrapper: ErrorNotificationContextProvider
  //     });
  //
  //     act(() => {
  //       result.current.showError('Test error');
  //       result.current.clearError();
  //     });
  //
  //     expect(result.current.errorMessage).toBeNull();
  //   });
  //
  //   it('should render Snackbar with error message', () => {
  //     render(
  //       <ErrorNotificationContextProvider>
  //         <TestComponent />
  //       </ErrorNotificationContextProvider>
  //     );
  //
  //     fireEvent.click(screen.getByText('Cause Error'));
  //     expect(screen.getByText('Test error from ErrorHandlerTestComponent')).toBeInTheDocument();
  //   });
  // });

  log("Implementing user error notifications...");
  error_notification_context_code = `
    // src/contexts/ErrorNotificationContext.tsx
    import React, { createContext, useState, useContext } from 'react';
    import { Snackbar } from '@mui/material';

    interface ErrorNotificationContextProps {
      errorMessage: string | null;
      showError: (message: string) => void;
      clearError: () => void;
    }

    const ErrorNotificationContext = createContext<ErrorNotificationContextProps | undefined>(undefined);

    export const ErrorNotificationContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const [errorMessage, setErrorMessage] = useState<string | null>(null);
      const [open, setOpen] = useState(false);

      const showError = (message: string) => {
        setErrorMessage(message);
        setOpen(true);
      };

      const clearError = () => {
        setOpen(false);
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
            onClose={clearError}
            message={errorMessage}
          />
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
  `;
  // Example of using ErrorNotificationContext in a component (e.g., App.tsx or Layout.tsx)
  app_tsx_context_usage_code = `
    // src/App.tsx (Example usage - needs integration in relevant components)
    import React from 'react';
    import Layout from './components/Layout';
    import MindMap from './components/MindMap';
    import ThemeSwitcher from './components/ThemeSwitcher';
    import { ErrorNotificationContextProvider, useErrorNotification } from './contexts/ErrorNotificationContext'; // Import ErrorNotificationContext


    const App: React.FC = () => {
      return (
        <ErrorNotificationContextProvider> {/* Wrap Layout with ErrorNotificationContextProvider */}
          <Layout>
            <ThemeSwitcher />
            <MindMap />
            <ErrorHandlerTestComponent /> {/* Example component to test error handling */}
          </Layout>
        </ErrorNotificationContextProvider>
      );
    };


    // Example component to test error handling (for development/testing)
    const ErrorHandlerTestComponent: React.FC = () => {
      const { showError } = useErrorNotification();

      const causeError = () => {
        try {
          throw new Error('Test error from ErrorHandlerTestComponent');
        } catch (error: any) {
          showError(error.message); // Show error notification
        }
      };

      return (
        <button onClick={causeError}>Cause Error</button>
      );
    };


    export default App;
  `;
  create_directory("src/contexts"); // Ensure directory exists
  write_to_file("src/contexts/ErrorNotificationContext.tsx", error_notification_context_code);
  read_file("src/App.tsx");
  write_to_file("src/App.tsx", app_tsx_context_usage_code);


  if (file_write_successful) {
    log("User error notifications implemented (Snackbar context).");
    return Success;
  } else {
    log_error("User error notifications implementation failed.");
    return Error("User error notifications implementation failed.");
  }
}


// Function: runSetupPhase5
// Orchestrates all setup steps for phase 5
function runSetupPhase5(): Result<Success, AggregateError> {
  log("Starting Phase 5 Setup: Error Handling and Logging");
  results = [];

  result = setupGlobalErrorHandler();
  results.push(result);
  if (result is Error) { log_error("Global error handler setup failed."); }

  result = implementCustomLogger();
  results.push(result);
  if (result is Error) { log_error("Custom logger implementation failed."); }

  result = implementUserErrorNotifications();
  results.push(result);
  if (result is Error) { log_error("User error notifications implementation failed."); }


  if (all_results_successful(results)) {
    log("Phase 5 Setup: Error Handling and Logging completed successfully.");
    return Success;
  } else {
    log_error("Phase 5 Setup: Error Handling and Logging completed with potential issues.");
    return AggregateError(results);
  }
}

runSetupPhase5();