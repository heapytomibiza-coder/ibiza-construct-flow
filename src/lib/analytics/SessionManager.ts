/**
 * Session Manager
 * Phase 22: Advanced Analytics & Monitoring System
 * 
 * Manages user sessions and session-based analytics
 */

import { UserSession } from './types';
import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'analytics_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export class SessionManager {
  private currentSession: UserSession | null = null;
  private lastActivityTime: number = Date.now();
  private activityTimer?: number;

  constructor() {
    this.loadSession();
    this.startActivityMonitor();
    this.setupBeforeUnload();
  }

  private loadSession(): void {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        const now = Date.now();
        
        // Check if session is still valid
        if (now - session.startTime < SESSION_TIMEOUT) {
          this.currentSession = session;
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }

    // Create new session
    this.createNewSession();
  }

  private createNewSession(): void {
    this.currentSession = {
      id: uuidv4(),
      startTime: Date.now(),
      pageViews: 0,
      events: 0,
      entryPage: window.location.pathname,
      deviceInfo: this.getDeviceInfo(),
      referrer: document.referrer,
    };
    this.saveSession();
  }

  private saveSession(): void {
    if (this.currentSession) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.currentSession));
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent;
    const width = window.innerWidth;
    
    let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (width < 768) type = 'mobile';
    else if (width < 1024) type = 'tablet';

    return {
      type,
      os: this.getOS(ua),
      browser: this.getBrowser(ua),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  private getOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private startActivityMonitor(): void {
    this.activityTimer = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivityTime > SESSION_TIMEOUT) {
        this.endSession();
        this.createNewSession();
      }
    }, 60000); // Check every minute

    // Track user activity
    const updateActivity = () => {
      this.lastActivityTime = Date.now();
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  getSession(): UserSession | null {
    return this.currentSession;
  }

  getSessionId(): string {
    return this.currentSession?.id || 'unknown';
  }

  updateSession(updates: Partial<UserSession>): void {
    if (this.currentSession) {
      this.currentSession = {
        ...this.currentSession,
        ...updates,
      };
      this.saveSession();
    }
  }

  incrementPageView(): void {
    if (this.currentSession) {
      this.currentSession.pageViews++;
      this.currentSession.exitPage = window.location.pathname;
      this.saveSession();
    }
  }

  incrementEvent(): void {
    if (this.currentSession) {
      this.currentSession.events++;
      this.saveSession();
    }
  }

  setUserId(userId: string): void {
    if (this.currentSession) {
      this.currentSession.userId = userId;
      this.saveSession();
    }
  }

  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
      this.saveSession();
    }
  }

  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
    this.endSession();
  }
}
