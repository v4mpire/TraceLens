// Navigation API integration for timing data
import { NavigationTiming } from '@tracelens/shared';

export class NavigationTimingCollector {
  public collect(): NavigationTiming | null {
    const navigationEntries = performance.getEntriesByType('navigation');
    
    if (navigationEntries.length === 0) {
      return null;
    }

    const entry = navigationEntries[0] as PerformanceNavigationTiming;
    
    return {
      domComplete: entry.domComplete,
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      domContentLoadedEventStart: entry.domContentLoadedEventStart,
      domInteractive: entry.domInteractive,
      loadEventEnd: entry.loadEventEnd,
      loadEventStart: entry.loadEventStart,
      redirectCount: entry.redirectCount,
      type: (entry.type as any) || 'navigate',
      unloadEventEnd: entry.unloadEventEnd,
      unloadEventStart: entry.unloadEventStart
    };
  }

  public collectOnLoad(callback: (timing: NavigationTiming) => void): void {
    if (document.readyState === 'complete') {
      // Page already loaded
      const timing = this.collect();
      if (timing) {
        setTimeout(() => callback(timing), 0);
      }
    } else {
      // Wait for page load
      window.addEventListener('load', () => {
        // Small delay to ensure all timing data is available
        setTimeout(() => {
          const timing = this.collect();
          if (timing) {
            callback(timing);
          }
        }, 100);
      }, { once: true });
    }
  }

  public isSupported(): boolean {
    return 'performance' in window && 
           'getEntriesByType' in performance &&
           performance.getEntriesByType('navigation').length > 0;
  }
}
