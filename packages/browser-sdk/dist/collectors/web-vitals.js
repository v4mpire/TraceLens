export class WebVitalsCollector {
    constructor() {
        this.callbacks = [];
        this.metrics = {};
    }
    onMetric(callback) {
        this.callbacks.push(callback);
    }
    getMetrics() {
        return { ...this.metrics };
    }
    collectCLS(callback) {
        if (!('PerformanceObserver' in window))
            return;
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = sessionEntries[0];
                    const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                    if (sessionValue &&
                        entry.startTime - lastSessionEntry.startTime < 1000 &&
                        entry.startTime - firstSessionEntry.startTime < 5000) {
                        sessionValue += entry.value;
                        sessionEntries.push(entry);
                    }
                    else {
                        sessionValue = entry.value;
                        sessionEntries = [entry];
                    }
                    if (sessionValue > clsValue) {
                        clsValue = sessionValue;
                        const metric = {
                            name: 'CLS',
                            value: clsValue,
                            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
                            delta: clsValue - (this.metrics.cls?.value || 0),
                            entries: [...sessionEntries],
                            id: this.generateId(),
                            navigationType: this.getNavigationType()
                        };
                        this.metrics.cls = metric;
                        this.notifyCallbacks(metric);
                        if (callback)
                            callback(metric);
                    }
                }
            });
        });
        try {
            observer.observe({ type: 'layout-shift', buffered: true });
        }
        catch (error) {
            console.warn('CLS observer not supported');
        }
    }
    collectLCP(callback) {
        if (!('PerformanceObserver' in window))
            return;
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
                const metric = {
                    name: 'LCP',
                    value: lastEntry.startTime,
                    rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor',
                    delta: lastEntry.startTime - (this.metrics.lcp?.value || 0),
                    entries: [lastEntry],
                    id: this.generateId(),
                    navigationType: this.getNavigationType()
                };
                this.metrics.lcp = metric;
                this.notifyCallbacks(metric);
                if (callback)
                    callback(metric);
            }
        });
        try {
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
        catch (error) {
            console.warn('LCP observer not supported');
        }
    }
    collectFID(callback) {
        if (!('PerformanceObserver' in window))
            return;
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                if (entry.processingStart && entry.startTime) {
                    const fidValue = entry.processingStart - entry.startTime;
                    const metric = {
                        name: 'FID',
                        value: fidValue,
                        rating: fidValue <= 100 ? 'good' : fidValue <= 300 ? 'needs-improvement' : 'poor',
                        delta: fidValue - (this.metrics.fid?.value || 0),
                        entries: [entry],
                        id: this.generateId(),
                        navigationType: this.getNavigationType()
                    };
                    this.metrics.fid = metric;
                    this.notifyCallbacks(metric);
                    if (callback)
                        callback(metric);
                }
            });
        });
        try {
            observer.observe({ type: 'first-input', buffered: true });
        }
        catch (error) {
            console.warn('FID observer not supported');
        }
    }
    notifyCallbacks(metric) {
        this.callbacks.forEach(callback => {
            try {
                callback(metric);
            }
            catch (error) {
                console.warn('Error in Web Vitals callback:', error);
            }
        });
    }
    getNavigationType() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        return navigationEntry?.type || 'navigate';
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
}
