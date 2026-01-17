// Core Web Vitals implementation with optimized collection
import { WebVitalsMetrics, CLSMetric, FIDMetric, LCPMetric } from '@tracelens/shared';

export interface WebVitalsCallback {
  (metric: any): void;
}

export class WebVitalsCollector {
  private callbacks: WebVitalsCallback[] = [];
  private metrics: WebVitalsMetrics = {};

  public onMetric(callback: WebVitalsCallback): void {
    this.callbacks.push(callback);
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  public collectCLS(callback?: WebVitalsCallback): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          if (sessionValue && 
              entry.startTime - lastSessionEntry.startTime < 1000 &&
              entry.startTime - firstSessionEntry.startTime < 5000) {
            sessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            sessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue;
            
            const metric: CLSMetric = {
              name: 'CLS' as const,
              value: clsValue,
              rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
              delta: clsValue - (this.metrics.cls?.value || 0),
              entries: [...sessionEntries],
              id: this.generateId(),
              navigationType: this.getNavigationType()
            };
            
            this.metrics.cls = metric;
            this.notifyCallbacks(metric);
            if (callback) callback(metric);
          }
        }
      });
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.warn('CLS observer not supported');
    }
  }

  public collectLCP(callback?: WebVitalsCallback): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        const metric: LCPMetric = {
          name: 'LCP' as const,
          value: lastEntry.startTime,
          rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor',
          delta: lastEntry.startTime - (this.metrics.lcp?.value || 0),
          entries: [lastEntry],
          id: this.generateId(),
          navigationType: this.getNavigationType()
        };
        
        this.metrics.lcp = metric;
        this.notifyCallbacks(metric);
        if (callback) callback(metric);
      }
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.warn('LCP observer not supported');
    }
  }

  public collectFID(callback?: WebVitalsCallback): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fidValue = entry.processingStart - entry.startTime;
          
          const metric: FIDMetric = {
            name: 'FID' as const,
            value: fidValue,
            rating: fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs-improvement' : 'poor',
            delta: fidValue - (this.metrics.fid?.value || 0),
            entries: [entry],
            id: this.generateId(),
            navigationType: this.getNavigationType()
          };
          
          this.metrics.fid = metric;
          this.notifyCallbacks(metric);
          if (callback) callback(metric);
        }
      });
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
    } catch (error) {
      console.warn('FID observer not supported');
    }
  }

  private notifyCallbacks(metric: any): void {
    this.callbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.warn('Error in Web Vitals callback:', error);
      }
    });
  }

  private getNavigationType(): 'navigate' | 'reload' | 'back-forward' | 'prerender' {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
    return navigationEntry?.type || 'navigate';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
