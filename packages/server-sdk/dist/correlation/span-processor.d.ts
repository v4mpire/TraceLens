import { SpanProcessor, Span, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
import { DependencySnapshot, RuntimeDependency } from '@tracelens/shared';
export interface TraceLensSpanData {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, string | number | boolean>;
    dependencies?: RuntimeDependency[];
    memoryUsage?: number;
    cpuUsage?: number;
}
export declare class TraceLensSpanProcessor implements SpanProcessor {
    private spans;
    private dependencySnapshot;
    private maxSpans;
    private flushInterval;
    private flushTimer;
    constructor(options?: {
        maxSpans?: number;
        flushInterval?: number;
        onFlush?: (spans: TraceLensSpanData[]) => void;
    });
    onStart(span: Span, parentContext: Context): void;
    onEnd(span: ReadableSpan): void;
    forceFlush(): Promise<void>;
    shutdown(): Promise<void>;
    setDependencySnapshot(snapshot: DependencySnapshot): void;
    getSpans(): TraceLensSpanData[];
    clearSpans(): void;
    protected onFlush(spans: TraceLensSpanData[]): void;
    private extractSpanData;
    private extractDependencies;
    private extractServiceName;
    private flush;
    private startFlushTimer;
    private stopFlushTimer;
}
//# sourceMappingURL=span-processor.d.ts.map