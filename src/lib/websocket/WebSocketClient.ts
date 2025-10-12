/**
 * WebSocket Client
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Robust WebSocket client with auto-reconnect
 */

import {
  WebSocketOptions,
  WebSocketMessage,
  WebSocketStatus,
  ConnectionStats,
} from './types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private protocols?: string[];
  private reconnect: boolean;
  private reconnectInterval: number;
  private reconnectAttempts: number;
  private maxReconnectAttempts: number;
  private currentReconnectAttempts = 0;
  private heartbeatInterval: number;
  private heartbeatTimer?: number;
  private reconnectTimer?: number;
  
  private status: WebSocketStatus = 'disconnected';
  private listeners = new Map<string, Set<(data: any) => void>>();
  private statusListeners = new Set<(status: WebSocketStatus) => void>();
  private messageQueue: WebSocketMessage[] = [];
  
  private stats: ConnectionStats = {
    status: 'disconnected',
    reconnectAttempts: 0,
    messagesSent: 0,
    messagesReceived: 0,
  };

  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Event) => void;
  private onMessageCallback?: (message: WebSocketMessage) => void;

  constructor(options: WebSocketOptions) {
    this.url = options.url;
    this.protocols = options.protocols;
    this.reconnect = options.reconnect ?? true;
    this.reconnectInterval = options.reconnectInterval ?? 3000;
    this.maxReconnectAttempts = options.reconnectAttempts ?? 5;
    this.heartbeatInterval = options.heartbeatInterval ?? 30000;
    
    this.onOpenCallback = options.onOpen;
    this.onCloseCallback = options.onClose;
    this.onErrorCallback = options.onError;
    this.onMessageCallback = options.onMessage;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url, this.protocols);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setStatus('error');
      this.handleReconnect();
    }
  }

  disconnect(): void {
    this.reconnect = false;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.setStatus('disconnected');
  }

  send<T = any>(type: string, payload: T): void {
    const message: WebSocketMessage<T> = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  subscribe(channel: string, handler: (data: any) => void): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    
    this.listeners.get(channel)!.add(handler);

    // Send subscribe message
    this.send('subscribe', { channel });

    // Return unsubscribe function
    return () => {
      this.listeners.get(channel)?.delete(handler);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
        this.send('unsubscribe', { channel });
      }
    };
  }

  onStatusChange(listener: (status: WebSocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.setStatus('connected');
      this.stats.connectedAt = new Date();
      this.currentReconnectAttempts = 0;
      
      // Process queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.ws?.send(JSON.stringify(message));
        }
      }
      
      this.startHeartbeat();
      this.onOpenCallback?.();
    };

    this.ws.onclose = () => {
      this.setStatus('disconnected');
      this.clearTimers();
      this.onCloseCallback?.();
      
      if (this.reconnect) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.setStatus('error');
      this.onErrorCallback?.(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.stats.messagesReceived++;
        
        // Handle pong for heartbeat
        if (message.type === 'pong') {
          this.stats.latency = Date.now() - message.timestamp;
          return;
        }
        
        // Notify global message callback
        this.onMessageCallback?.(message);
        
        // Notify channel listeners
        const channelListeners = this.listeners.get(message.type);
        if (channelListeners) {
          channelListeners.forEach(handler => handler(message.payload));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    if (typeof window !== 'undefined') {
      this.heartbeatTimer = window.setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send('ping', { timestamp: Date.now() });
        }
      }, this.heartbeatInterval);
    }
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private handleReconnect(): void {
    if (!this.reconnect || this.currentReconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.setStatus('reconnecting');
    this.stats.reconnectAttempts++;
    this.currentReconnectAttempts++;

    if (typeof window !== 'undefined') {
      this.reconnectTimer = window.setTimeout(() => {
        console.log(`Reconnecting... (attempt ${this.currentReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private setStatus(status: WebSocketStatus): void {
    this.status = status;
    this.stats.status = status;
    this.statusListeners.forEach(listener => listener(status));
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
