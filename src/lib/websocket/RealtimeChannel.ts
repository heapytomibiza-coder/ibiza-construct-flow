/**
 * Realtime Channel
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Manages channel-based pub/sub messaging
 */

import { EventEmitter } from './EventEmitter';
import { WebSocketClient } from './WebSocketClient';

export class RealtimeChannel {
  private emitter = new EventEmitter();
  private client: WebSocketClient;
  private channel: string;
  private subscribed = false;

  constructor(client: WebSocketClient, channel: string) {
    this.client = client;
    this.channel = channel;
  }

  subscribe(): this {
    if (!this.subscribed) {
      this.client.subscribe(this.channel, (data) => {
        this.emitter.emit('message', data);
      });
      this.subscribed = true;
    }
    return this;
  }

  on(event: string, handler: (data: any) => void): this {
    this.emitter.on(event, handler);
    return this;
  }

  send<T = any>(event: string, payload: T): void {
    this.client.send('channel_message', {
      channel: this.channel,
      event,
      payload,
    });
  }

  unsubscribe(): void {
    this.emitter.removeAllListeners();
    this.subscribed = false;
  }
}
