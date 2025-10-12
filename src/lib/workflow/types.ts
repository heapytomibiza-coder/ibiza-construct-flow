/**
 * Workflow Types
 * Phase 28: Advanced Workflow & Automation System
 */

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  enabled: boolean;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  lastExecutedAt?: Date;
  executionCount: number;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface WorkflowTrigger {
  type: TriggerType;
  config: TriggerConfig;
  conditions?: WorkflowCondition[];
}

export type TriggerType = 
  | 'manual'
  | 'schedule'
  | 'event'
  | 'webhook'
  | 'database'
  | 'time';

export interface TriggerConfig {
  eventName?: string;
  schedule?: ScheduleConfig;
  webhookUrl?: string;
  tableName?: string;
  operation?: 'insert' | 'update' | 'delete';
  [key: string]: any;
}

export interface ScheduleConfig {
  type: 'interval' | 'cron' | 'once';
  interval?: number; // milliseconds
  cron?: string; // cron expression
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
  conditions?: WorkflowCondition[];
  onSuccess?: string; // Next step ID
  onFailure?: string; // Next step ID
  retryConfig?: RetryConfig;
  timeout?: number;
}

export type StepType = 
  | 'action'
  | 'condition'
  | 'loop'
  | 'parallel'
  | 'delay'
  | 'transform'
  | 'api_call'
  | 'database'
  | 'notification'
  | 'email'
  | 'webhook'
  | 'script';

export interface StepConfig {
  action?: string;
  params?: Record<string, any>;
  script?: string;
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  query?: string;
  template?: string;
  [key: string]: any;
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export type ConditionOperator = 
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'exists'
  | 'notExists';

export interface RetryConfig {
  maxAttempts: number;
  backoffMultiplier: number;
  initialDelay: number;
  maxDelay: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  triggerData?: any;
  context: ExecutionContext;
  steps: StepExecution[];
  error?: ExecutionError;
}

export type ExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface ExecutionContext {
  variables: Record<string, any>;
  metadata: Record<string, any>;
  userId?: string;
  timestamp: Date;
}

export interface StepExecution {
  stepId: string;
  status: ExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  input?: any;
  output?: any;
  error?: ExecutionError;
  retryCount: number;
}

export interface ExecutionError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: WorkflowCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt?: Date;
  executionCount: number;
}

export interface AutomationTrigger {
  type: 'event' | 'schedule' | 'condition';
  eventName?: string;
  schedule?: ScheduleConfig;
  watchFields?: string[];
}

export interface AutomationAction {
  type: 'workflow' | 'notification' | 'email' | 'webhook' | 'database' | 'script';
  config: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  workflow: Omit<Workflow, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'lastExecutedAt' | 'executionCount'>;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  description?: string;
}

export interface WorkflowMetrics {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageDuration: number;
  successRate: number;
  lastExecution?: Date;
}
