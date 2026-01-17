export class PerformanceMonitor {
    constructor(config, eventBuffer) {
        this.metrics = {};
        this.observers = [];
        this.config = config;
        this.eventBuffer = eventBuffer;
    }
    start() {
        // Use requestIdleCallback for non-blocking initialization
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.initializeObservers());
        }
        else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => this.initializeObservers(), 0);
        }
    }
    stop() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
    getMetrics() {
        return { ...this.metrics };
    }
    initializeObservers() {
        try {
            this.observeLCP();
            this.observeFID();
            this.observeCLS();
            this.observeFCP();
            this.observeTTFB();
            this.observeINP();
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: Error initializing performance observers:', error);
            }
        }
    }
    observeLCP() {
        if (!('PerformanceObserver' in window))
            return;
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    this.metrics.lcp = {
                        name: 'LCP',
                        value: lastEntry.startTime,
                        rating: this.getRating('LCP', lastEntry.startTime),
                        delta: lastEntry.startTime - (this.metrics.lcp?.value || 0),
                        entries: [lastEntry],
                        id: this.generateMetricId(),
                        navigationType: this.getNavigationType()
                    };
                    this.reportMetric('lcp', this.metrics.lcp);
                }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            this.observers.push(observer);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: LCP observer not supported');
            }
        }
    }
    observeFID() {
        if (!('PerformanceObserver' in window))
            return;
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.processingStart && entry.startTime) {
                        const fidValue = entry.processingStart - entry.startTime;
                        this.metrics.fid = {
                            name: 'FID',
                            value: fidValue,
                            rating: this.getRating('FID', fidValue),
                            delta: fidValue - (this.metrics.fid?.value || 0),
                            entries: [entry],
                            id: this.generateMetricId(),
                            navigationType: this.getNavigationType()
                        };
                        this.reportMetric('fid', this.metrics.fid);
                    }
                });
            });
            observer.observe({ type: 'first-input', buffered: true });
            this.observers.push(observer);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: FID observer not supported');
            }
        }
    }
    observeCLS() {
        if (!('PerformanceObserver' in window))
            return;
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];
        try {
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
                            this.metrics.cls = {
                                name: 'CLS',
                                value: clsValue,
                                rating: this.getRating('CLS', clsValue),
                                delta: clsValue - (this.metrics.cls?.value || 0),
                                entries: [...sessionEntries],
                                id: this.generateMetricId(),
                                navigationType: this.getNavigationType()
                            };
                            this.reportMetric('cls', this.metrics.cls);
                        }
                    }
                });
            });
            observer.observe({ type: 'layout-shift', buffered: true });
            this.observers.push(observer);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: CLS observer not supported');
            }
        }
    }
    observeFCP() {
        if (!('PerformanceObserver' in window))
            return;
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    this.metrics.fcp = {
                        name: 'FCP',
                        value: fcpEntry.startTime,
                        rating: this.getRating('FCP', fcpEntry.startTime),
                        delta: fcpEntry.startTime - (this.metrics.fcp?.value || 0),
                        entries: [fcpEntry],
                        id: this.generateMetricId(),
                        navigationType: this.getNavigationType()
                    };
                    this.reportMetric('fcp', this.metrics.fcp);
                }
            });
            observer.observe({ type: 'paint', buffered: true });
            this.observers.push(observer);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: FCP observer not supported');
            }
        }
    }
    observeTTFB() {
        // TTFB from Navigation Timing API
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry && navigationEntry.responseStart) {
            const ttfbValue = navigationEntry.responseStart;
            this.metrics.ttfb = {
                name: 'TTFB',
                value: ttfbValue,
                rating: this.getRating('TTFB', ttfbValue),
                delta: ttfbValue - (this.metrics.ttfb?.value || 0),
                entries: [navigationEntry],
                id: this.generateMetricId(),
                navigationType: this.getNavigationType()
            };
            this.reportMetric('ttfb', this.metrics.ttfb);
        }
    }
    observeINP() {
        // INP is complex and requires interaction tracking
        // Simplified implementation for now
        if (!('PerformanceObserver' in window))
            return;
        let maxDelay = 0;
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.processingStart && entry.startTime) {
                        const delay = entry.processingStart - entry.startTime;
                        if (delay > maxDelay) {
                            maxDelay = delay;
                            this.metrics.inp = {
                                name: 'INP',
                                value: delay,
                                rating: this.getRating('INP', delay),
                                delta: delay - (this.metrics.inp?.value || 0),
                                entries: [entry],
                                id: this.generateMetricId(),
                                navigationType: this.getNavigationType()
                            };
                            this.reportMetric('inp', this.metrics.inp);
                        }
                    }
                });
            });
            observer.observe({ type: 'event', buffered: true });
            this.observers.push(observer);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: INP observer not supported');
            }
        }
    }
    getRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, poor: 4000 },
            FID: { good: 100, poor: 300 },
            CLS: { good: 0.1, poor: 0.25 },
            FCP: { good: 1800, poor: 3000 },
            TTFB: { good: 800, poor: 1800 },
            INP: { good: 200, poor: 500 }
        };
        const threshold = thresholds[metric];
        if (!threshold)
            return 'good';
        if (value <= threshold.good)
            return 'good';
        if (value <= threshold.poor)
            return 'needs-improvement';
        return 'poor';
    }
    getNavigationType() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        return navigationEntry?.type || 'navigate';
    }
    generateMetricId() {
        return Math.random().toString(36).substring(2, 15);
    }
    reportMetric(type, metric) {
        if (Math.random() > this.config.sampling)
            return;
        this.eventBuffer.add({
            id: this.generateMetricId(),
            timestamp: Date.now(),
            type: 'web-vitals',
            data: { [type]: metric },
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }
}
