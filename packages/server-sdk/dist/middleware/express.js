"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTraceLensMiddleware = createTraceLensMiddleware;
exports.getTraceLensSDK = getTraceLensSDK;
exports.traced = traced;
const api_1 = require("@opentelemetry/api");
const tracer_1 = require("../core/tracer");
function createTraceLensMiddleware(options = {}) {
    const sdk = new tracer_1.TraceLensServerSDK(options);
    const tracer = api_1.trace.getTracer('tracelens-express');
    // Initialize SDK
    sdk.initialize().catch(error => {
        console.error('Failed to initialize TraceLens SDK:', error);
    });
    return function traceLensMiddleware(req, res, next) {
        // Check if request should be ignored
        if (shouldIgnoreRequest(req, options)) {
            return next();
        }
        const startTime = process.hrtime.bigint();
        const spanName = `${req.method} ${req.route?.path || req.path}`;
        const span = tracer.startSpan(spanName, {
            kind: api_1.SpanKind.SERVER,
            attributes: {
                'http.method': req.method,
                'http.url': req.url,
                'http.route': req.route?.path || req.path,
                'http.user_agent': req.get('User-Agent') || '',
                'http.request_content_length': req.get('Content-Length') || 0,
                'tracelens.service': options.serviceName || 'unknown',
            },
        });
        // Add custom request attributes
        if (options.requestHook) {
            try {
                options.requestHook(span, req);
            }
            catch (error) {
                console.warn('Error in TraceLens request hook:', error);
            }
        }
        // Wrap response to capture response data
        const originalSend = res.send;
        const originalJson = res.json;
        res.send = function (body) {
            captureResponse(span, res, body, startTime, options);
            return originalSend.call(this, body);
        };
        res.json = function (body) {
            captureResponse(span, res, body, startTime, options);
            return originalJson.call(this, body);
        };
        // Handle response end
        res.on('finish', () => {
            if (!res.headersSent) {
                captureResponse(span, res, null, startTime, options);
            }
        });
        // Continue with request in span context
        api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            next();
        });
    };
}
function shouldIgnoreRequest(req, options) {
    // Ignore health checks and static assets by default
    const defaultIgnorePaths = ['/health', '/ping', '/favicon.ico', '/robots.txt'];
    const ignorePaths = [...defaultIgnorePaths, ...(options.ignorePaths || [])];
    if (ignorePaths.some(path => req.path.startsWith(path))) {
        return true;
    }
    // Custom ignore hook
    if (options.ignoreIncomingRequestHook) {
        try {
            return options.ignoreIncomingRequestHook(req);
        }
        catch (error) {
            console.warn('Error in TraceLens ignore hook:', error);
        }
    }
    return false;
}
function captureResponse(span, res, body, startTime, options) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    // Set response attributes
    span.setAttributes({
        'http.status_code': res.statusCode,
        'http.response_content_length': res.get('Content-Length') || 0,
        'http.response_time_ms': duration,
    });
    // Set span status based on HTTP status code
    if (res.statusCode >= 400) {
        span.setStatus({
            code: api_1.SpanStatusCode.ERROR,
            message: `HTTP ${res.statusCode}`,
        });
    }
    else {
        span.setStatus({ code: api_1.SpanStatusCode.OK });
    }
    // Add custom response attributes
    if (options.responseHook) {
        try {
            options.responseHook(span, res);
        }
        catch (error) {
            console.warn('Error in TraceLens response hook:', error);
        }
    }
    span.end();
}
// Utility function to get SDK instance for manual instrumentation
function getTraceLensSDK() {
    // This would need to be implemented with a global registry
    // For now, return null and require manual SDK management
    return null;
}
// Decorator for automatic function tracing
function traced(target, propertyName, descriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args) {
        const tracer = api_1.trace.getTracer('tracelens-decorator');
        const span = tracer.startSpan(`${target.constructor.name}.${propertyName}`, {
            kind: api_1.SpanKind.INTERNAL,
            attributes: {
                'function.class': target.constructor.name,
                'function.method': propertyName,
                'function.args.count': args.length,
            },
        });
        return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), span), () => {
            try {
                const result = method.apply(this, args);
                // Handle promises
                if (result && typeof result.then === 'function') {
                    return result
                        .then((value) => {
                        span.setStatus({ code: api_1.SpanStatusCode.OK });
                        span.end();
                        return value;
                    })
                        .catch((error) => {
                        span.recordException(error);
                        span.setStatus({
                            code: api_1.SpanStatusCode.ERROR,
                            message: error.message
                        });
                        span.end();
                        throw error;
                    });
                }
                span.setStatus({ code: api_1.SpanStatusCode.OK });
                span.end();
                return result;
            }
            catch (error) {
                span.recordException(error);
                span.setStatus({
                    code: api_1.SpanStatusCode.ERROR,
                    message: error.message
                });
                span.end();
                throw error;
            }
        });
    };
    return descriptor;
}
