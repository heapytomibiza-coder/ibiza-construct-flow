/**
 * Comments Hook
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * React hook for comment management
 */

import { useState, useEffect, useCallback } from 'react';
import { commentManager, Comment } from '@/lib/collaboration';

export function useComments(elementId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const unsubscribe = commentManager.subscribe(allComments => {
      if (elementId) {
        setComments(allComments.filter(c => c.elementId === elementId));
      } else {
        setComments(allComments);
      }
    });
    return unsubscribe;
  }, [elementId]);

  const addComment = useCallback(
    (
      userId: string,
      userName: string,
      content: string,
      options?: {
        userAvatar?: string;
        parentId?: string;
        elementId?: string;
        position?: { x: number; y: number };
        mentions?: string[];
        attachments?: string[];
      }
    ) => {
      return commentManager.addComment(userId, userName, content, {
        ...options,
        elementId: options?.elementId || elementId,
      });
    },
    [elementId]
  );

  const updateComment = useCallback((commentId: string, updates: Partial<Comment>) => {
    commentManager.updateComment(commentId, updates);
  }, []);

  const deleteComment = useCallback((commentId: string) => {
    commentManager.deleteComment(commentId);
  }, []);

  const resolveComment = useCallback((commentId: string) => {
    commentManager.resolveComment(commentId);
  }, []);

  const unresolveComment = useCallback((commentId: string) => {
    commentManager.unresolveComment(commentId);
  }, []);

  return {
    comments,
    unresolvedComments: comments.filter(c => !c.resolved),
    resolvedComments: comments.filter(c => c.resolved),
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    unresolveComment,
    getThreadCount: commentManager.getThreadCount.bind(commentManager),
  };
}
