// Custom span processing for TraceLens integration
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

export class TraceLensSpanProcessor implements SpanProcessor {
  private spans: TraceLensSpanData[] = [];
  private dependencySnapshot: DependencySnapshot | null = null;
  private maxSpans: number;
  private flushInterval: number;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(options: {
    maxSpans?: number;
    flushInterval?: number;
    onFlush?: (spans: TraceLensSpanData[]) => void;
  } = {}) {
    this.maxSpans = options.maxSpans || 1000;
    this.flushInterval = options.flushInterval || 30000; // 30 seconds
    
    if (options.onFlush) {
      this.onFlush = options.onFlush;
    }

    this.startFlushTimer();
  }

  public onStart(span: Span, parentContext: Context): void {
    // Called when span starts - can add initial attributes
    const startTime = Date.now();
    
    span.setAttributes({
      'tracelens.start_time': startTime,
      'tracelens.process_id': process.pid,
      'tracelens.node_version': process.version,
    });

    // Capture memory usage at span start
    const memUsage = process.memoryUsage();
    span.setAttributes({
      'tracelens.memory.heap_used': memUsage.heapUsed,
      'tracelens.memory.heap_total': memUsage.heapTotal,
      'tracelens.memory.external': memUsage.external,
    });
  }

  public onEnd(span: ReadableSpan): void {
    try {
      const spanData = this.extractSpanData(span);
      this.spans.push(spanData);

      // Flush if buffer is full
      if (this.spans.length >= this.maxSpans) {
        this.flush();
      }
    } catch (error) {
      console.error('Error processing span in TraceLens:', error);
    }
  }

  public forceFlush(): Promise<void> {
    return new Promise((resolve) => {
      this.flush();
      resolve();
    });
  }

  public shutdown(): Promise<void> {
    return new Promise((resolve) => {
      this.stopFlushTimer();
      this.flush();
      resolve();
    });
  }

  public setDependencySnapshot(snapshot: DependencySnapshot): void {
    this.dependencySnapshot = snapshot;
  }

  public getSpans(): TraceLensSpanData[] {
    return [...this.spans];
  }

  public clearSpans(): void {
    this.spans = [];
  }

  protected onFlush(spans: TraceLensSpanData[]): void {
    // Default implementation - override in constructor
    console.log(`TraceLens: Flushing ${spans.length} spans`);
  }

  private extractSpanData(span: ReadableSpan): TraceLensSpanData {
    const spanContext = span.spanContext();
    const attributes = span.attributes;
    
    // Extract timing information
    const startTime = span.startTime[0] * 1000 + span.startTime[1] / 1000000; // Convert to milliseconds
    const endTime = span.endTime[0] * 1000 + span.endTime[1] / 1000000;
    const duration = endTime - startTime;

    // Convert attributes to tags
    const tags: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        tags[key] = value;
      }
    }

    // Extract dependency information if available
    const dependencies = this.extractDependencies(span);

    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      parentSpanId: span.parentSpanId,
      operationName: span.name,
      startTime,
      endTime,
      duration,
      tags,
      dependencies,
      memoryUsage: attributes['tracelens.memory.heap_used'] as number,
    };
  }

  private extractDependencies(span: ReadableSpan): RuntimeDependency[] | undefined {
    // Extract dependency information from span attributes
    const dependencies: RuntimeDependency[] = [];
    
    // Look for HTTP client calls
    if (span.attributes['http.method'] && span.attributes['http.url']) {
      const url = span.attributes['http.url'] as string;
      const method = span.attributes['http.method'] as string;
      
      dependencies.push({
        name: this.extractServiceName(url),
        version: '0.0.0', // Would need service discovery
        loadTime: 0,
        executionTime: span.duration?.[0] || 0,
        memoryUsage: 0,
        importPath: url,
        isEsm: false,
        exports: [],
      });
    }

    // Look for database calls
    if (span.attributes['db.system']) {
      const dbSystem = span.attributes['db.system'] as string;
      const dbName = span.attributes['db.name'] as string;
      
      dependencies.push({
        name: `${dbSystem}:${dbName}`,
        version: '0.0.0',
        loadTime: 0,
        executionTime: span.duration?.[0] || 0,
        memoryUsage: 0,
        importPath: `${dbSystem}://${dbName}`,
        isEsm: false,
        exports: [],
      });
    }

    return dependencies.length > 0 ? dependencies : undefined;
  }

  private extractServiceName(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return 'unknown-service';
    }
  }

  private flush(): void {
    if (this.spans.length === 0) return;

    const spansToFlush = [...this.spans];
    this.spans = [];

    try {
      this.onFlush(spansToFlush);
    } catch (error) {
      console.error('Error in TraceLens span flush:', error);
      // Re-add spans to buffer on error (with limit)
      this.spans.unshift(...spansToFlush.slice(0, this.maxSpans - this.spans.length));
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.spans.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
