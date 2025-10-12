// Common Validation Rules and Utilities
// Phase 7: Form Components Standardization & Validation

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

/**
 * Password validation schema
 * Requires minimum 8 characters
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

/**
 * Strong password validation schema
 * Requires uppercase, lowercase, number, and special character
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

/**
 * Message/text validation schema
 */
export const messageSchema = z
  .string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message must be less than 2000 characters');

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Please enter a valid phone number');

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url('Please enter a valid URL');

/**
 * Optional URL validation (can be empty)
 */
export const optionalUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

/**
 * Postal code validation (flexible)
 */
export const postalCodeSchema = z
  .string()
  .min(3, 'Postal code must be at least 3 characters')
  .max(10, 'Postal code must be less than 10 characters');

/**
 * Common validation error messages
 */
export const validationMessages = {
  required: (field: string) => `${field} is required`,
  min: (field: string, min: number) => `${field} must be at least ${min} characters`,
  max: (field: string, max: number) => `${field} must be less than ${max} characters`,
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
} as const;
