"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const api_1 = require("@opentelemetry/api");
const tracer_1 = require("../core/tracer");
const traceLensPlugin = async (fastify, options) => {
    const sdk = new tracer_1.TraceLensServerSDK(options);
    const tracer = api_1.trace.getTracer('tracelens-fastify');
    // Initialize SDK
    await sdk.initialize();
    // Register shutdown hook
    fastify.addHook('onClose', async () => {
        await sdk.shutdown();
    });
    // Add request/reply hooks for tracing
    fastify.addHook('onRequest', async (request, reply) => {
        // Check if request should be ignored
        if (shouldIgnoreRequest(request, options)) {
            return;
        }
        const startTime = process.hrtime.bigint();
        const spanName = `${request.method} ${request.routerPath || request.url}`;
        const span = tracer.startSpan(spanName, {
            kind: api_1.SpanKind.SERVER,
            attributes: {
                'http.method': request.method,
                'http.url': request.url,
                'http.route': request.routerPath || request.url,
                'http.user_agent': request.headers['user-agent'] || '',
                'http.request_content_length': request.headers['content-length'] || 0,
                'tracelens.service': options.serviceName || 'unknown',
            },
        });
        // Store span and start time in request context
        request.traceLensSpan = span;
        request.traceLensStartTime = startTime;
        // Add custom request attributes
        if (options.requestHook) {
            try {
                options.requestHook(span, request);
            }
            catch (error) {
                console.warn('Error in TraceLens request hook:', error);
            }
        }
    });
    fastify.addHook('onResponse', async (request, reply) => {
        const span = request.traceLensSpan;
        const startTime = request.traceLensStartTime;
        if (!span || !startTime)
            return;
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        // Set response attributes
        span.setAttributes({
            'http.status_code': reply.statusCode,
            'http.response_content_length': reply.getHeader('content-length') || 0,
            'http.response_time_ms': duration,
        });
        // Set span status based on HTTP status code
        if (reply.statusCode >= 400) {
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: `HTTP ${reply.statusCode}`,
            });
        }
        else {
            span.setStatus({ code: api_1.SpanStatusCode.OK });
        }
        // Add custom response attributes
        if (options.responseHook) {
            try {
                options.responseHook(span, reply);
            }
            catch (error) {
                console.warn('Error in TraceLens response hook:', error);
            }
        }
        span.end();
    });
    fastify.addHook('onError', async (request, reply, error) => {
        const span = request.traceLensSpan;
        if (span) {
            span.recordException(error);
            span.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: error.message,
            });
        }
    });
    // Decorate request with TraceLens utilities
    fastify.decorateRequest('traceLens', {
        createSpan: (name, attributes) => {
            return tracer.startSpan(name, {
                kind: api_1.SpanKind.INTERNAL,
                attributes,
            });
        },
        getCurrentSpan: () => {
            return api_1.trace.getActiveSpan();
        },
        addAttribute: (key, value) => {
            const span = api_1.trace.getActiveSpan();
            if (span) {
                span.setAttribute(key, value);
            }
        },
    });
    // Decorate fastify instance with SDK access
    fastify.decorate('traceLensSDK', sdk);
};
function shouldIgnoreRequest(req, options) {
    // Ignore health checks and static assets by default
    const defaultIgnorePaths = ['/health', '/ping', '/favicon.ico', '/robots.txt'];
    const ignorePaths = [...defaultIgnorePaths, ...(options.ignorePaths || [])];
    if (ignorePaths.some(path => req.url.startsWith(path))) {
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
// Export as fastify plugin
exports.default = (0, fastify_plugin_1.default)(traceLensPlugin, {
    fastify: '4.x',
    name: 'tracelens',
});
