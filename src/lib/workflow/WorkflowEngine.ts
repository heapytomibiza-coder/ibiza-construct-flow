/**
 * Workflow Engine
 * Phase 28: Advanced Workflow & Automation System
 * 
 * Core workflow execution engine
 */

import {
  Workflow,
  WorkflowExecution,
  WorkflowStep,
  StepExecution,
  ExecutionContext,
  ExecutionStatus,
  ExecutionError,
  WorkflowCondition,
} from './types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private actionHandlers: Map<string, ActionHandler> = new Map();
  private executionListeners: Array<(execution: WorkflowExecution) => void> = [];

  /**
   * Execute workflow
   */
  async execute(
    workflow: Workflow,
    triggerData?: any,
    userId?: string
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId: workflow.id,
      status: 'running',
      startedAt: new Date(),
      triggerData,
      context: {
        variables: { ...triggerData },
        metadata: {},
        userId,
        timestamp: new Date(),
      },
      steps: [],
    };

    this.executions.set(execution.id, execution);
    this.notifyListeners(execution);

    try {
      // Execute workflow steps
      await this.executeSteps(workflow.steps, execution);

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
      execution.error = this.formatError(error);
    }

    this.notifyListeners(execution);
    return execution;
  }

  /**
   * Execute workflow steps
   */
  private async executeSteps(
    steps: WorkflowStep[],
    execution: WorkflowExecution
  ): Promise<void> {
    let currentStepId = steps[0]?.id;

    while (currentStepId) {
      const step = steps.find(s => s.id === currentStepId);
      if (!step) break;

      const stepExecution = await this.executeStep(step, execution);
      execution.steps.push(stepExecution);

      // Determine next step
      if (stepExecution.status === 'completed') {
        currentStepId = step.onSuccess || this.getNextStepId(steps, currentStepId);
      } else if (stepExecution.status === 'failed') {
        currentStepId = step.onFailure || undefined;
      } else {
        break;
      }
    }
  }

  /**
   * Execute single step
   */
  private async executeStep(
    step: WorkflowStep,
    execution: WorkflowExecution
  ): Promise<StepExecution> {
    const stepExecution: StepExecution = {
      stepId: step.id,
      status: 'running',
      startedAt: new Date(),
      retryCount: 0,
      input: execution.context.variables,
    };

    try {
      // Check conditions
      if (step.conditions && !this.evaluateConditions(step.conditions, execution.context)) {
        stepExecution.status = 'completed';
        stepExecution.completedAt = new Date();
        stepExecution.output = { skipped: true, reason: 'Conditions not met' };
        return stepExecution;
      }

      // Execute step with timeout
      const output = await this.executeWithTimeout(
        () => this.executeStepAction(step, execution.context),
        step.timeout || 30000
      );

      stepExecution.status = 'completed';
      stepExecution.completedAt = new Date();
      stepExecution.duration = stepExecution.completedAt.getTime() - stepExecution.startedAt.getTime();
      stepExecution.output = output;

      // Update context with output
      if (output && typeof output === 'object') {
        execution.context.variables = { ...execution.context.variables, ...output };
      }
    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.completedAt = new Date();
      stepExecution.duration = stepExecution.completedAt.getTime() - stepExecution.startedAt.getTime();
      stepExecution.error = this.formatError(error);

      // Retry logic
      if (step.retryConfig && stepExecution.retryCount < step.retryConfig.maxAttempts) {
        await this.delay(this.calculateBackoff(step.retryConfig, stepExecution.retryCount));
        stepExecution.retryCount++;
        return this.executeStep(step, execution);
      }

      throw error;
    }

    return stepExecution;
  }

  /**
   * Execute step action
   */
  private async executeStepAction(
    step: WorkflowStep,
    context: ExecutionContext
  ): Promise<any> {
    const handler = this.actionHandlers.get(step.type);
    
    if (!handler) {
      throw new Error(`No handler registered for step type: ${step.type}`);
    }

    return handler(step.config, context);
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Step execution timeout')), timeout)
      ),
    ]);
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    context: ExecutionContext
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, context);

      if (currentOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(
    condition: WorkflowCondition,
    context: ExecutionContext
  ): boolean {
    const value = this.getContextValue(condition.field, context);
    const compareValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return value === compareValue;
      case 'notEquals':
        return value !== compareValue;
      case 'greaterThan':
        return value > compareValue;
      case 'lessThan':
        return value < compareValue;
      case 'greaterThanOrEqual':
        return value >= compareValue;
      case 'lessThanOrEqual':
        return value <= compareValue;
      case 'contains':
        return String(value).includes(String(compareValue));
      case 'notContains':
        return !String(value).includes(String(compareValue));
      case 'startsWith':
        return String(value).startsWith(String(compareValue));
      case 'endsWith':
        return String(value).endsWith(String(compareValue));
      case 'in':
        return Array.isArray(compareValue) && compareValue.includes(value);
      case 'notIn':
        return Array.isArray(compareValue) && !compareValue.includes(value);
      case 'exists':
        return value !== undefined && value !== null;
      case 'notExists':
        return value === undefined || value === null;
      default:
        return false;
    }
  }

  /**
   * Get value from context
   */
  private getContextValue(path: string, context: ExecutionContext): any {
    const parts = path.split('.');
    let value: any = context.variables;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(retryConfig: any, attempt: number): number {
    const delay = retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, retryConfig.maxDelay);
  }

  /**
   * Get next step ID
   */
  private getNextStepId(steps: WorkflowStep[], currentStepId: string): string | undefined {
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    return steps[currentIndex + 1]?.id;
  }

  /**
   * Format error
   */
  private formatError(error: any): ExecutionError {
    return {
      code: error.code || 'EXECUTION_ERROR',
      message: error.message || 'Unknown error',
      details: error.details,
      stack: error.stack,
    };
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Register action handler
   */
  registerHandler(type: string, handler: ActionHandler): void {
    this.actionHandlers.set(type, handler);
  }

  /**
   * Get execution
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get workflow executions
   */
  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(e => e.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  /**
   * Cancel execution
   */
  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
      this.notifyListeners(execution);
      return true;
    }
    return false;
  }

  /**
   * Subscribe to execution updates
   */
  subscribe(listener: (execution: WorkflowExecution) => void): () => void {
    this.executionListeners.push(listener);
    return () => {
      this.executionListeners = this.executionListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(execution: WorkflowExecution): void {
    this.executionListeners.forEach(listener => {
      try {
        listener(execution);
      } catch (error) {
        console.error('Error in workflow listener:', error);
      }
    });
  }

  /**
   * Clear executions
   */
  clearExecutions(): void {
    this.executions.clear();
  }
}

export type ActionHandler = (
  config: Record<string, any>,
  context: ExecutionContext
) => Promise<any>;

// Global workflow engine instance
export const workflowEngine = new WorkflowEngine();
