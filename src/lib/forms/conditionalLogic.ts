/**
 * Conditional Logic Engine
 * Phase 19: Form Builder & Validation System
 * 
 * Evaluates conditional field visibility and behavior
 */

import { ConditionalLogic, ConditionalOperator, FormValues } from './types';

export class ConditionalLogicEngine {
  evaluateCondition(
    logic: ConditionalLogic,
    values: FormValues
  ): boolean {
    const fieldValue = values[logic.field];
    return this.compareValues(fieldValue, logic.operator, logic.value);
  }

  shouldShow(
    logic: ConditionalLogic | undefined,
    values: FormValues
  ): boolean {
    if (!logic) return true;

    const conditionMet = this.evaluateCondition(logic, values);

    if (logic.action === 'show') {
      return conditionMet;
    } else if (logic.action === 'hide') {
      return !conditionMet;
    }

    return true;
  }

  shouldEnable(
    logic: ConditionalLogic | undefined,
    values: FormValues
  ): boolean {
    if (!logic) return true;

    const conditionMet = this.evaluateCondition(logic, values);

    if (logic.action === 'enable') {
      return conditionMet;
    } else if (logic.action === 'disable') {
      return !conditionMet;
    }

    return true;
  }

  shouldRequire(
    logic: ConditionalLogic | undefined,
    values: FormValues
  ): boolean {
    if (!logic || logic.action !== 'require') return false;
    return this.evaluateCondition(logic, values);
  }

  private compareValues(
    fieldValue: any,
    operator: ConditionalOperator,
    targetValue: any
  ): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue;

      case 'notEquals':
        return fieldValue !== targetValue;

      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(targetValue);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(targetValue);
        }
        return false;

      case 'greaterThan':
        return fieldValue > targetValue;

      case 'lessThan':
        return fieldValue < targetValue;

      case 'isEmpty':
        return (
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === '' ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)
        );

      case 'isNotEmpty':
        return !(
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === '' ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)
        );

      default:
        return false;
    }
  }
}

export const conditionalLogic = new ConditionalLogicEngine();
