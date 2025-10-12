/**
 * Realtime Manager
 * Phase 20: WebSocket & Real-time Communication
 * 
 * High-level manager for real-time features
 */

import { WebSocketClient } from './WebSocketClient';
import { RealtimeChannel } from './RealtimeChannel';
import { EventEmitter } from './EventEmitter';
import { WebSocketStatus } from './types';

export class RealtimeManager {
  private client: WebSocketClient | null = null;
  private channels = new Map<string, RealtimeChannel>();
  private emitter = new EventEmitter();
  private initialized = false;

  initialize(url: string): void {
    if (this.initialized) {
      console.warn('RealtimeManager already initialized');
      return;
    }

    this.client = new WebSocketClient({
      url,
      reconnect: true,
      reconnectInterval: 3000,
      reconnectAttempts: 5,
      heartbeatInterval: 30000,
      onOpen: () => this.emitter.emit('connected', null),
      onClose: () => this.emitter.emit('disconnected', null),
      onError: (error) => this.emitter.emit('error', error),
    });

    this.client.onStatusChange((status) => {
      this.emitter.emit('status', status);
    });

    this.client.connect();
    this.initialized = true;
  }

  channel(name: string): RealtimeChannel {
    if (!this.client) {
      throw new Error('RealtimeManager not initialized');
    }

    if (!this.channels.has(name)) {
      const channel = new RealtimeChannel(this.client, name);
      this.channels.set(name, channel);
    }

    return this.channels.get(name)!;
  }

  send<T = any>(type: string, payload: T): void {
    if (!this.client) {
      throw new Error('RealtimeManager not initialized');
    }
    this.client.send(type, payload);
  }

  on(event: string, handler: (data: any) => void): () => void {
    return this.emitter.on(event, handler);
  }

  getStatus(): WebSocketStatus {
    return this.client?.getStatus() || 'disconnected';
  }

  disconnect(): void {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
    this.client?.disconnect();
    this.emitter.removeAllListeners();
    this.initialized = false;
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();
