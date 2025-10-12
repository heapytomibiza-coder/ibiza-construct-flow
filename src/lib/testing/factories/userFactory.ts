/**
 * User Factory
 * Phase 23: Testing & Quality Assurance System
 * 
 * Generate test user data
 */

import { v4 as uuidv4 } from 'uuid';
import { TestUser } from '../types';

let userCounter = 0;

export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  userCounter++;
  
  return {
    id: uuidv4(),
    email: `test.user${userCounter}@example.com`,
    name: `Test User ${userCounter}`,
    role: 'customer',
    verified: true,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createAdminUser(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    role: 'admin',
    email: `admin${userCounter}@example.com`,
    name: `Admin User ${userCounter}`,
    ...overrides,
  });
}

export function createProfessionalUser(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    role: 'professional',
    email: `pro${userCounter}@example.com`,
    name: `Professional User ${userCounter}`,
    ...overrides,
  });
}

export function createCustomerUser(overrides?: Partial<TestUser>): TestUser {
  return createTestUser({
    role: 'customer',
    email: `customer${userCounter}@example.com`,
    name: `Customer User ${userCounter}`,
    ...overrides,
  });
}

export function resetUserCounter(): void {
  userCounter = 0;
}
