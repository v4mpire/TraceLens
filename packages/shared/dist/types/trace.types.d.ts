export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    tags: Record<string, string | number | boolean>;
    logs?: TraceLog[];
    status: SpanStatus;
}
export interface TraceLog {
    timestamp: number;
    fields: Record<string, string | number | boolean>;
}
export declare enum SpanStatus {
    OK = "OK",
    CANCELLED = "CANCELLED",
    UNKNOWN = "UNKNOWN",
    INVALID_ARGUMENT = "INVALID_ARGUMENT",
    DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED",
    NOT_FOUND = "NOT_FOUND",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    PERMISSION_DENIED = "PERMISSION_DENIED",
    RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED",
    FAILED_PRECONDITION = "FAILED_PRECONDITION",
    ABORTED = "ABORTED",
    OUT_OF_RANGE = "OUT_OF_RANGE",
    UNIMPLEMENTED = "UNIMPLEMENTED",
    INTERNAL = "INTERNAL",
    UNAVAILABLE = "UNAVAILABLE",
    DATA_LOSS = "DATA_LOSS",
    UNAUTHENTICATED = "UNAUTHENTICATED"
}
export interface Trace {
    traceId: string;
    spans: TraceSpan[];
    startTime: number;
    endTime?: number;
    duration?: number;
    rootSpan?: TraceSpan;
}
export interface TraceContext {
    traceId: string;
    spanId: string;
    traceFlags: number;
    traceState?: string;
}
export interface TracingConfig {
    serviceName: string;
    serviceVersion: string;
    environment: string;
    samplingRate: number;
    endpoint?: string;
}
//# sourceMappingURL=trace.types.d.ts.map