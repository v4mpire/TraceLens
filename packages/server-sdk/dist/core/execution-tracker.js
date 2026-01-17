"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionTracker = void 0;
// Function call tracing and execution tracking
const api_1 = require("@opentelemetry/api");
class ExecutionTracker {
    constructor(config) {
        this.tracer = api_1.trace.getTracer('tracelens-execution-tracker');
        this.config = config;
        this.metrics = {
            totalCalls: 0,
            totalDuration: 0,
            averageDuration: 0,
            errorCount: 0,
            functionMetrics: new Map(),
        };
    }
    initialize() {
        if (this.config.debug) {
            console.log('Execution tracker initialized');
        }
    }
    shutdown() {
        // Cleanup if needed
    }
    trackFunction(fn, functionName) {
        const name = functionName || fn.name || 'anonymous';
        return ((...args) => {
            const startTime = process.hrtime.bigint();
            const span = this.tracer.startSpan(`function.${name}`, {
                kind: api_1.SpanKind.INTERNAL,
                attributes: {
                    'function.name': name,
                    'function.args.count': args.length,
                },
            });
            return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
                try {
                    const result = fn.apply(this, args);
                    // Handle async functions
                    if (result && typeof result.then === 'function') {
                        return result
                            .then((value) => {
                            this.recordExecution(name, startTime, false);
                            span.setStatus({ code: api_1.SpanStatusCode.OK });
                            span.end();
                            return value;
                        })
                            .catch((error) => {
                            this.recordExecution(name, startTime, true);
                            span.recordException(error);
                            span.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message: error.message
                            });
                            span.end();
                            throw error;
                        });
                    }
                    // Handle sync functions
                    this.recordExecution(name, startTime, false);
                    span.setStatus({ code: api_1.SpanStatusCode.OK });
                    span.end();
                    return result;
                }
                catch (error) {
                    this.recordExecution(name, startTime, true);
                    span.recordException(error);
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: error.message
                    });
                    span.end();
                    throw error;
                }
            });
        });
    }
    trackAsyncFunction(fn, functionName) {
        const name = functionName || fn.name || 'anonymous';
        return (async (...args) => {
            const startTime = process.hrtime.bigint();
            const span = this.tracer.startSpan(`async.${name}`, {
                kind: api_1.SpanKind.INTERNAL,
                attributes: {
                    'function.name': name,
                    'function.args.count': args.length,
                    'function.async': true,
                },
            });
            return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), async () => {
                try {
                    const result = await fn.apply(this, args);
                    this.recordExecution(name, startTime, false);
                    span.setStatus({ code: api_1.SpanStatusCode.OK });
                    span.end();
                    return result;
                }
                catch (error) {
                    this.recordExecution(name, startTime, true);
                    span.recordException(error);
                    span.setStatus({
                        code: api_1.SpanStatusCode.ERROR,
                        message: error.message
                    });
                    span.end();
                    throw error;
                }
            });
        });
    }
    createSpan(name, attributes) {
        return this.tracer.startSpan(name, {
            kind: api_1.SpanKind.INTERNAL,
            attributes: attributes || {},
        });
    }
    getMetrics() {
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
    resetMetrics() {
        this.metrics = {
            totalCalls: 0,
            totalDuration: 0,
            averageDuration: 0,
            errorCount: 0,
            functionMetrics: new Map(),
        };
    }
    recordExecution(functionName, startTime, isError) {
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
exports.ExecutionTracker = ExecutionTracker;
