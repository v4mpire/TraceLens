import { WebVitalsMetrics } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';
export declare class PerformanceMonitor {
    private config;
    private eventBuffer;
    private metrics;
    private observers;
    constructor(config: SDKConfig, eventBuffer: EventBuffer);
    start(): void;
    stop(): void;
    getMetrics(): WebVitalsMetrics;
    private initializeObservers;
    private observeLCP;
    private observeFID;
    private observeCLS;
    private observeFCP;
    private observeTTFB;
    private observeINP;
    private getRating;
    private getNavigationType;
    private generateMetricId;
    private reportMetric;
}
//# sourceMappingURL=performance-monitor.d.ts.map