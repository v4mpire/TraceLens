import { TraceSpan, Trace } from '../types/trace.types';
import { PerformanceEvent } from '../types/performance.types';
import { DependencySnapshot } from '../types/dependency.types';
import { CVERecord } from '../types/security.types';
export declare class ValidationError extends Error {
    field: string;
    value: unknown;
    constructor(message: string, field: string, value: unknown);
}
export declare function validateTraceSpan(span: unknown): TraceSpan;
export declare function validateTrace(trace: unknown): Trace;
export declare function validatePerformanceEvent(event: unknown): PerformanceEvent;
export declare function validateDependencySnapshot(snapshot: unknown): DependencySnapshot;
export declare function validateCVERecord(cve: unknown): CVERecord;
export declare function sanitizeInput(input: string): string;
export declare function validateProjectId(projectId: string): boolean;
export declare function validateTimestamp(timestamp: number): boolean;
export declare function validateUrl(url: string): boolean;
export declare function validateVersion(version: string): boolean;
export declare function isValidJSON(str: string): boolean;
//# sourceMappingURL=validation.d.ts.map