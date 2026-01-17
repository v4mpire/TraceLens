"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceContextManager = void 0;
// Distributed tracing context management
const api_1 = require("@opentelemetry/api");
class TraceContextManager {
    static getInstance() {
        if (!TraceContextManager.instance) {
            TraceContextManager.instance = new TraceContextManager();
        }
        return TraceContextManager.instance;
    }
    getCurrentTraceContext() {
        const activeSpan = api_1.trace.getActiveSpan();
        if (!activeSpan)
            return null;
        const spanContext = activeSpan.spanContext();
        return {
            traceId: spanContext.traceId,
            spanId: spanContext.spanId,
            traceFlags: spanContext.traceFlags || api_1.TraceFlags.NONE,
            traceState: spanContext.traceState?.serialize(),
        };
    }
    createTraceContext(traceId, spanId, traceFlags = api_1.TraceFlags.SAMPLED, traceState) {
        return {
            traceId,
            spanId,
            traceFlags,
            traceState,
        };
    }
    injectTraceContext(headers) {
        api_1.propagation.inject(api_1.context.active(), headers);
    }
    extractTraceContext(headers) {
        const extractedContext = api_1.propagation.extract(api_1.context.active(), headers);
        api_1.context.with(extractedContext, () => {
            // Context is now active for subsequent operations
        });
    }
    withTraceContext(traceContext, fn) {
        const spanContext = {
            traceId: traceContext.traceId,
            spanId: traceContext.spanId,
            traceFlags: traceContext.traceFlags,
            isRemote: true,
        };
        // Create a new context with the trace context
        const newContext = api_1.trace.setSpanContext(api_1.context.active(), spanContext);
        return api_1.context.with(newContext, fn);
    }
    generateTraceId() {
        // Generate a random 32-character hex string
        return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    generateSpanId() {
        // Generate a random 16-character hex string
        return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    isValidTraceId(traceId) {
        return /^[0-9a-f]{32}$/.test(traceId) && traceId !== '00000000000000000000000000000000';
    }
    isValidSpanId(spanId) {
        return /^[0-9a-f]{16}$/.test(spanId) && spanId !== '0000000000000000';
    }
    correlateWithParent(parentContext) {
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
            traceFlags: api_1.TraceFlags.SAMPLED,
        };
    }
    addBaggage(key, value) {
        // Add baggage to current context
        const currentContext = api_1.context.active();
        // OpenTelemetry baggage implementation would go here
    }
    getBaggage(key) {
        // Get baggage from current context
        const currentContext = api_1.context.active();
        // OpenTelemetry baggage implementation would go here
        return undefined;
    }
}
exports.TraceContextManager = TraceContextManager;
