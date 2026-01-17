export interface WebVitalsMetrics {
    cls?: CLSMetric;
    fid?: FIDMetric;
    lcp?: LCPMetric;
    fcp?: FCPMetric;
    ttfb?: TTFBMetric;
    inp?: INPMetric;
}
export interface BaseMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: unknown[];
    id: string;
    navigationType: NavigationType;
}
export interface CLSMetric extends BaseMetric {
    name: 'CLS';
    entries: unknown[];
}
export interface FIDMetric extends BaseMetric {
    name: 'FID';
    entries: unknown[];
}
export interface LCPMetric extends BaseMetric {
    name: 'LCP';
    entries: unknown[];
}
export interface FCPMetric extends BaseMetric {
    name: 'FCP';
    entries: unknown[];
}
export interface TTFBMetric extends BaseMetric {
    name: 'TTFB';
    entries: unknown[];
}
export interface INPMetric extends BaseMetric {
    name: 'INP';
    entries: unknown[];
}
export type NavigationType = 'navigate' | 'reload' | 'back-forward' | 'prerender';
export interface ResourceTiming {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
    initiatorType: string;
    nextHopProtocol: string;
    renderBlockingStatus: string;
    responseStatus: number;
    transferSize: number;
    encodedBodySize: number;
    decodedBodySize: number;
    responseStart: number;
    responseEnd: number;
}
export interface NavigationTiming {
    domComplete: number;
    domContentLoadedEventEnd: number;
    domContentLoadedEventStart: number;
    domInteractive: number;
    loadEventEnd: number;
    loadEventStart: number;
    redirectCount: number;
    type: NavigationType;
    unloadEventEnd: number;
    unloadEventStart: number;
}
export interface LongTask {
    name: string;
    entryType: 'longtask';
    startTime: number;
    duration: number;
    attribution: TaskAttributionTiming[];
}
export interface TaskAttributionTiming {
    name: string;
    entryType: 'taskattribution';
    startTime: number;
    duration: number;
    containerType: string;
    containerSrc: string;
    containerId: string;
    containerName: string;
}
export interface PerformanceEvent {
    id: string;
    timestamp: number;
    type: 'web-vitals' | 'resource-timing' | 'navigation-timing' | 'long-task';
    data: WebVitalsMetrics | ResourceTiming | NavigationTiming | LongTask;
    url: string;
    userAgent: string;
}
//# sourceMappingURL=performance.types.d.ts.map