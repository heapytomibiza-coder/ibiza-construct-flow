import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Security tests for input validation
 * Ensures proper sanitization and validation of user inputs
 */
describe('Input Validation Security', () => {
  describe('Email validation', () => {
    const emailSchema = z.string().email().max(255);

    it('accepts valid email addresses', () => {
      expect(() => emailSchema.parse('user@example.com')).not.toThrow();
      expect(() => emailSchema.parse('test+tag@domain.co.uk')).not.toThrow();
    });

    it('rejects invalid email addresses', () => {
      expect(() => emailSchema.parse('not-an-email')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
      expect(() => emailSchema.parse('user@')).toThrow();
    });

    it('prevents excessively long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => emailSchema.parse(longEmail)).toThrow();
    });
  });

  describe('Text input validation', () => {
    const textSchema = z.string().trim().min(1).max(1000);

    it('accepts valid text input', () => {
      expect(() => textSchema.parse('Hello world')).not.toThrow();
    });

    it('trims whitespace', () => {
      const result = textSchema.parse('  text  ');
      expect(result).toBe('text');
    });

    it('rejects empty strings', () => {
      expect(() => textSchema.parse('')).toThrow();
      expect(() => textSchema.parse('   ')).toThrow();
    });

    it('prevents excessively long input', () => {
      const longText = 'a'.repeat(1001);
      expect(() => textSchema.parse(longText)).toThrow();
    });
  });

  describe('XSS prevention', () => {
    it('rejects script tags in input', () => {
      const unsafeSchema = z.string().refine(
        (val) => !/<script/i.test(val),
        'Script tags not allowed'
      );

      expect(() => unsafeSchema.parse('<script>alert("xss")</script>')).toThrow();
      expect(() => unsafeSchema.parse('Safe text')).not.toThrow();
    });

    it('rejects event handlers in input', () => {
      const unsafeSchema = z.string().refine(
        (val) => !/on\w+=/i.test(val),
        'Event handlers not allowed'
      );

      expect(() => unsafeSchema.parse('<div onclick="evil()">text</div>')).toThrow();
      expect(() => unsafeSchema.parse('Normal text')).not.toThrow();
    });
  });

  describe('SQL injection prevention', () => {
    it('validates safe input patterns', () => {
      const safeInputSchema = z.string().regex(/^[a-zA-Z0-9\s\-_.,!?]+$/);

      expect(() => safeInputSchema.parse('Valid input 123')).not.toThrow();
      expect(() => safeInputSchema.parse("'; DROP TABLE users; --")).toThrow();
    });
  });

  describe('URL validation', () => {
    const urlSchema = z.string().url();

    it('accepts valid URLs', () => {
      expect(() => urlSchema.parse('https://example.com')).not.toThrow();
      expect(() => urlSchema.parse('http://localhost:3000')).not.toThrow();
    });

    it('rejects javascript: URLs', () => {
      expect(() => urlSchema.parse('javascript:alert(1)')).toThrow();
    });

    it('rejects data: URLs', () => {
      expect(() => urlSchema.parse('data:text/html,<script>alert(1)</script>')).toThrow();
    });
  });
});
