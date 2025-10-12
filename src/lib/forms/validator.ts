/**
 * Form Validator
 * Phase 19: Form Builder & Validation System
 * 
 * Validation engine for form fields
 */

import { ValidationRule, ValidationErrors, FormValues } from './types';

export class FormValidator {
  validateField(
    value: any,
    rules: ValidationRule[],
    fieldName: string
  ): string | null {
    for (const rule of rules) {
      const error = this.validateRule(value, rule, fieldName);
      if (error) return error;
    }
    return null;
  }

  validateForm(
    values: FormValues,
    fieldRules: Map<string, ValidationRule[]>
  ): ValidationErrors {
    const errors: ValidationErrors = {};

    fieldRules.forEach((rules, fieldName) => {
      const error = this.validateField(values[fieldName], rules, fieldName);
      if (error) {
        errors[fieldName] = error;
      }
    });

    return errors;
  }

  private validateRule(
    value: any,
    rule: ValidationRule,
    fieldName: string
  ): string | null {
    const { type, value: ruleValue, message } = rule;

    switch (type) {
      case 'required':
        if (this.isEmpty(value)) {
          return message || `${fieldName} is required`;
        }
        break;

      case 'minLength':
        if (typeof value === 'string' && value.length < ruleValue) {
          return message || `${fieldName} must be at least ${ruleValue} characters`;
        }
        break;

      case 'maxLength':
        if (typeof value === 'string' && value.length > ruleValue) {
          return message || `${fieldName} must be at most ${ruleValue} characters`;
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < ruleValue) {
          return message || `${fieldName} must be at least ${ruleValue}`;
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > ruleValue) {
          return message || `${fieldName} must be at most ${ruleValue}`;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(ruleValue).test(value)) {
          return message || `${fieldName} format is invalid`;
        }
        break;

      case 'email':
        if (typeof value === 'string' && !this.isValidEmail(value)) {
          return message || `${fieldName} must be a valid email`;
        }
        break;

      case 'url':
        if (typeof value === 'string' && !this.isValidUrl(value)) {
          return message || `${fieldName} must be a valid URL`;
        }
        break;

      case 'custom':
        if (typeof ruleValue === 'function') {
          const customError = ruleValue(value);
          if (customError) return customError;
        }
        break;
    }

    return null;
  }

  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const formValidator = new FormValidator();
