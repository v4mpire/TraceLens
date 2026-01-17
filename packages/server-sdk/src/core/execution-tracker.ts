// Function call tracing and execution tracking
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
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

export class ExecutionTracker {
  private config: ServerSDKConfig;
  private metrics: ExecutionMetrics;
  private tracer = trace.getTracer('tracelens-execution-tracker');

  constructor(config: ServerSDKConfig) {
    this.config = config;
    this.metrics = {
      totalCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      errorCount: 0,
      functionMetrics: new Map(),
    };
  }

  public initialize(): void {
    if (this.config.debug) {
      console.log('Execution tracker initialized');
    }
  }

  public shutdown(): void {
    // Cleanup if needed
  }

  public trackFunction<T extends (...args: any[]) => any>(
    fn: T,
    functionName?: string
  ): T {
    const name = functionName || fn.name || 'anonymous';
    
    return ((...args: any[]) => {
      const startTime = process.hrtime.bigint();
      const span = this.tracer.startSpan(`function.${name}`, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'function.name': name,
          'function.args.count': args.length,
        },
      });

      return context.with(trace.setSpan(context.active(), span), () => {
        try {
          const result = fn.apply(this, args);
          
          // Handle async functions
          if (result && typeof result.then === 'function') {
            return result
              .then((value: any) => {
                this.recordExecution(name, startTime, false);
                span.setStatus({ code: SpanStatusCode.OK });
                span.end();
                return value;
              })
              .catch((error: any) => {
                this.recordExecution(name, startTime, true);
                span.recordException(error);
                span.setStatus({ 
                  code: SpanStatusCode.ERROR, 
                  message: error.message 
                });
                span.end();
                throw error;
              });
          }
          
          // Handle sync functions
          this.recordExecution(name, startTime, false);
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();
          return result;
        } catch (error: any) {
          this.recordExecution(name, startTime, true);
          span.recordException(error);
          span.setStatus({ 
            code: SpanStatusCode.ERROR, 
            message: error.message 
          });
          span.end();
          throw error;
        }
      });
    }) as T;
  }

  public trackAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    functionName?: string
  ): T {
    const name = functionName || fn.name || 'anonymous';
    
    return (async (...args: any[]) => {
      const startTime = process.hrtime.bigint();
      const span = this.tracer.startSpan(`async.${name}`, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'function.name': name,
          'function.args.count': args.length,
          'function.async': true,
        },
      });

      return context.with(trace.setSpan(context.active(), span), async () => {
        try {
          const result = await fn.apply(this, args);
          this.recordExecution(name, startTime, false);
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();
          return result;
        } catch (error: any) {
          this.recordExecution(name, startTime, true);
          span.recordException(error);
          span.setStatus({ 
            code: SpanStatusCode.ERROR, 
            message: error.message 
          });
          span.end();
          throw error;
        }
      });
    }) as T;
  }

  public createSpan(name: string, attributes?: Record<string, string | number | boolean>) {
    return this.tracer.startSpan(name, {
      kind: SpanKind.INTERNAL,
      attributes: attributes || {},
    });
  }

  public getMetrics(): ExecutionMetrics {
    // Update average duration
    this.metrics.averageDuration = this.metrics.totalCalls > 0 
      ? this.metrics.totalDuration / this.metrics.totalCalls 
      : 0;

    // Update function averages
    for (const [name, funcMetrics] of this.metrics.functionMetrics) {
      funcMetrics.averageDuration = funcMetrics.callCount > 0
        ? funcMetrics.totalDuration / funcMetrics.callCount
        : 0;
    }

    return {
      ...this.metrics,
      functionMetrics: new Map(this.metrics.functionMetrics),
    };
  }

  public resetMetrics(): void {
    this.metrics = {
      totalCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      errorCount: 0,
      functionMetrics: new Map(),
    };
  }

  private recordExecution(functionName: string, startTime: bigint, isError: boolean): void {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Update global metrics
    this.metrics.totalCalls++;
    this.metrics.totalDuration += duration;
    if (isError) {
      this.metrics.errorCount++;
    }

    // Update function-specific metrics
    let funcMetrics = this.metrics.functionMetrics.get(functionName);
    if (!funcMetrics) {
      funcMetrics = {
        name: functionName,
        callCount: 0,
        totalDuration: 0,
        averageDuration: 0,
        errorCount: 0,
        lastCalled: Date.now(),
      };
      this.metrics.functionMetrics.set(functionName, funcMetrics);
    }

    funcMetrics.callCount++;
    funcMetrics.totalDuration += duration;
    funcMetrics.lastCalled = Date.now();
    if (isError) {
      funcMetrics.errorCount++;
    }
  }
}
