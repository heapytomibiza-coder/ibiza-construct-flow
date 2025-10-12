/**
 * Event Emitter
 * Phase 20: WebSocket & Real-time Communication
 * 
 * Type-safe event emitter for real-time events
 */

type EventHandler<T = any> = (data: T) => void;

export class EventEmitter {
  private events = new Map<string, Set<EventHandler>>();

  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      handler(data);
      this.off(event, wrappedHandler);
    };

    return this.on(event, wrappedHandler);
  }

  off<T = any>(event: string, handler: EventHandler<T>): void {
    this.events.get(event)?.delete(handler);
  }

  emit<T = any>(event: string, data: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
