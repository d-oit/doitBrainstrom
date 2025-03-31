# Mind Map PWA - Error Handling Strategy

## Overview

This document outlines the error handling strategy implemented in the Mind Map PWA application. The strategy is designed to provide a robust, user-friendly approach to handling errors at different levels of the application. It ensures that errors are properly caught, logged, and presented to users in a way that maintains a good user experience even when things go wrong.

## Key Components

### 1. Error Types

The application defines several error types to categorize different kinds of errors:

- **StorageError**: For errors related to local storage operations (IndexedDB)
  - Examples: QuotaExceededError, InvalidStateError, TransactionAbortError
- **NetworkError**: For errors related to network operations (S3 API calls)
  - Examples: ConnectionError, TimeoutError, AuthenticationError
- **SyncError**: For errors related to data synchronization
  - Examples: ConflictError, VersionMismatchError, PartialSyncError
- **ValidationError**: For errors related to data validation
  - Examples: InvalidDataError, SchemaValidationError, TypeMismatchError
- **RenderingError**: For errors related to UI rendering
  - Examples: ComponentRenderError, StateUpdateError, LifecycleError
- **UnknownError**: For uncategorized errors
  - Used as a fallback when the error type cannot be determined

### 2. Logging System

A centralized logging system with different log levels:

- **DEBUG**: Detailed information for debugging purposes
  - Used for tracing code execution and variable values during development
  - Example: `logDebug('Loading mind map data', { id: mapId });`
- **INFO**: General information about application flow
  - Used for tracking normal application events and user actions
  - Example: `logInfo('User created new mind map node', { nodeId });`
- **WARN**: Warnings that don't prevent the application from functioning
  - Used for potential issues that should be monitored
  - Example: `logWarn('S3 connection slow', { responseTime: '2500ms' });`
- **ERROR**: Errors that affect functionality but don't crash the application
  - Used for significant issues that impact user experience
  - Example: `logError('Failed to save mind map', error);`
- **NONE**: No logging (can be used in production)
  - Used to disable logging in specific environments

The logging system includes:
- Timestamp for each log entry (ISO format)
- User locale information for context (helps with i18n-related issues)
- Sanitization of sensitive data (removes tokens, credentials)
- Log grouping for complex operations (groups related logs together)
- Contextual metadata (browser info, app version, etc.)

### 3. Global Error Handler

A global error handler that:

- Catches uncaught exceptions
  - Uses `window.onerror` to capture runtime errors
  - Prevents application crashes from unhandled exceptions
- Handles unhandled promise rejections
  - Uses `window.addEventListener('unhandledrejection', ...)` to capture async errors
  - Ensures async operations don't silently fail
- Routes errors to appropriate handlers based on error type
  - Directs storage errors to storage-specific handlers
  - Directs network errors to network-specific handlers
  - Directs sync errors to sync-specific handlers
- Displays user-friendly error messages
  - Translates technical errors into user-understandable messages
  - Uses the ErrorNotificationContext to show notifications

### 4. Error Notification System

A React context that:

- Provides a centralized way to display error notifications
  - Uses Material UI's Snackbar component for consistent UI
  - Can be accessed from any component via the useErrorNotification hook
- Shows error messages in a user-friendly format
  - Translates error codes to human-readable messages
  - Provides actionable information when possible
- Automatically dismisses notifications after a timeout
  - Default timeout of 6000ms (configurable)
  - Critical errors can be set to require manual dismissal
- Supports RTL languages
  - Properly aligns error messages based on the current locale
  - Ensures correct text direction for all languages

### 5. Error Boundary

A React error boundary component that:

- Catches errors in the component tree
  - Uses React's componentDidCatch lifecycle method
  - Isolates errors to specific components or sections
- Prevents the entire application from crashing
  - Contains errors within their component boundaries
  - Allows the rest of the application to function normally
- Displays fallback UI when errors occur
  - Shows user-friendly error messages or fallback components
  - Provides retry options when appropriate
