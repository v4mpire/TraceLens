import { WebVitalsMetrics } from '@tracelens/shared';
export interface WebVitalsCallback {
    (metric: any): void;
}
export declare class WebVitalsCollector {
    private callbacks;
    private metrics;
    onMetric(callback: WebVitalsCallback): void;
    getMetrics(): WebVitalsMetrics;
    collectCLS(callback?: WebVitalsCallback): void;
    collectLCP(callback?: WebVitalsCallback): void;
    collectFID(callback?: WebVitalsCallback): void;
    private notifyCallbacks;
    private getNavigationType;
    private generateId;
}
//# sourceMappingURL=web-vitals.d.ts.map