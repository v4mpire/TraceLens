import { WebVitalsMetrics } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
export declare class TraceLensSDK {
    private config;
    private performanceMonitor;
    private resourceTiming;
    private longTaskObserver;
    private errorTracker;
    private eventBuffer;
    private initialized;
    constructor(config?: Partial<SDKConfig>);
    start(): void;
    stop(): void;
    track(eventType: string, data: Record<string, unknown>): void;
    getMetrics(): WebVitalsMetrics | null;
    private generateId;
}
//# sourceMappingURL=tracer.d.ts.map