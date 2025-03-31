import { describe, it, expect } from 'vitest';
import { sanitizeTextInput, sanitizeObject, validateAndSanitize, sanitizeHTML } from './inputSanitization';

describe('inputSanitization Utility', () => {
  describe('sanitizeTextInput', () => {
    it('sanitizes text input by escaping HTML tags', () => {
      const input = '<script>alert("XSS");</script> Hello <div>World</div>';
      const sanitizedInput = sanitizeTextInput(input);
      expect(sanitizedInput).toBe('&lt;script&gt;alert("XSS");&lt;/script&gt; Hello &lt;div&gt;World&lt;/div&gt;');
    });

    it('returns empty string for null or undefined input', () => {
      expect(sanitizeTextInput(null as any)).toBe('');
      expect(sanitizeTextInput(undefined as any)).toBe('');
    });

    it('handles plain text input without changes', () => {
      const input = 'Plain text input';
      const sanitizedInput = sanitizeTextInput(input);
      expect(sanitizedInput).toBe('Plain text input');
    });

    it('removes javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const sanitizedInput = sanitizeTextInput(input);
      expect(sanitizedInput).not.toContain('javascript:');
    });

    it('removes data: protocol', () => {
      const input = 'data:text/html,<script>alert(1)</script>';
      const sanitizedInput = sanitizeTextInput(input);
      expect(sanitizedInput).not.toContain('data:');
    });

    it('removes event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const sanitizedInput = sanitizeTextInput(input);
      expect(sanitizedInput).not.toContain('onclick=');
    });
  });

  describe('sanitizeObject', () => {
    it('sanitizes string properties in an object', () => {
      const obj = {
        name: '<script>alert("XSS")</script>John',
        age: 30,
        isActive: true
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;John');
      expect(sanitized.age).toBe(30);
      expect(sanitized.isActive).toBe(true);
    });

    it('sanitizes nested objects', () => {
      const obj = {
        user: {
          name: '<script>alert("XSS")</script>John',
          profile: {
            bio: '<img src="x" onerror="alert(1)">'
          }
        }
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.user.name).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;John');
      expect(sanitized.user.profile.bio).not.toContain('onerror=');
    });

    it('sanitizes arrays of strings', () => {
      const obj = {
        tags: ['<script>alert(1)</script>', 'normal tag', '<img src="x" onerror="alert(1)">']
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.tags[0]).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(sanitized.tags[1]).toBe('normal tag');
      expect(sanitized.tags[2]).not.toContain('onerror=');
    });

    it('sanitizes arrays of objects', () => {
      const obj = {
        users: [
          { name: '<script>alert(1)</script>' },
          { name: 'normal name' }
        ]
      };
      const sanitized = sanitizeObject(obj);
      expect(sanitized.users[0].name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(sanitized.users[1].name).toBe('normal name');
    });
  });

  describe('validateAndSanitize', () => {
    it('validates and sanitizes string input', () => {
      const input = '<script>alert(1)</script>';
      const result = validateAndSanitize(input, 'string');
      expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('throws error for invalid input type', () => {
      const input = 123;
      expect(() => validateAndSanitize(input, 'string')).toThrow('Invalid input type');
    });

    it('returns non-string types as is', () => {
      const input = 123;
      const result = validateAndSanitize(input, 'number');
      expect(result).toBe(123);
    });

    it('sanitizes object input', () => {
      const input = { name: '<script>alert(1)</script>' };
      const result = validateAndSanitize(input, 'object');
      expect(result.name).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });
  });

  // Skip sanitizeHTML tests in node environment as they require DOM
  describe.skip('sanitizeHTML', () => {
    it('sanitizes HTML content', () => {
      const html = '<script>alert(1)</script><div>Hello</div>';
      const sanitized = sanitizeHTML(html);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('returns empty string for null or undefined input', () => {
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
      expect(sanitizeHTML('')).toBe('');
    });
  });
});
