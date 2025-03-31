// src/utils/logger.ts

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Default log level - can be configured via environment variable
const DEFAULT_LOG_LEVEL = (import.meta as any).env.PROD
  ? LogLevel.ERROR
  : LogLevel.DEBUG;

// Current log level
let currentLogLevel = DEFAULT_LOG_LEVEL;

// Set log level
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
};

// Get current log level
export const getLogLevel = (): LogLevel => {
  return currentLogLevel;
};

// Format log message with timestamp and additional context
const formatLogMessage = (level: string, ...args: any[]): any[] => {
  const timestamp = new Date().toISOString();
  const userLocale = navigator.language || 'en-US';

  // Add user context to logs
  return [`[${level}] [${timestamp}] [${userLocale}]`, ...args];
};

// Debug level logging
export const logDebug = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(...formatLogMessage('DEBUG', ...args));
  }
};

// Info level logging
export const logInfo = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(...formatLogMessage('INFO', ...args));
  }
};

// Warning level logging
export const logWarn = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(...formatLogMessage('WARN', ...args));
  }
};

// Error level logging
export const logError = (...args: any[]): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(...formatLogMessage('ERROR', ...args));
  }
};

// Log with stack trace
export const logErrorWithStack = (message: string, error?: Error): void => {
  if (currentLogLevel <= LogLevel.ERROR) {
    const stack = error?.stack || new Error().stack;
    console.error(...formatLogMessage('ERROR', message, error, '\nStack Trace:', stack));
  }
};

// Group logs (useful for complex operations)
export const logGroup = (groupName: string, logFn: () => void): void => {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.group(groupName);
    try {
      logFn();
    } finally {
      console.groupEnd();
    }
  } else {
    logFn();
  }
};

// Sanitize sensitive data before logging
export const sanitizeForLogging = (data: any): any => {
  if (!data) return data;

  // Clone the data to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(data));

  // List of sensitive fields to redact
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'accessKey', 'secretKey'];

  // Recursively sanitize objects
  const sanitizeObject = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return;

    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };

  sanitizeObject(sanitized);
  return sanitized;
};

// Initialize logger
export const initLogger = (): void => {
  logInfo('Logger initialized', {
    level: LogLevel[currentLogLevel],
    environment: (import.meta as any).env.MODE
  });
};
