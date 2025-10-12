/**
 * WebSocket System Types
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Type definitions for WebSocket connections and messaging
 */

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface WebSocketMessage<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  userId?: string;
}

export interface WebSocketOptions {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

export interface SubscriptionOptions {
  channel: string;
  handler: (data: any) => void;
  filter?: (data: any) => boolean;
}

export interface WebSocketSubscription {
  id: string;
  channel: string;
  handler: (data: any) => void;
  unsubscribe: () => void;
}

export interface ConnectionStats {
  status: WebSocketStatus;
  connectedAt?: Date;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  latency?: number;
}

export interface RTCMessage {
  from: string;
  to?: string;
  type: 'broadcast' | 'direct' | 'channel';
  channel?: string;
  data: any;
}
