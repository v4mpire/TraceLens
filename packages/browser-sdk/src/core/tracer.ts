// Main TraceLens Browser SDK class with <1ms overhead requirement
import { WebVitalsMetrics, PerformanceEvent } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
import { PerformanceMonitor } from './performance-monitor';
import { ResourceTiming } from './resource-timing';
import { LongTaskObserver } from './long-task-observer';
import { ErrorTracker } from './error-tracker';
import { EventBuffer } from '../batching/event-buffer';

export class TraceLensSDK {
  private config: SDKConfig;
  private performanceMonitor: PerformanceMonitor;
  private resourceTiming: ResourceTiming;
  private longTaskObserver: LongTaskObserver;
  private errorTracker: ErrorTracker;
  private eventBuffer: EventBuffer;
  private initialized = false;

  constructor(config: Partial<SDKConfig> = {}) {
    const startTime = performance.now();
    
    this.config = {
      projectKey: config.projectKey || '',
      endpoint: config.endpoint || 'https://api.tracelens.dev/events',
      sampling: config.sampling || 1.0,
      bufferSize: config.bufferSize || 100,
      flushInterval: config.flushInterval || 5000,
      enableWebVitals: config.enableWebVitals !== false,
      enableResourceTiming: config.enableResourceTiming !== false,
      enableLongTasks: config.enableLongTasks !== false,
      enableErrorTracking: config.enableErrorTracking !== false,
      debug: config.debug || false
    };

    // Initialize components with minimal overhead
    this.eventBuffer = new EventBuffer(this.config);
    this.performanceMonitor = new PerformanceMonitor(this.config, this.eventBuffer);
    this.resourceTiming = new ResourceTiming(this.config, this.eventBuffer);
    this.longTaskObserver = new LongTaskObserver(this.config, this.eventBuffer);
    this.errorTracker = new ErrorTracker(this.config, this.eventBuffer);

    const initTime = performance.now() - startTime;
    if (this.config.debug && initTime > 1) {
      console.warn(`TraceLens SDK initialization took ${initTime.toFixed(2)}ms (target: <1ms)`);
    }
  }

  public start(): void {
    if (this.initialized) return;

    const startTime = performance.now();

    // Start monitoring with minimal overhead
    if (this.config.enableWebVitals) {
      this.performanceMonitor.start();
    }
    
    if (this.config.enableResourceTiming) {
      this.resourceTiming.start();
    }
    
    if (this.config.enableLongTasks) {
      this.longTaskObserver.start();
    }
    
    if (this.config.enableErrorTracking) {
      this.errorTracker.start();
    }

    this.initialized = true;

    const startupTime = performance.now() - startTime;
    if (this.config.debug && startupTime > 1) {
      console.warn(`TraceLens SDK startup took ${startupTime.toFixed(2)}ms (target: <1ms)`);
    }
  }

  public stop(): void {
    if (!this.initialized) return;

    this.performanceMonitor.stop();
    this.resourceTiming.stop();
    this.longTaskObserver.stop();
    this.errorTracker.stop();
    this.eventBuffer.flush();

    this.initialized = false;
  }

  public track(eventType: string, data: Record<string, unknown>): void {
    if (!this.initialized) return;

    const event: PerformanceEvent = {
      id: this.generateId(),
      timestamp: Date.now(),
      type: eventType as any,
      data: data as any,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.eventBuffer.add(event);
  }

  public getMetrics(): WebVitalsMetrics | null {
    return this.performanceMonitor.getMetrics();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
