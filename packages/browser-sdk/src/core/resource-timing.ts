// Resource timing capture with minimal overhead
import { ResourceTiming as ResourceTimingType } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';

export class ResourceTiming {
  private config: SDKConfig;
  private eventBuffer: EventBuffer;
  private observer: PerformanceObserver | null = null;
  private processedResources = new Set<string>();

  constructor(config: SDKConfig, eventBuffer: EventBuffer) {
    this.config = config;
    this.eventBuffer = eventBuffer;
  }

  public start(): void {
    if (!('PerformanceObserver' in window)) {
      if (this.config.debug) {
        console.warn('TraceLens: PerformanceObserver not supported for resource timing');
      }
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        // Use requestIdleCallback to avoid blocking main thread
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => this.processEntries(list.getEntries()));
        } else {
          setTimeout(() => this.processEntries(list.getEntries()), 0);
        }
      });

      this.observer.observe({ type: 'resource', buffered: true });
    } catch (error) {
      if (this.config.debug) {
        console.warn('TraceLens: Error starting resource timing observer:', error);
      }
    }
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.processedResources.clear();
  }

  private processEntries(entries: PerformanceEntry[]): void {
    const resourceEntries = entries.filter(entry => 
      entry.entryType === 'resource' && 
      !this.processedResources.has(entry.name)
    );

    resourceEntries.forEach(entry => {
      this.processedResources.add(entry.name);
      
      if (Math.random() <= this.config.sampling) {
        const resourceData = this.extractResourceData(entry as PerformanceResourceTiming);
        
        this.eventBuffer.add({
          id: this.generateId(),
          timestamp: Date.now(),
          type: 'resource-timing',
          data: resourceData,
          url: window.location.href,
          userAgent: navigator.userAgent
        });
      }
    });
  }

  private extractResourceData(entry: PerformanceResourceTiming): ResourceTimingType {
    return {
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      initiatorType: entry.initiatorType || 'unknown',
      nextHopProtocol: (entry as any).nextHopProtocol || 'unknown',
      renderBlockingStatus: (entry as any).renderBlockingStatus || 'unknown',
      responseStatus: (entry as any).responseStatus || 0,
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      responseStart: entry.responseStart || 0,
      responseEnd: entry.responseEnd || 0
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
