/**
 * API Client
 * Phase 29: Advanced Integration & API Management System
 * 
 * Generic API client with retry, rate limiting, and transformation
 */

import {
  HTTPMethod,
  RetryConfig,
  RateLimitConfig,
  TransformerConfig,
  APIRequest,
  APIResponse,
  APIError,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class APIClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryConfig?: RetryConfig;
  private rateLimit?: RateLimitConfig;
  private transformers?: TransformerConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private requestTimestamps: number[] = [];
  private processing: boolean = false;

  constructor(config: {
    baseUrl: string;
    headers?: Record<string, string>;
    retryConfig?: RetryConfig;
    rateLimit?: RateLimitConfig;
    transformers?: TransformerConfig;
  }) {
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.headers || {};
    this.retryConfig = config.retryConfig;
    this.rateLimit = config.rateLimit;
    this.transformers = config.transformers;
  }

  /**
   * Make HTTP request
   */
  async request(
    method: HTTPMethod,
    path: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
      body?: any;
      timeout?: number;
    }
  ): Promise<APIResponse> {
    const request: APIRequest = {
      id: uuidv4(),
      integrationId: '', // Set by caller
      method,
      url: this.buildUrl(path, options?.params),
      headers: { ...this.defaultHeaders, ...options?.headers },
      body: options?.body,
      timestamp: new Date(),
    };

    // Apply request transformer
    if (this.transformers?.request && request.body) {
      request.body = this.transformers.request(request.body);
    }

    // Apply rate limiting
    if (this.rateLimit) {
      await this.enforceRateLimit();
    }

    const startTime = Date.now();

    try {
      const response = await this.executeRequest(request, options?.timeout);
      
      // Apply response transformer
      if (this.transformers?.response && response.body) {
        response.body = this.transformers.response(response.body);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Check if retryable
      if (this.retryConfig && this.isRetryable(error)) {
        return this.retryRequest(request, error, options?.timeout);
      }

      throw {
        id: uuidv4(),
        requestId: request.id,
        statusCode: (error as any).statusCode || 500,
        headers: {},
        body: null,
        duration,
        timestamp: new Date(),
        error: this.formatError(error),
      } as APIResponse;
    }
  }

  /**
   * GET request
   */
  async get(path: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }): Promise<APIResponse> {
    return this.request('GET', path, options);
  }

  /**
   * POST request
   */
  async post(path: string, body?: any, options?: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }): Promise<APIResponse> {
    return this.request('POST', path, { ...options, body });
  }

  /**
   * PUT request
   */
  async put(path: string, body?: any, options?: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }): Promise<APIResponse> {
    return this.request('PUT', path, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch(path: string, body?: any, options?: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }): Promise<APIResponse> {
    return this.request('PATCH', path, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete(path: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, any>;
  }): Promise<APIResponse> {
    return this.request('DELETE', path, options);
  }

  /**
   * Execute request
   */
  private async executeRequest(
    request: APIRequest,
    timeout?: number
  ): Promise<APIResponse> {
    const startTime = Date.now();

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    };

    const response = await fetch(request.url, fetchOptions);
    const duration = Date.now() - startTime;

    let body;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    const apiResponse: APIResponse = {
      id: uuidv4(),
      requestId: request.id,
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body,
      duration,
      timestamp: new Date(),
    };

    if (!response.ok) {
      apiResponse.error = {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        details: body,
        retryable: this.isStatusRetryable(response.status),
      };
      throw apiResponse;
    }

    return apiResponse;
  }

  /**
   * Retry request
   */
  private async retryRequest(
    request: APIRequest,
    error: any,
    timeout?: number,
    attempt: number = 0
  ): Promise<APIResponse> {
    if (!this.retryConfig || attempt >= this.retryConfig.maxAttempts) {
      throw error;
    }

    const delay = this.calculateBackoff(attempt);
    await this.delay(delay);

    try {
      return await this.executeRequest(request, timeout);
    } catch (retryError) {
      return this.retryRequest(request, retryError, timeout, attempt + 1);
    }
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(attempt: number): number {
    if (!this.retryConfig) return 0;

    let delay: number;

    switch (this.retryConfig.backoffStrategy) {
      case 'exponential':
        delay = this.retryConfig.initialDelay * Math.pow(2, attempt);
        break;
      case 'linear':
        delay = this.retryConfig.initialDelay * (attempt + 1);
        break;
      case 'fixed':
      default:
        delay = this.retryConfig.initialDelay;
    }

    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any): boolean {
    if (!this.retryConfig) return false;

    const statusCode = error.statusCode;
    if (!statusCode) return true; // Network errors are retryable

    // Check if status code is in retry list
    if (this.retryConfig.retryOn) {
      return this.retryConfig.retryOn.includes(statusCode);
    }

    // Default retryable status codes
    return this.isStatusRetryable(statusCode);
  }

  /**
   * Check if status code is retryable
   */
  private isStatusRetryable(statusCode: number): boolean {
    return [408, 429, 500, 502, 503, 504].includes(statusCode);
  }

  /**
   * Enforce rate limit
   */
  private async enforceRateLimit(): Promise<void> {
    if (!this.rateLimit) return;

    const now = Date.now();
    const windowStart = now - this.rateLimit.windowMs;

    // Remove old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(t => t > windowStart);

    // Check if limit exceeded
    if (this.requestTimestamps.length >= this.rateLimit.maxRequests) {
      const oldestTimestamp = this.requestTimestamps[0];
      const waitTime = oldestTimestamp + this.rateLimit.windowMs - now;
      
      if (waitTime > 0) {
        await this.delay(waitTime);
        return this.enforceRateLimit();
      }
    }

    this.requestTimestamps.push(now);
  }

  /**
   * Build URL with query params
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Format error
   */
  private formatError(error: any): APIError {
    if (error.error) return error.error;

    return {
      code: error.code || 'REQUEST_ERROR',
      message: error.message || 'Unknown error',
      details: error.details,
      retryable: this.isRetryable(error),
    };
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    baseUrl?: string;
    headers?: Record<string, string>;
    retryConfig?: RetryConfig;
    rateLimit?: RateLimitConfig;
    transformers?: TransformerConfig;
  }): void {
    if (config.baseUrl) this.baseUrl = config.baseUrl;
    if (config.headers) this.defaultHeaders = { ...this.defaultHeaders, ...config.headers };
    if (config.retryConfig) this.retryConfig = config.retryConfig;
    if (config.rateLimit) this.rateLimit = config.rateLimit;
    if (config.transformers) this.transformers = config.transformers;
  }
}
