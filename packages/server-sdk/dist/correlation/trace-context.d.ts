import { TraceContext as SharedTraceContext } from '@tracelens/shared';
export declare class TraceContextManager {
    private static instance;
    static getInstance(): TraceContextManager;
    getCurrentTraceContext(): SharedTraceContext | null;
    createTraceContext(traceId: string, spanId: string, traceFlags?: number, traceState?: string): SharedTraceContext;
    injectTraceContext(headers: Record<string, string>): void;
    extractTraceContext(headers: Record<string, string>): void;
    withTraceContext<T>(traceContext: SharedTraceContext, fn: () => T): T;
    generateTraceId(): string;
    generateSpanId(): string;
    isValidTraceId(traceId: string): boolean;
    isValidSpanId(spanId: string): boolean;
    correlateWithParent(parentContext?: SharedTraceContext): SharedTraceContext;
    addBaggage(key: string, value: string): void;
    getBaggage(key: string): string | undefined;
}
//# sourceMappingURL=trace-context.d.ts.map