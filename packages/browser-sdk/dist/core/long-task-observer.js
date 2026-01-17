export class LongTaskObserver {
    constructor(config, eventBuffer) {
        this.observer = null;
        this.config = config;
        this.eventBuffer = eventBuffer;
    }
    start() {
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
                }
                else {
                    setTimeout(() => this.processLongTasks(list.getEntries()), 0);
                }
            });
            this.observer.observe({ type: 'longtask', buffered: true });
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: Long task observer not supported:', error);
            }
        }
    }
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
    processLongTasks(entries) {
        entries.forEach(entry => {
            if (Math.random() <= this.config.sampling) {
                const longTaskData = this.extractLongTaskData(entry);
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
    extractLongTaskData(entry) {
        const attribution = entry.attribution || [];
        return {
            name: entry.name || 'longtask',
            entryType: 'longtask',
            startTime: entry.startTime,
            duration: entry.duration,
            attribution: attribution.map((attr) => ({
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
    generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
}
