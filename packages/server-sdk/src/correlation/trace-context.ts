// Distributed tracing context management
import { trace, context, propagation, SpanContext, TraceFlags } from '@opentelemetry/api';
import { TraceContext as SharedTraceContext } from '@tracelens/shared';

export class TraceContextManager {
  private static instance: TraceContextManager;
  
  public static getInstance(): TraceContextManager {
    if (!TraceContextManager.instance) {
      TraceContextManager.instance = new TraceContextManager();
    }
    return TraceContextManager.instance;
  }

  public getCurrentTraceContext(): SharedTraceContext | null {
    const activeSpan = trace.getActiveSpan();
    if (!activeSpan) return null;

    const spanContext = activeSpan.spanContext();
    
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags || TraceFlags.NONE,
      traceState: spanContext.traceState?.serialize(),
    };
  }

  public createTraceContext(
    traceId: string, 
    spanId: string, 
    traceFlags: number = TraceFlags.SAMPLED,
    traceState?: string
  ): SharedTraceContext {
    return {
      traceId,
      spanId,
      traceFlags,
      traceState,
    };
  }

  public injectTraceContext(headers: Record<string, string>): void {
    propagation.inject(context.active(), headers);
  }

  public extractTraceContext(headers: Record<string, string>): void {
    const extractedContext = propagation.extract(context.active(), headers);
    context.with(extractedContext, () => {
      // Context is now active for subsequent operations
    });
  }

  public withTraceContext<T>(
    traceContext: SharedTraceContext, 
    fn: () => T
  ): T {
    const spanContext: SpanContext = {
      traceId: traceContext.traceId,
      spanId: traceContext.spanId,
      traceFlags: traceContext.traceFlags,
      isRemote: true,
    };

    // Create a new context with the trace context
    const newContext = trace.setSpanContext(context.active(), spanContext);
    
    return context.with(newContext, fn);
  }

  public generateTraceId(): string {
    // Generate a random 32-character hex string
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  public generateSpanId(): string {
    // Generate a random 16-character hex string
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  public isValidTraceId(traceId: string): boolean {
    return /^[0-9a-f]{32}$/.test(traceId) && traceId !== '00000000000000000000000000000000';
  }

  public isValidSpanId(spanId: string): boolean {
    return /^[0-9a-f]{16}$/.test(spanId) && spanId !== '0000000000000000';
  }

  public correlateWithParent(parentContext?: SharedTraceContext): SharedTraceContext {
    if (parentContext && this.isValidTraceId(parentContext.traceId)) {
      // Create child span context
      return {
        traceId: parentContext.traceId,
        spanId: this.generateSpanId(),
        traceFlags: parentContext.traceFlags,
        traceState: parentContext.traceState,
      };
    }

    // Create new trace
    return {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      traceFlags: TraceFlags.SAMPLED,
    };
  }

  public addBaggage(key: string, value: string): void {
    // Add baggage to current context
    const currentContext = context.active();
    // OpenTelemetry baggage implementation would go here
  }

  public getBaggage(key: string): string | undefined {
    // Get baggage from current context
    const currentContext = context.active();
    // OpenTelemetry baggage implementation would go here
    return undefined;
  }
}
