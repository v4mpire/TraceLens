import { ServerSDKConfig } from './tracer';
export interface ExecutionMetrics {
    totalCalls: number;
    totalDuration: number;
    averageDuration: number;
    errorCount: number;
    functionMetrics: Map<string, FunctionMetrics>;
}
export interface FunctionMetrics {
    name: string;
    callCount: number;
    totalDuration: number;
    averageDuration: number;
    errorCount: number;
    lastCalled: number;
}
export declare class ExecutionTracker {
    private config;
    private metrics;
    private tracer;
    constructor(config: ServerSDKConfig);
    initialize(): void;
    shutdown(): void;
    trackFunction<T extends (...args: any[]) => any>(fn: T, functionName?: string): T;
    trackAsyncFunction<T extends (...args: any[]) => Promise<any>>(fn: T, functionName?: string): T;
    createSpan(name: string, attributes?: Record<string, string | number | boolean>): import("@opentelemetry/api").Span;
    getMetrics(): ExecutionMetrics;
    resetMetrics(): void;
    private recordExecution;
}
//# sourceMappingURL=execution-tracker.d.ts.map