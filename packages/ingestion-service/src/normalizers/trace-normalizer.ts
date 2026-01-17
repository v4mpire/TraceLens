// Trace data normalization for different formats
import { Trace, TraceSpan, SpanStatus } from '@tracelens/shared';

export class TraceNormalizer {
  public normalizeTrace(trace: unknown): Trace {
    if (!trace || typeof trace !== 'object') {
      throw new Error('Trace must be an object');
    }

    const t = trace as Record<string, unknown>;

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
      } catch (error) {
        throw new Error(`Invalid span at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Calculate trace timing
    const startTime = Math.min(...normalizedSpans.map(s => s.startTime));
    const endTimes = normalizedSpans.map(s => s.endTime).filter(Boolean) as number[];
    const endTime = endTimes.length > 0 ? Math.max(...endTimes) : undefined;
    const duration = endTime ? endTime - startTime : undefined;

    // Find root span (span without parent)
    const rootSpan = normalizedSpans.find(span => !span.parentSpanId);

    return {
      traceId: t.traceId as string,
      spans: normalizedSpans,
      startTime,
      endTime,
      duration,
      rootSpan
    };
  }

  public normalizeSpan(span: unknown): TraceSpan {
    if (!span || typeof span !== 'object') {
      throw new Error('Span must be an object');
    }

    const s = span as Record<string, unknown>;

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
    const startTime = s.startTime as number;
    const endTime = s.endTime as number | undefined;
    const duration = s.duration as number | undefined || (endTime ? endTime - startTime : undefined);

    // Normalize tags
    const tags = this.normalizeTags(s.tags);

    // Normalize logs
    const logs = this.normalizeLogs(s.logs);

    // Normalize status
    const status = this.normalizeStatus(s.status);

    return {
      traceId: s.traceId as string,
      spanId: s.spanId as string,
      parentSpanId: s.parentSpanId as string | undefined,
      operationName: s.operationName as string,
      startTime,
      endTime,
      duration,
      tags,
      logs,
      status
    };
  }

  public normalizeOTLPResourceSpan(resourceSpan: unknown): Trace[] {
    if (!resourceSpan || typeof resourceSpan !== 'object') {
      throw new Error('Resource span must be an object');
    }

    const rs = resourceSpan as Record<string, unknown>;
    
    if (!Array.isArray(rs.scopeSpans)) {
      throw new Error('Resource span must have scopeSpans array');
    }

    const traces: Trace[] = [];
    const spansByTrace = new Map<string, TraceSpan[]>();

    // Group spans by trace ID
    for (const scopeSpan of rs.scopeSpans) {
      if (!scopeSpan || typeof scopeSpan !== 'object') continue;
      
      const ss = scopeSpan as Record<string, unknown>;
      if (!Array.isArray(ss.spans)) continue;

      for (const span of ss.spans) {
        try {
          const normalizedSpan = this.normalizeOTLPSpan(span);
          
          if (!spansByTrace.has(normalizedSpan.traceId)) {
            spansByTrace.set(normalizedSpan.traceId, []);
          }
          
          spansByTrace.get(normalizedSpan.traceId)!.push(normalizedSpan);
        } catch (error) {
          console.warn('Failed to normalize OTLP span:', error);
        }
      }
    }

    // Create traces from grouped spans
    for (const [traceId, spans] of spansByTrace) {
      const startTime = Math.min(...spans.map(s => s.startTime));
      const endTimes = spans.map(s => s.endTime).filter(Boolean) as number[];
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

  private normalizeOTLPSpan(span: unknown): TraceSpan {
    if (!span || typeof span !== 'object') {
      throw new Error('OTLP span must be an object');
    }

    const s = span as Record<string, unknown>;

    // Convert OTLP format to TraceLens format
    const traceId = this.bytesToHex(s.traceId as Uint8Array);
    const spanId = this.bytesToHex(s.spanId as Uint8Array);
    const parentSpanId = s.parentSpanId ? this.bytesToHex(s.parentSpanId as Uint8Array) : undefined;

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
      operationName: s.name as string || 'unknown',
      startTime,
      endTime: endTime > 0 ? endTime : undefined,
      duration,
      tags,
      status: this.normalizeOTLPStatus(s.status)
    };
  }

  private bytesToHex(bytes: Uint8Array | unknown): string {
    if (!bytes || !(bytes instanceof Uint8Array)) {
      return '00000000000000000000000000000000';
    }
    
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private normalizeOTLPAttributes(attributes: unknown): Record<string, string | number | boolean> {
    if (!Array.isArray(attributes)) {
      return {};
    }

    const tags: Record<string, string | number | boolean> = {};
    
    for (const attr of attributes) {
      if (attr && typeof attr === 'object') {
        const a = attr as Record<string, unknown>;
        if (a.key && typeof a.key === 'string' && a.value) {
          const value = a.value as Record<string, unknown>;
          
          // Extract value based on type
          if (value.stringValue !== undefined) {
            tags[a.key] = value.stringValue as string;
          } else if (value.intValue !== undefined) {
            tags[a.key] = Number(value.intValue);
          } else if (value.doubleValue !== undefined) {
            tags[a.key] = Number(value.doubleValue);
          } else if (value.boolValue !== undefined) {
            tags[a.key] = Boolean(value.boolValue);
          }
        }
      }
    }

    return tags;
  }

  private normalizeOTLPStatus(status: unknown): SpanStatus {
    if (!status || typeof status !== 'object') {
      return SpanStatus.OK;
    }

    const s = status as Record<string, unknown>;
    
    // Map OTLP status codes to TraceLens status
    switch (s.code) {
      case 0: return SpanStatus.OK;
      case 1: return SpanStatus.CANCELLED;
      case 2: return SpanStatus.UNKNOWN;
      case 3: return SpanStatus.INVALID_ARGUMENT;
      case 4: return SpanStatus.DEADLINE_EXCEEDED;
      case 5: return SpanStatus.NOT_FOUND;
      case 6: return SpanStatus.ALREADY_EXISTS;
      case 7: return SpanStatus.PERMISSION_DENIED;
      case 8: return SpanStatus.RESOURCE_EXHAUSTED;
      case 9: return SpanStatus.FAILED_PRECONDITION;
      case 10: return SpanStatus.ABORTED;
      case 11: return SpanStatus.OUT_OF_RANGE;
      case 12: return SpanStatus.UNIMPLEMENTED;
      case 13: return SpanStatus.INTERNAL;
      case 14: return SpanStatus.UNAVAILABLE;
      case 15: return SpanStatus.DATA_LOSS;
      case 16: return SpanStatus.UNAUTHENTICATED;
      default: return SpanStatus.UNKNOWN;
    }
  }

  private normalizeTags(tags: unknown): Record<string, string | number | boolean> {
    if (!tags || typeof tags !== 'object') {
      return {};
    }

    const normalizedTags: Record<string, string | number | boolean> = {};
    
    for (const [key, value] of Object.entries(tags as Record<string, unknown>)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        normalizedTags[key] = value;
      } else if (value !== null && value !== undefined) {
        normalizedTags[key] = String(value);
      }
    }

    return normalizedTags;
  }

  private normalizeLogs(logs: unknown): Array<{ timestamp: number; fields: Record<string, string | number | boolean> }> | undefined {
    if (!Array.isArray(logs)) {
      return undefined;
    }

    return logs.map(log => {
      if (!log || typeof log !== 'object') {
        return { timestamp: Date.now(), fields: {} };
      }

      const l = log as Record<string, unknown>;
      
      return {
        timestamp: typeof l.timestamp === 'number' ? l.timestamp : Date.now(),
        fields: this.normalizeTags(l.fields)
      };
    });
  }

  private normalizeStatus(status: unknown): SpanStatus {
    if (typeof status === 'string') {
      return status as SpanStatus;
    }

    if (status && typeof status === 'object') {
      const s = status as Record<string, unknown>;
      if (typeof s.code === 'string') {
        return s.code as SpanStatus;
      }
    }

    return SpanStatus.OK;
  }
}
