import { Trace, TraceSpan } from '@tracelens/shared';
export declare class TraceNormalizer {
    normalizeTrace(trace: unknown): Trace;
    normalizeSpan(span: unknown): TraceSpan;
    normalizeOTLPResourceSpan(resourceSpan: unknown): Trace[];
    private normalizeOTLPSpan;
    private bytesToHex;
    private normalizeOTLPAttributes;
    private normalizeOTLPStatus;
    private normalizeTags;
    private normalizeLogs;
    private normalizeStatus;
}
//# sourceMappingURL=trace-normalizer.d.ts.map