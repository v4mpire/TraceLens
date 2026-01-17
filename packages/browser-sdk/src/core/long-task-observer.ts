// Long task detection with minimal overhead
import { LongTask } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';

export class LongTaskObserver {
  private config: SDKConfig;
  private eventBuffer: EventBuffer;
  private observer: PerformanceObserver | null = null;

  constructor(config: SDKConfig, eventBuffer: EventBuffer) {
    this.config = config;
    this.eventBuffer = eventBuffer;
  }

  public start(): void {
    if (!('PerformanceObserver' in window)) {
      if (this.config.debug) {
        console.warn('TraceLens: PerformanceObserver not supported for long tasks');
      }
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        // Process long tasks asynchronously to avoid blocking
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => this.processLongTasks(list.getEntries()));
        } else {
          setTimeout(() => this.processLongTasks(list.getEntries()), 0);
        }
      });

      this.observer.observe({ type: 'longtask', buffered: true });
    } catch (error) {
      if (this.config.debug) {
        console.warn('TraceLens: Long task observer not supported:', error);
      }
    }
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private processLongTasks(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      if (Math.random() <= this.config.sampling) {
        const longTaskData = this.extractLongTaskData(entry as any);
        
        this.eventBuffer.add({
          id: this.generateId(),
          timestamp: Date.now(),
          type: 'long-task',
          data: longTaskData,
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      }
    });
  }

  private extractLongTaskData(entry: any): LongTask {
    const attribution = entry.attribution || [];
    
    return {
      name: entry.name || 'longtask',
      entryType: 'longtask',
      startTime: entry.startTime,
      duration: entry.duration,
      attribution: attribution.map((attr: any) => ({
        name: attr.name || 'unknown',
        entryType: 'taskattribution',
        startTime: attr.startTime || 0,
        duration: attr.duration || 0,
        containerType: attr.containerType || 'unknown',
        containerSrc: attr.containerSrc || '',
        containerId: attr.containerId || '',
        containerName: attr.containerName || ''
      }))
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
