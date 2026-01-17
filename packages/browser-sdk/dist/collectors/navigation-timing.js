export class NavigationTimingCollector {
    collect() {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length === 0) {
            return null;
        }
        const entry = navigationEntries[0];
        return {
            domComplete: entry.domComplete,
            domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
            domContentLoadedEventStart: entry.domContentLoadedEventStart,
            domInteractive: entry.domInteractive,
            loadEventEnd: entry.loadEventEnd,
            loadEventStart: entry.loadEventStart,
            redirectCount: entry.redirectCount,
            type: entry.type || 'navigate',
            unloadEventEnd: entry.unloadEventEnd,
            unloadEventStart: entry.unloadEventStart
        };
    }
    collectOnLoad(callback) {
        if (document.readyState === 'complete') {
            // Page already loaded
            const timing = this.collect();
            if (timing) {
                setTimeout(() => callback(timing), 0);
            }
        }
        else {
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
    isSupported() {
        return 'performance' in window &&
            'getEntriesByType' in performance &&
            performance.getEntriesByType('navigation').length > 0;
    }
}
