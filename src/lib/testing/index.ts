/**
 * Testing Module Exports
 * Phase 23: Testing & Quality Assurance System
 */

export * from './types';
export * from './factories';
export * from './mocks';
export * from './utils';

// Re-export commonly used testing library functions
export { render } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
