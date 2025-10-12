/**
 * Editing Indicators Hook
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * React hook for collaborative editing indicators
 */

import { useState, useEffect, useCallback } from 'react';
import { editingIndicators, EditingIndicator } from '@/lib/collaboration';

export function useEditingIndicators(elementId?: string) {
  const [indicators, setIndicators] = useState<EditingIndicator[]>([]);

  useEffect(() => {
    const unsubscribe = editingIndicators.subscribe(allIndicators => {
      if (elementId) {
        setIndicators(allIndicators.filter(i => i.elementId === elementId));
      } else {
        setIndicators(allIndicators);
      }
    });
    return unsubscribe;
  }, [elementId]);

  const startEditing = useCallback(
    (userId: string, userName: string, targetElementId: string, color: string) => {
      editingIndicators.startEditing(userId, userName, targetElementId, color);
    },
    []
  );

  const stopEditing = useCallback((userId: string, targetElementId: string) => {
    editingIndicators.stopEditing(userId, targetElementId);
  }, []);

  const isBeingEdited = useCallback(
    (targetElementId: string) => {
      return editingIndicators.isBeingEdited(targetElementId);
    },
    []
  );

  const getEditingUsers = useCallback(
    (targetElementId: string) => {
      return editingIndicators.getEditingUsers(targetElementId);
    },
    []
  );

  return {
    indicators,
    startEditing,
    stopEditing,
    isBeingEdited,
    getEditingUsers,
  };
}
