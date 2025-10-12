/**
 * Automation Engine
 * Phase 28: Advanced Workflow & Automation System
 * 
 * Manages automation rules and triggers
 */

import { AutomationRule, WorkflowCondition, AutomationAction } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();
  private eventListeners: Map<string, Set<string>> = new Map();
  private actionHandlers: Map<string, AutomationActionHandler> = new Map();

  /**
   * Create automation rule
   */
  createRule(
    rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'executionCount'>
  ): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date(),
      executionCount: 0,
    };

    this.rules.set(newRule.id, newRule);
    this.registerRuleTrigger(newRule);

    return newRule;
  }

  /**
   * Get rule
   */
  getRule(ruleId: string): AutomationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): AutomationRule[] {
    return Array.from(this.rules.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get enabled rules
   */
  getEnabledRules(): AutomationRule[] {
    return Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update rule
   */
  updateRule(ruleId: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updated = {
      ...rule,
      ...updates,
      id: rule.id,
      createdAt: rule.createdAt,
      updatedAt: new Date(),
    };

    this.rules.set(ruleId, updated);
    this.registerRuleTrigger(updated);

    return updated;
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    this.unregisterRuleTrigger(rule);
    return this.rules.delete(ruleId);
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = true;
    rule.updatedAt = new Date();
    return true;
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    rule.enabled = false;
    rule.updatedAt = new Date();
    return true;
  }

  /**
   * Process event
   */
  async processEvent(eventName: string, data: any): Promise<void> {
    const ruleIds = this.eventListeners.get(eventName);
    if (!ruleIds) return;

    const rules = Array.from(ruleIds)
      .map(id => this.rules.get(id))
      .filter((rule): rule is AutomationRule => 
        rule !== undefined && rule.enabled
      )
      .sort((a, b) => b.priority - a.priority);

    for (const rule of rules) {
      try {
        if (this.evaluateConditions(rule.conditions, data)) {
          await this.executeActions(rule.actions, data);
          rule.executionCount++;
          rule.updatedAt = new Date();
        }
      } catch (error) {
        console.error(`Failed to execute automation rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    data: any
  ): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, data);

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
  private evaluateCondition(condition: WorkflowCondition, data: any): boolean {
    const value = this.getFieldValue(data, condition.field);
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
   * Execute actions
   */
  private async executeActions(
    actions: AutomationAction[],
    data: any
  ): Promise<void> {
    for (const action of actions) {
      const handler = this.actionHandlers.get(action.type);
      if (handler) {
        try {
          await handler(action.config, data);
        } catch (error) {
          console.error(`Failed to execute action ${action.type}:`, error);
        }
      }
    }
  }

  /**
   * Get field value
   */
  private getFieldValue(data: any, field: string): any {
    const parts = field.split('.');
    let value = data;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * Register rule trigger
   */
  private registerRuleTrigger(rule: AutomationRule): void {
    if (rule.trigger.type === 'event' && rule.trigger.eventName) {
      if (!this.eventListeners.has(rule.trigger.eventName)) {
        this.eventListeners.set(rule.trigger.eventName, new Set());
      }
      this.eventListeners.get(rule.trigger.eventName)!.add(rule.id);
    }
  }

  /**
   * Unregister rule trigger
   */
  private unregisterRuleTrigger(rule: AutomationRule): void {
    if (rule.trigger.type === 'event' && rule.trigger.eventName) {
      const listeners = this.eventListeners.get(rule.trigger.eventName);
      if (listeners) {
        listeners.delete(rule.id);
        if (listeners.size === 0) {
          this.eventListeners.delete(rule.trigger.eventName);
        }
      }
    }
  }

  /**
   * Register action handler
   */
  registerActionHandler(type: string, handler: AutomationActionHandler): void {
    this.actionHandlers.set(type, handler);
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.rules.clear();
    this.eventListeners.clear();
  }
}

export type AutomationActionHandler = (
  config: Record<string, any>,
  data: any
) => Promise<void>;

// Global automation engine instance
export const automationEngine = new AutomationEngine();
