"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceNormalizer = void 0;
// Trace data normalization for different formats
const shared_1 = require("@tracelens/shared");
class TraceNormalizer {
    normalizeTrace(trace) {
        if (!trace || typeof trace !== 'object') {
            throw new Error('Trace must be an object');
        }
        const t = trace;
        // Validate required fields
        if (!t.traceId || typeof t.traceId !== 'string') {
            throw new Error('Trace must have a valid traceId');
        }
        if (!Array.isArray(t.spans) || t.spans.length === 0) {
            throw new Error('Trace must have at least one span');
        }
        // Normalize spans
        const normalizedSpans = t.spans.map((span, index) => {
            try {
                return this.normalizeSpan(span);
            }
            catch (error) {
                throw new Error(`Invalid span at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
        // Calculate trace timing
        const startTime = Math.min(...normalizedSpans.map(s => s.startTime));
        const endTimes = normalizedSpans.map(s => s.endTime).filter(Boolean);
        const endTime = endTimes.length > 0 ? Math.max(...endTimes) : undefined;
        const duration = endTime ? endTime - startTime : undefined;
        // Find root span (span without parent)
        const rootSpan = normalizedSpans.find(span => !span.parentSpanId);
        return {
            traceId: t.traceId,
            spans: normalizedSpans,
            startTime,
            endTime,
            duration,
            rootSpan
        };
    }
    normalizeSpan(span) {
        if (!span || typeof span !== 'object') {
            throw new Error('Span must be an object');
        }
        const s = span;
        // Validate required fields
        if (!s.traceId || typeof s.traceId !== 'string') {
            throw new Error('Span must have a valid traceId');
        }
        if (!s.spanId || typeof s.spanId !== 'string') {
            throw new Error('Span must have a valid spanId');
        }
        if (!s.operationName || typeof s.operationName !== 'string') {
            throw new Error('Span must have an operationName');
        }
        if (!s.startTime || typeof s.startTime !== 'number') {
            throw new Error('Span must have a valid startTime');
        }
        // Normalize timing
        const startTime = s.startTime;
        const endTime = s.endTime;
        const duration = s.duration || (endTime ? endTime - startTime : undefined);
        // Normalize tags
        const tags = this.normalizeTags(s.tags);
        // Normalize logs
        const logs = this.normalizeLogs(s.logs);
        // Normalize status
        const status = this.normalizeStatus(s.status);
        return {
            traceId: s.traceId,
            spanId: s.spanId,
            parentSpanId: s.parentSpanId,
            operationName: s.operationName,
            startTime,
            endTime,
            duration,
            tags,
            logs,
            status
        };
    }
    normalizeOTLPResourceSpan(resourceSpan) {
        if (!resourceSpan || typeof resourceSpan !== 'object') {
            throw new Error('Resource span must be an object');
        }
        const rs = resourceSpan;
        if (!Array.isArray(rs.scopeSpans)) {
            throw new Error('Resource span must have scopeSpans array');
        }
        const traces = [];
        const spansByTrace = new Map();
        // Group spans by trace ID
        for (const scopeSpan of rs.scopeSpans) {
            if (!scopeSpan || typeof scopeSpan !== 'object')
                continue;
            const ss = scopeSpan;
            if (!Array.isArray(ss.spans))
                continue;
            for (const span of ss.spans) {
                try {
                    const normalizedSpan = this.normalizeOTLPSpan(span);
                    if (!spansByTrace.has(normalizedSpan.traceId)) {
                        spansByTrace.set(normalizedSpan.traceId, []);
                    }
                    spansByTrace.get(normalizedSpan.traceId).push(normalizedSpan);
                }
                catch (error) {
                    console.warn('Failed to normalize OTLP span:', error);
                }
            }
        }
        // Create traces from grouped spans
        for (const [traceId, spans] of spansByTrace) {
            const startTime = Math.min(...spans.map(s => s.startTime));
            const endTimes = spans.map(s => s.endTime).filter(Boolean);
            const endTime = endTimes.length > 0 ? Math.max(...endTimes) : undefined;
            const duration = endTime ? endTime - startTime : undefined;
            const rootSpan = spans.find(span => !span.parentSpanId);
            traces.push({
                traceId,
                spans,
                startTime,
                endTime,
                duration,
                rootSpan
            });
        }
        return traces;
    }
    normalizeOTLPSpan(span) {
        if (!span || typeof span !== 'object') {
            throw new Error('OTLP span must be an object');
        }
        const s = span;
        // Convert OTLP format to TraceLens format
        const traceId = this.bytesToHex(s.traceId);
        const spanId = this.bytesToHex(s.spanId);
        const parentSpanId = s.parentSpanId ? this.bytesToHex(s.parentSpanId) : undefined;
        // Convert nanoseconds to microseconds
        const startTime = Number(s.startTimeUnixNano || 0) / 1000;
        const endTime = Number(s.endTimeUnixNano || 0) / 1000;
        const duration = endTime > startTime ? endTime - startTime : undefined;
        // Convert attributes to tags
        const tags = this.normalizeOTLPAttributes(s.attributes);
        return {
            traceId,
            spanId,
            parentSpanId,
            operationName: s.name || 'unknown',
            startTime,
            endTime: endTime > 0 ? endTime : undefined,
            duration,
            tags,
            status: this.normalizeOTLPStatus(s.status)
        };
    }
    bytesToHex(bytes) {
        if (!bytes || !(bytes instanceof Uint8Array)) {
            return '00000000000000000000000000000000';
        }
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    normalizeOTLPAttributes(attributes) {
        if (!Array.isArray(attributes)) {
            return {};
        }
        const tags = {};
        for (const attr of attributes) {
            if (attr && typeof attr === 'object') {
                const a = attr;
                if (a.key && typeof a.key === 'string' && a.value) {
                    const value = a.value;
                    // Extract value based on type
                    if (value.stringValue !== undefined) {
                        tags[a.key] = value.stringValue;
                    }
                    else if (value.intValue !== undefined) {
                        tags[a.key] = Number(value.intValue);
                    }
                    else if (value.doubleValue !== undefined) {
                        tags[a.key] = Number(value.doubleValue);
                    }
                    else if (value.boolValue !== undefined) {
                        tags[a.key] = Boolean(value.boolValue);
                    }
                }
            }
        }
        return tags;
    }
    normalizeOTLPStatus(status) {
        if (!status || typeof status !== 'object') {
            return shared_1.SpanStatus.OK;
        }
        const s = status;
        // Map OTLP status codes to TraceLens status
        switch (s.code) {
            case 0: return shared_1.SpanStatus.OK;
            case 1: return shared_1.SpanStatus.CANCELLED;
            case 2: return shared_1.SpanStatus.UNKNOWN;
            case 3: return shared_1.SpanStatus.INVALID_ARGUMENT;
            case 4: return shared_1.SpanStatus.DEADLINE_EXCEEDED;
            case 5: return shared_1.SpanStatus.NOT_FOUND;
            case 6: return shared_1.SpanStatus.ALREADY_EXISTS;
            case 7: return shared_1.SpanStatus.PERMISSION_DENIED;
            case 8: return shared_1.SpanStatus.RESOURCE_EXHAUSTED;
            case 9: return shared_1.SpanStatus.FAILED_PRECONDITION;
            case 10: return shared_1.SpanStatus.ABORTED;
            case 11: return shared_1.SpanStatus.OUT_OF_RANGE;
            case 12: return shared_1.SpanStatus.UNIMPLEMENTED;
            case 13: return shared_1.SpanStatus.INTERNAL;
            case 14: return shared_1.SpanStatus.UNAVAILABLE;
            case 15: return shared_1.SpanStatus.DATA_LOSS;
            case 16: return shared_1.SpanStatus.UNAUTHENTICATED;
            default: return shared_1.SpanStatus.UNKNOWN;
        }
    }
    normalizeTags(tags) {
        if (!tags || typeof tags !== 'object') {
            return {};
        }
        const normalizedTags = {};
        for (const [key, value] of Object.entries(tags)) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                normalizedTags[key] = value;
            }
            else if (value !== null && value !== undefined) {
                normalizedTags[key] = String(value);
            }
        }
        return normalizedTags;
    }
    normalizeLogs(logs) {
        if (!Array.isArray(logs)) {
            return undefined;
        }
        return logs.map(log => {
            if (!log || typeof log !== 'object') {
                return { timestamp: Date.now(), fields: {} };
            }
            const l = log;
            return {
                timestamp: typeof l.timestamp === 'number' ? l.timestamp : Date.now(),
                fields: this.normalizeTags(l.fields)
            };
        });
    }
    normalizeStatus(status) {
        if (typeof status === 'string') {
            return status;
        }
        if (status && typeof status === 'object') {
            const s = status;
            if (typeof s.code === 'string') {
                return s.code;
            }
        }
        return shared_1.SpanStatus.OK;
    }
}
exports.TraceNormalizer = TraceNormalizer;
