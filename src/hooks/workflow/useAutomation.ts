/**
 * Automation Hook
 * Phase 28: Advanced Workflow & Automation System
 * 
 * Hook for managing automation rules
 */

import { useState, useCallback } from 'react';
import { AutomationRule } from '@/lib/workflow/types';
import { automationEngine } from '@/lib/workflow';

export function useAutomation() {
  const [rules, setRules] = useState<AutomationRule[]>([]);

  // Load rules
  const loadRules = useCallback(() => {
    const allRules = automationEngine.getAllRules();
    setRules(allRules);
  }, []);

  // Create rule
  const createRule = useCallback((
    rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>
  ) => {
    const newRule = automationEngine.createRule(rule);
    loadRules();
    return newRule;
  }, [loadRules]);

  // Update rule
  const updateRule = useCallback((
    ruleId: string,
    updates: Partial<AutomationRule>
  ) => {
    const updated = automationEngine.updateRule(ruleId, updates);
    if (updated) {
      loadRules();
    }
    return updated;
  }, [loadRules]);

  // Delete rule
  const deleteRule = useCallback((ruleId: string) => {
    const deleted = automationEngine.deleteRule(ruleId);
    if (deleted) {
      loadRules();
    }
    return deleted;
  }, [loadRules]);

  // Toggle rule
  const toggleRule = useCallback((ruleId: string, enabled: boolean) => {
    const result = enabled
      ? automationEngine.enableRule(ruleId)
      : automationEngine.disableRule(ruleId);
    
    if (result) {
      loadRules();
    }
    return result;
  }, [loadRules]);

  // Process event
  const processEvent = useCallback(async (
    eventName: string,
    data: any
  ) => {
    await automationEngine.processEvent(eventName, data);
  }, []);

  return {
    rules,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    processEvent,
  };
}
