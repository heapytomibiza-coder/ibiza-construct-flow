/**
 * Workflow Manager
 * Phase 28: Advanced Workflow & Automation System
 * 
 * Manages workflow definitions and lifecycle
 */

import { Workflow, WorkflowStatus, WorkflowMetrics } from './types';
import { v4 as uuidv4 } from 'uuid';

export class WorkflowManager {
  private workflows: Map<string, Workflow> = new Map();
  private metrics: Map<string, WorkflowMetrics> = new Map();

  /**
   * Create workflow
   */
  create(
    workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'lastExecutedAt' | 'executionCount'>
  ): Workflow {
    const newWorkflow: Workflow = {
      ...workflow,
      id: uuidv4(),
      createdAt: new Date(),
      executionCount: 0,
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    this.initializeMetrics(newWorkflow.id);

    return newWorkflow;
  }

  /**
   * Get workflow
   */
  get(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get all workflows
   */
  getAll(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflows by status
   */
  getByStatus(status: WorkflowStatus): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.status === status);
  }

  /**
   * Get enabled workflows
   */
  getEnabled(): Workflow[] {
    return Array.from(this.workflows.values()).filter(w => w.enabled);
  }

  /**
   * Update workflow
   */
  update(workflowId: string, updates: Partial<Workflow>): Workflow | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const updated = {
      ...workflow,
      ...updates,
      id: workflow.id, // Prevent ID change
      createdAt: workflow.createdAt, // Prevent creation date change
      updatedAt: new Date(),
      version: workflow.version + 1,
    };

    this.workflows.set(workflowId, updated);
    return updated;
  }

  /**
   * Delete workflow
   */
  delete(workflowId: string): boolean {
    const deleted = this.workflows.delete(workflowId);
    if (deleted) {
      this.metrics.delete(workflowId);
    }
    return deleted;
  }

  /**
   * Enable workflow
   */
  enable(workflowId: string): boolean {
    return this.updateStatus(workflowId, true);
  }

  /**
   * Disable workflow
   */
  disable(workflowId: string): boolean {
    return this.updateStatus(workflowId, false);
  }

  /**
   * Update workflow status
   */
  private updateStatus(workflowId: string, enabled: boolean): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.enabled = enabled;
    workflow.updatedAt = new Date();
    return true;
  }

  /**
   * Activate workflow
   */
  activate(workflowId: string): boolean {
    return this.changeStatus(workflowId, 'active');
  }

  /**
   * Pause workflow
   */
  pause(workflowId: string): boolean {
    return this.changeStatus(workflowId, 'paused');
  }

  /**
   * Archive workflow
   */
  archive(workflowId: string): boolean {
    return this.changeStatus(workflowId, 'archived');
  }

  /**
   * Change workflow status
   */
  private changeStatus(workflowId: string, status: WorkflowStatus): boolean {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = status;
    workflow.updatedAt = new Date();
    return true;
  }

  /**
   * Record execution
   */
  recordExecution(
    workflowId: string,
    success: boolean,
    duration: number
  ): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return;

    workflow.executionCount++;
    workflow.lastExecutedAt = new Date();

    const metrics = this.metrics.get(workflowId);
    if (metrics) {
      metrics.totalExecutions++;
      if (success) {
        metrics.successfulExecutions++;
      } else {
        metrics.failedExecutions++;
      }
      metrics.averageDuration = 
        (metrics.averageDuration * (metrics.totalExecutions - 1) + duration) / 
        metrics.totalExecutions;
      metrics.successRate = 
        (metrics.successfulExecutions / metrics.totalExecutions) * 100;
      metrics.lastExecution = new Date();
    }
  }

  /**
   * Get workflow metrics
   */
  getMetrics(workflowId: string): WorkflowMetrics | undefined {
    return this.metrics.get(workflowId);
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(workflowId: string): void {
    this.metrics.set(workflowId, {
      workflowId,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageDuration: 0,
      successRate: 0,
    });
  }

  /**
   * Duplicate workflow
   */
  duplicate(workflowId: string, name?: string): Workflow | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    return this.create({
      ...workflow,
      name: name || `${workflow.name} (Copy)`,
      status: 'draft',
      enabled: false,
      version: 1,
    });
  }

  /**
   * Export workflow
   */
  export(workflowId: string): string | null {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Import workflow
   */
  import(workflowJson: string): Workflow | null {
    try {
      const workflow = JSON.parse(workflowJson);
      return this.create({
        ...workflow,
        status: 'draft',
        enabled: false,
      });
    } catch (error) {
      console.error('Failed to import workflow:', error);
      return null;
    }
  }

  /**
   * Search workflows
   */
  search(query: string): Workflow[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.workflows.values()).filter(
      w =>
        w.name.toLowerCase().includes(lowerQuery) ||
        w.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear all workflows
   */
  clear(): void {
    this.workflows.clear();
    this.metrics.clear();
  }
}

// Global workflow manager instance
export const workflowManager = new WorkflowManager();
