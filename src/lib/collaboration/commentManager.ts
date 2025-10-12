/**
 * Comment Manager
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Manages comments and threads
 */

import { Comment } from './types';

class CommentManager {
  private comments = new Map<string, Comment>();
  private listeners = new Set<(comments: Comment[]) => void>();

  addComment(
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
  ): Comment {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      userId,
      userName,
      userAvatar: options?.userAvatar,
      content,
      mentions: options?.mentions,
      attachments: options?.attachments,
      parentId: options?.parentId,
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      elementId: options?.elementId,
      position: options?.position,
    };

    this.comments.set(comment.id, comment);

    // Add to parent's replies if it's a reply
    if (options?.parentId) {
      const parent = this.comments.get(options.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      }
    }

    this.notifyListeners();
    return comment;
  }

  updateComment(commentId: string, updates: Partial<Comment>): void {
    const comment = this.comments.get(commentId);
    if (comment) {
      this.comments.set(commentId, {
        ...comment,
        ...updates,
        updatedAt: new Date(),
      });
      this.notifyListeners();
    }
  }

  deleteComment(commentId: string): void {
    const comment = this.comments.get(commentId);
    if (comment) {
      // Remove from parent's replies if it's a reply
      if (comment.parentId) {
        const parent = this.comments.get(comment.parentId);
        if (parent && parent.replies) {
          parent.replies = parent.replies.filter(r => r.id !== commentId);
        }
      }

      // Delete all replies recursively
      if (comment.replies) {
        comment.replies.forEach(reply => this.deleteComment(reply.id));
      }

      this.comments.delete(commentId);
      this.notifyListeners();
    }
  }

  resolveComment(commentId: string): void {
    this.updateComment(commentId, { resolved: true });
  }

  unresolveComment(commentId: string): void {
    this.updateComment(commentId, { resolved: false });
  }

  getComments(): Comment[] {
    return Array.from(this.comments.values()).filter(c => !c.parentId);
  }

  getComment(commentId: string): Comment | undefined {
    return this.comments.get(commentId);
  }

  getCommentsByElement(elementId: string): Comment[] {
    return this.getComments().filter(c => c.elementId === elementId);
  }

  getCommentsByUser(userId: string): Comment[] {
    return this.getComments().filter(c => c.userId === userId);
  }

  getUnresolvedComments(): Comment[] {
    return this.getComments().filter(c => !c.resolved);
  }

  getThreadCount(commentId: string): number {
    const comment = this.comments.get(commentId);
    return comment?.replies?.length || 0;
  }

  subscribe(listener: (comments: Comment[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getComments());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const comments = this.getComments();
    this.listeners.forEach(listener => listener(comments));
  }

  clearComments(): void {
    this.comments.clear();
    this.notifyListeners();
  }
}

export const commentManager = new CommentManager();
