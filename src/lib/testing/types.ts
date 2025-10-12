/**
 * Testing Types
 * Phase 23: Testing & Quality Assurance System
 */

export interface MockConfig {
  delay?: number;
  error?: Error;
  returnValue?: any;
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'professional' | 'customer';
  verified: boolean;
  createdAt: Date;
}

export interface TestContext {
  user?: TestUser;
  session?: any;
  mocks?: Record<string, any>;
  cleanup?: (() => void)[];
}

export interface RenderOptions {
  user?: TestUser;
  initialRoute?: string;
  wrapper?: React.ComponentType<any>;
  providers?: React.ComponentType<any>[];
}

export interface MockAPIResponse<T = any> {
  data: T | null;
  error: Error | null;
  status: number;
  headers?: Record<string, string>;
}

export type MockFunction<T extends (...args: any[]) => any> = T & {
  mock: {
    calls: Parameters<T>[];
    results: { type: 'return' | 'throw'; value: ReturnType<T> }[];
  };
};