- Logs component errors for debugging
  - Captures detailed error information including component stack
  - Sends error reports for later analysis

## Error Handling Flow

1. **Error Detection**: Errors are detected at various levels (API calls, storage operations, etc.)
   - Try/catch blocks around critical operations
   - Event listeners for global errors
   - Error boundaries for React component errors
2. **Error Classification**: Errors are classified into specific types
   - Custom error classes extend the base Error class
   - Error type is determined based on the operation and context
   - Original error is preserved for debugging
3. **Error Logging**: Errors are logged with appropriate context
   - Error details are sent to the logging system
   - Context information is included (user action, component, etc.)
   - Stack traces are captured for debugging
4. **Error Handling**: Specific handlers process errors based on their type
   - StorageError → handleStorageError()
   - NetworkError → handleNetworkError()
   - SyncError → handleSyncError()
5. **User Notification**: User-friendly messages are displayed when appropriate
   - Technical details are translated to user-friendly messages
   - Notifications are shown through the ErrorNotificationContext
   - Messages are localized based on user's language
6. **Recovery**: The application attempts to recover from errors when possible
   - Retry mechanisms for transient errors
   - Fallback to offline mode for network errors
   - Automatic data recovery for storage errors

## Offline Error Handling

Special consideration is given to handling errors in offline mode:

- Network errors are caught and handled gracefully
  - API calls automatically fall back to local data
  - Error messages indicate the offline status rather than connection failure
- Operations are queued for later execution when online
  - Changes are stored in IndexedDB with a 'pending' status
  - Service worker background sync API is used to process the queue
- Users are notified of offline status
  - A persistent indicator shows the current connection state
  - Toast notifications appear when transitioning between online/offline
- Background sync is used to retry operations when online
  - The service worker registers sync events
  - Sync operations are retried with exponential backoff
  - Conflicts are resolved using the defined strategy

## Implementation Details

### Error Classes

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public original?: Error,
    public data?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, original?: Error, data?: any) {
    super(message, ErrorType.STORAGE, original, data);
    this.name = 'StorageError';
  }
}

// Additional error classes for other error types
```

### Logging Functions

```typescript
export const logError = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(...formatLogMessage('ERROR', ...args));
  }
};

export const logErrorWithStack = (message: string, error?: Error): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    const stack = error?.stack || new Error().stack;
    console.error(...formatLogMessage('ERROR', message, error, '\nStack Trace:', stack));
  }
};
```

### Error Notification Context

```typescript
export const ErrorNotificationContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // ... rest of the implementation
};
```

## Best Practices

1. **Always catch errors in async operations**
   - Use try/catch blocks with async/await
   - Handle promise rejections with .catch()
   - Implement global unhandledrejection listener as a safety net
2. **Use specific error types for better error handling**
   - Extend the base AppError class for custom error types
   - Include relevant context in error objects
   - Maintain consistent error structure across the application
3. **Provide user-friendly error messages**
   - Translate technical errors to user-understandable language
   - Include actionable information when possible
   - Use the user's preferred language for error messages
4. **Log errors with appropriate context**
   - Include relevant state information with error logs
   - Add user actions that led to the error
   - Capture environment information (browser, OS, etc.)
5. **Handle offline scenarios gracefully**
   - Detect and adapt to network status changes
   - Provide clear offline indicators in the UI
   - Implement robust sync mechanisms for when connection returns
6. **Use error boundaries for UI components**
   - Place error boundaries strategically in the component tree
   - Create meaningful fallback UIs for different components
   - Reset error state when appropriate
7. **Sanitize sensitive data before logging**
   - Remove authentication tokens, passwords, and personal data
   - Use data masking for sensitive fields
   - Implement a sanitization layer in the logging system
8. **Implement fallback mechanisms for critical operations**
   - Have alternative data sources when primary sources fail
   - Implement retry logic with exponential backoff
   - Cache critical data to ensure availability
