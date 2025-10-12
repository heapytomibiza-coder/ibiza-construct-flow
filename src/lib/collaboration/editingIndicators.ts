/**
 * Editing Indicators Manager
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Manages collaborative editing indicators
 */

import { EditingIndicator } from './types';

const INDICATOR_TIMEOUT = 3000; // 3 seconds

class EditingIndicatorsManager {
  private indicators = new Map<string, EditingIndicator>();
  private listeners = new Set<(indicators: EditingIndicator[]) => void>();

  startEditing(userId: string, userName: string, elementId: string, color: string): void {
    const key = `${userId}_${elementId}`;
    
    this.indicators.set(key, {
      userId,
      userName,
      elementId,
      color,
      timestamp: new Date(),
    });

    this.notifyListeners();

    // Auto-clear after timeout
    setTimeout(() => {
      this.stopEditing(userId, elementId);
    }, INDICATOR_TIMEOUT);
  }

  stopEditing(userId: string, elementId: string): void {
    const key = `${userId}_${elementId}`;
    this.indicators.delete(key);
    this.notifyListeners();
  }

  getIndicators(): EditingIndicator[] {
    return Array.from(this.indicators.values());
  }

  getIndicatorsByElement(elementId: string): EditingIndicator[] {
    return this.getIndicators().filter(i => i.elementId === elementId);
  }

  isBeingEdited(elementId: string): boolean {
    return this.getIndicatorsByElement(elementId).length > 0;
  }

  getEditingUsers(elementId: string): string[] {
    return this.getIndicatorsByElement(elementId).map(i => i.userName);
  }

  subscribe(listener: (indicators: EditingIndicator[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getIndicators());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const indicators = this.getIndicators();
    this.listeners.forEach(listener => listener(indicators));
  }

  cleanup(): void {
    this.indicators.clear();
    this.listeners.clear();
  }
}

export const editingIndicators = new EditingIndicatorsManager();
