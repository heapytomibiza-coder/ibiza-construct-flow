/**
 * Workflow Hook
 * Phase 28: Advanced Workflow & Automation System
 * 
 * Hook for managing workflows
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Workflow,
  WorkflowExecution,
  WorkflowStatus,
  WorkflowMetrics,
} from '@/lib/workflow/types';
import { workflowManager, workflowEngine } from '@/lib/workflow';

export function useWorkflow() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);

  // Load workflows
  const loadWorkflows = useCallback(() => {
    const allWorkflows = workflowManager.getAll();
    setWorkflows(allWorkflows);
  }, []);

  // Create workflow
  const createWorkflow = useCallback((
    workflow: Omit<Workflow, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'lastExecutedAt' | 'executionCount'>
  ) => {
    if (!user?.id) return null;

    const newWorkflow = workflowManager.create({
      ...workflow,
      createdBy: user.id,
    });
    
    loadWorkflows();
    return newWorkflow;
  }, [user?.id, loadWorkflows]);

  // Update workflow
  const updateWorkflow = useCallback((
    workflowId: string,
    updates: Partial<Workflow>
  ) => {
    const updated = workflowManager.update(workflowId, updates);
    if (updated) {
      loadWorkflows();
    }
    return updated;
  }, [loadWorkflows]);

  // Delete workflow
  const deleteWorkflow = useCallback((workflowId: string) => {
    const deleted = workflowManager.delete(workflowId);
    if (deleted) {
      loadWorkflows();
    }
    return deleted;
  }, [loadWorkflows]);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    workflowId: string,
    triggerData?: any
  ): Promise<WorkflowExecution | null> => {
    const workflow = workflowManager.get(workflowId);
    if (!workflow) return null;

    setLoading(true);
    try {
      const execution = await workflowEngine.execute(
        workflow,
        triggerData,
        user?.id
      );

      // Record execution
      workflowManager.recordExecution(
        workflowId,
        execution.status === 'completed',
        execution.duration || 0
      );

      loadWorkflows();
      return execution;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadWorkflows]);

  // Enable/disable workflow
  const toggleWorkflow = useCallback((workflowId: string, enabled: boolean) => {
    const result = enabled
      ? workflowManager.enable(workflowId)
      : workflowManager.disable(workflowId);
    
    if (result) {
      loadWorkflows();
    }
    return result;
  }, [loadWorkflows]);

  // Change workflow status
  const changeStatus = useCallback((
    workflowId: string,
    status: 'active' | 'paused' | 'archived'
  ) => {
    let result = false;
    
    if (status === 'active') {
      result = workflowManager.activate(workflowId);
    } else if (status === 'paused') {
      result = workflowManager.pause(workflowId);
    } else {
      result = workflowManager.archive(workflowId);
    }

    if (result) {
      loadWorkflows();
    }
    return result;
  }, [loadWorkflows]);

  // Get workflow metrics
  const getMetrics = useCallback((
    workflowId: string
  ): WorkflowMetrics | undefined => {
    return workflowManager.getMetrics(workflowId);
  }, []);

  // Duplicate workflow
  const duplicateWorkflow = useCallback((
    workflowId: string,
    name?: string
  ) => {
    const duplicated = workflowManager.duplicate(workflowId, name);
    if (duplicated) {
      loadWorkflows();
    }
    return duplicated;
  }, [loadWorkflows]);

  return {
    workflows,
    loading,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    toggleWorkflow,
    changeStatus,
    getMetrics,
    duplicateWorkflow,
  };
}
