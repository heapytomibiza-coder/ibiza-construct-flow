/**
 * Integration Types
 * Phase 29: Advanced Integration & API Management System
 */

export interface Integration {
  id: string;
  name: string;
  description?: string;
  type: IntegrationType;
  provider: string;
  config: IntegrationConfig;
  status: IntegrationStatus;
  enabled: boolean;
  credentials?: IntegrationCredentials;
  createdAt: Date;
  updatedAt?: Date;
  lastSyncAt?: Date;
}

export type IntegrationType = 
  | 'rest_api'
  | 'graphql'
  | 'webhook'
  | 'database'
  | 'storage'
  | 'messaging'
  | 'payment'
  | 'email'
  | 'sms'
  | 'analytics'
  | 'crm'
  | 'custom';

export type IntegrationStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'configuring'
  | 'testing';

export interface IntegrationConfig {
  baseUrl?: string;
  apiVersion?: string;
  timeout?: number;
  retryConfig?: RetryConfig;
  rateLimit?: RateLimitConfig;
  headers?: Record<string, string>;
  transformers?: TransformerConfig;
  webhookUrl?: string;
  [key: string]: any;
}

export interface IntegrationCredentials {
  type: CredentialType;
  data: Record<string, string>;
  expiresAt?: Date;
}

export type CredentialType = 
  | 'api_key'
  | 'bearer_token'
  | 'oauth2'
  | 'basic_auth'
  | 'custom';

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
  retryOn?: number[]; // HTTP status codes
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'sliding' | 'fixed';
}

export interface TransformerConfig {
  request?: TransformFunction;
  response?: TransformFunction;
}

export type TransformFunction = (data: any) => any;

export interface APIEndpoint {
  id: string;
  integrationId: string;
  name: string;
  method: HTTPMethod;
  path: string;
  description?: string;
  params?: EndpointParam[];
  headers?: Record<string, string>;
  body?: any;
  response?: ResponseSchema;
  auth?: AuthConfig;
}

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface EndpointParam {
  name: string;
  type: ParamType;
  required: boolean;
  location: ParamLocation;
  description?: string;
  default?: any;
  validation?: ValidationRule[];
}

export type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object';
export type ParamLocation = 'path' | 'query' | 'header' | 'body';

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value: any;
  message?: string;
}

export interface ResponseSchema {
  statusCode: number;
  schema?: any;
  headers?: Record<string, string>;
}

export interface AuthConfig {
  type: CredentialType;
  credentials: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  event: string;
  payload: any;
  headers: Record<string, string>;
  timestamp: Date;
  processed: boolean;
  processedAt?: Date;
  error?: string;
}

export interface WebhookSubscription {
  id: string;
  integrationId: string;
  events: string[];
  url: string;
  secret?: string;
  active: boolean;
  createdAt: Date;
}

export interface APIRequest {
  id: string;
  integrationId: string;
  endpointId?: string;
  method: HTTPMethod;
  url: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
}

export interface APIResponse {
  id: string;
  requestId: string;
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
  timestamp: Date;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export interface IntegrationMetrics {
  integrationId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  successRate: number;
  lastRequestAt?: Date;
  errorRate: number;
}

export interface ServiceConnector {
  id: string;
  name: string;
  provider: string;
  category: string;
  description?: string;
  icon?: string;
  configSchema: ConfigSchema;
  endpoints: APIEndpoint[];
  webhooks?: WebhookConfig[];
}

export interface ConfigSchema {
  fields: ConfigField[];
}

export interface ConfigField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  description?: string;
  default?: any;
  options?: Array<{ label: string; value: any }>;
}

export interface WebhookConfig {
  event: string;
  description?: string;
  payloadSchema?: any;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SyncJob {
  id: string;
  integrationId: string;
  type: 'full' | 'incremental';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsFailed: number;
  error?: string;
}
