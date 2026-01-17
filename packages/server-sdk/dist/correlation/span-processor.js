"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceLensSpanProcessor = void 0;
class TraceLensSpanProcessor {
    constructor(options = {}) {
        this.spans = [];
        this.dependencySnapshot = null;
        this.flushTimer = null;
        this.maxSpans = options.maxSpans || 1000;
        this.flushInterval = options.flushInterval || 30000; // 30 seconds
        if (options.onFlush) {
            this.onFlush = options.onFlush;
        }
        this.startFlushTimer();
    }
    onStart(span, parentContext) {
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
    onEnd(span) {
        try {
            const spanData = this.extractSpanData(span);
            this.spans.push(spanData);
            // Flush if buffer is full
            if (this.spans.length >= this.maxSpans) {
                this.flush();
            }
        }
        catch (error) {
            console.error('Error processing span in TraceLens:', error);
        }
    }
    forceFlush() {
        return new Promise((resolve) => {
            this.flush();
            resolve();
        });
    }
    shutdown() {
        return new Promise((resolve) => {
            this.stopFlushTimer();
            this.flush();
            resolve();
        });
    }
    setDependencySnapshot(snapshot) {
        this.dependencySnapshot = snapshot;
    }
    getSpans() {
        return [...this.spans];
    }
    clearSpans() {
        this.spans = [];
    }
    onFlush(spans) {
        // Default implementation - override in constructor
        console.log(`TraceLens: Flushing ${spans.length} spans`);
    }
    extractSpanData(span) {
        const spanContext = span.spanContext();
        const attributes = span.attributes;
        // Extract timing information
        const startTime = span.startTime[0] * 1000 + span.startTime[1] / 1000000; // Convert to milliseconds
        const endTime = span.endTime[0] * 1000 + span.endTime[1] / 1000000;
        const duration = endTime - startTime;
        // Convert attributes to tags
        const tags = {};
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
            memoryUsage: attributes['tracelens.memory.heap_used'],
        };
    }
    extractDependencies(span) {
        // Extract dependency information from span attributes
        const dependencies = [];
        // Look for HTTP client calls
        if (span.attributes['http.method'] && span.attributes['http.url']) {
            const url = span.attributes['http.url'];
            const method = span.attributes['http.method'];
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
            const dbSystem = span.attributes['db.system'];
            const dbName = span.attributes['db.name'];
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
    extractServiceName(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname;
        }
        catch {
            return 'unknown-service';
        }
    }
    flush() {
        if (this.spans.length === 0)
            return;
        const spansToFlush = [...this.spans];
        this.spans = [];
        try {
            this.onFlush(spansToFlush);
        }
        catch (error) {
            console.error('Error in TraceLens span flush:', error);
            // Re-add spans to buffer on error (with limit)
            this.spans.unshift(...spansToFlush.slice(0, this.maxSpans - this.spans.length));
        }
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            if (this.spans.length > 0) {
                this.flush();
            }
        }, this.flushInterval);
    }
    stopFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}
exports.TraceLensSpanProcessor = TraceLensSpanProcessor;
