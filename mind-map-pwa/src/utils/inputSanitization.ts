/**
 * Input Sanitization Utilities
 * 
 * This module provides utilities for sanitizing user input to prevent
 * security vulnerabilities like XSS (Cross-Site Scripting).
 */

/**
 * Sanitizes text input by escaping HTML tags and removing potentially dangerous content
 * 
 * @param input - The text input to sanitize
 * @returns The sanitized text
 */
export const sanitizeTextInput = (input: string): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

/**
 * Sanitizes an object's string properties
 * 
 * @param obj - The object with properties to sanitize
 * @returns A new object with sanitized string properties
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeTextInput(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeTextInput(item) : 
        (typeof item === 'object' && item !== null) ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

/**
 * Validates and sanitizes input based on expected type
 * 
 * @param input - The input to validate and sanitize
 * @param expectedType - The expected type of the input
 * @returns The sanitized input
 * @throws Error if input type doesn't match expected type
 */
export const validateAndSanitize = (input: any, expectedType: string): any => {
  // Check if input type matches expected type
  if (typeof input !== expectedType) {
    throw new Error(`Invalid input type. Expected ${expectedType}, got ${typeof input}`);
  }
  
  // Sanitize based on type
  if (expectedType === 'string') {
    return sanitizeTextInput(input);
  } else if (expectedType === 'object' && input !== null) {
    return sanitizeObject(input);
  }
  
  // For other types (number, boolean, etc.), return as is
  return input;
};

/**
 * Sanitizes HTML content for safe rendering
 * This is a more aggressive sanitization for when you need to render HTML
 * 
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary DOM element
  const tempElement = document.createElement('div');
  tempElement.textContent = html;
  
  // Return the sanitized HTML (as text)
  return tempElement.innerHTML;
};

/**
 * Example usage:
 * 
 * // Sanitize a simple text input
 * const userInput = '<script>alert("XSS")</script> Hello <div>World</div>';
 * const sanitized = sanitizeTextInput(userInput);
 * // Result: '&lt;script&gt;alert("XSS")&lt;/script&gt; Hello &lt;div&gt;World&lt;/div&gt;'
 * 
 * // Sanitize an object with nested properties
 * const userData = {
 *   name: '<script>alert("XSS")</script>John',
 *   email: 'john@example.com',
 *   preferences: {
 *     theme: 'dark<img src="x" onerror="alert(1)">'
 *   }
 * };
 * const sanitizedData = sanitizeObject(userData);
 * 
 * // Validate and sanitize with type checking
 * try {
 *   const validatedInput = validateAndSanitize(userInput, 'string');
 *   // Use the validated and sanitized input
 * } catch (error) {
 *   console.error('Validation error:', error.message);
 * }
 */
