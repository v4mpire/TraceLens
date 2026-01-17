// JavaScript error capture with minimal overhead
import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';

export class ErrorTracker {
  private config: SDKConfig;
  private eventBuffer: EventBuffer;
  private originalErrorHandler: OnErrorEventHandler | null = null;
  private originalUnhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  constructor(config: SDKConfig, eventBuffer: EventBuffer) {
    this.config = config;
    this.eventBuffer = eventBuffer;
  }

  public start(): void {
    // Capture JavaScript errors
    this.originalErrorHandler = window.onerror;
    window.onerror = (message, filename, lineno, colno, error) => {
      // Process error asynchronously to avoid blocking
      setTimeout(() => {
        this.handleError({
          type: 'javascript-error',
          message: String(message),
          filename: filename || '',
          lineno: lineno || 0,
          colno: colno || 0,
          stack: error?.stack || '',
          error: error
        });
      }, 0);

      // Call original handler if it exists
      if (this.originalErrorHandler) {
        return this.originalErrorHandler(message, filename, lineno, colno, error);
      }
      return false;
    };

    // Capture unhandled promise rejections
    this.originalUnhandledRejectionHandler = window.onunhandledrejection;
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      // Process rejection asynchronously
      setTimeout(() => {
        this.handleError({
          type: 'unhandled-promise-rejection',
          message: String(event.reason),
          filename: '',
          lineno: 0,
          colno: 0,
          stack: event.reason?.stack || '',
          error: event.reason
        });
      }, 0);

      // Call original handler if it exists
      if (this.originalUnhandledRejectionHandler) {
        this.originalUnhandledRejectionHandler(event);
      }
    };
  }

  public stop(): void {
    // Restore original handlers
    if (this.originalErrorHandler) {
      window.onerror = this.originalErrorHandler;
      this.originalErrorHandler = null;
    } else {
      window.onerror = null;
    }

    if (this.originalUnhandledRejectionHandler) {
      window.onunhandledrejection = this.originalUnhandledRejectionHandler;
      this.originalUnhandledRejectionHandler = null;
    } else {
      window.onunhandledrejection = null;
    }
  }

  private handleError(errorData: {
    type: string;
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    stack: string;
    error?: Error | undefined;
  }): void {
    if (Math.random() > this.config.sampling) return;

    try {
      const errorEvent = {
        id: this.generateId(),
        timestamp: Date.now(),
        type: errorData.type,
        message: errorData.message,
        source: 'browser' as const,
        projectId: this.config.projectKey,
        stack: errorData.stack,
        filename: errorData.filename,
        lineno: errorData.lineno,
        colno: errorData.colno,
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: this.determineSeverity(errorData),
        tags: {
          errorType: errorData.type,
          hasStack: Boolean(errorData.stack)
        },
        context: {
          environment: 'production',
          version: '0.1.0'
        }
      };

      this.eventBuffer.add({
        id: errorEvent.id,
        timestamp: errorEvent.timestamp,
        type: 'error' as any, // Cast to any to allow error type
        data: errorEvent as any,
        url: errorEvent.url,
        userAgent: errorEvent.userAgent
      });
    } catch (error) {
      // Silently fail to avoid infinite error loops
      if (this.config.debug) {
        console.warn('TraceLens: Error while tracking error:', error);
      }
    }
  }

  private determineSeverity(errorData: { message: string; stack: string }): 'low' | 'medium' | 'high' | 'critical' {
    const message = errorData.message.toLowerCase();
    
    // Critical errors
    if (message.includes('script error') || 
        message.includes('network error') ||
        message.includes('out of memory')) {
      return 'critical';
    }
    
    // High severity errors
    if (message.includes('reference error') ||
        message.includes('type error') ||
        message.includes('syntax error')) {
      return 'high';
    }
    
    // Medium severity errors
    if (errorData.stack && errorData.stack.length > 0) {
      return 'medium';
    }
    
    // Low severity by default
    return 'low';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
