/**
 * Collaboration System Types
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Type definitions for presence, activity, and collaboration
 */

export interface PresenceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  lastSeen: Date;
  status: UserStatus;
}

export interface CursorPosition {
  x: number;
  y: number;
  elementId?: string;
}

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ActivityType;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  resourceId?: string;
  resourceType?: string;
}

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'comment'
  | 'share'
  | 'join'
  | 'leave';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions?: string[];
  attachments?: string[];
  parentId?: string;
  replies?: Comment[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  elementId?: string;
  position?: { x: number; y: number };
}

export interface CollaborationSession {
  id: string;
  resourceId: string;
  resourceType: string;
  users: PresenceUser[];
  startedAt: Date;
  lastActivity: Date;
}

export interface EditingIndicator {
  userId: string;
  userName: string;
  elementId: string;
  color: string;
  timestamp: Date;
}
