// Fastify plugin for TraceLens
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { TraceLensServerSDK, ServerSDKConfig } from '../core/tracer';

export interface TraceLensFastifyOptions extends Partial<ServerSDKConfig> {
  ignorePaths?: string[];
  ignoreIncomingRequestHook?: (req: FastifyRequest) => boolean;
  requestHook?: (span: any, req: FastifyRequest) => void;
  responseHook?: (span: any, reply: FastifyReply) => void;
}

const traceLensPlugin: FastifyPluginAsync<TraceLensFastifyOptions> = async (fastify, options) => {
  const sdk = new TraceLensServerSDK(options);
  const tracer = trace.getTracer('tracelens-fastify');
  
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
      kind: SpanKind.SERVER,
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
      } catch (error) {
        console.warn('Error in TraceLens request hook:', error);
      }
    }
  });

  fastify.addHook('onResponse', async (request, reply) => {
    const span = request.traceLensSpan;
    const startTime = request.traceLensStartTime;
    
    if (!span || !startTime) return;

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
        code: SpanStatusCode.ERROR,
        message: `HTTP ${reply.statusCode}`,
      });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    // Add custom response attributes
    if (options.responseHook) {
      try {
        options.responseHook(span, reply);
      } catch (error) {
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
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
    }
  });

  // Decorate request with TraceLens utilities
  fastify.decorateRequest('traceLens', {
    createSpan: (name: string, attributes?: Record<string, string | number | boolean>) => {
      return tracer.startSpan(name, {
        kind: SpanKind.INTERNAL,
        attributes,
      });
    },
    getCurrentSpan: () => {
      return trace.getActiveSpan();
    },
    addAttribute: (key: string, value: string | number | boolean) => {
      const span = trace.getActiveSpan();
      if (span) {
        span.setAttribute(key, value);
      }
    },
  });

  // Decorate fastify instance with SDK access
  fastify.decorate('traceLensSDK', sdk);
};

function shouldIgnoreRequest(req: FastifyRequest, options: TraceLensFastifyOptions): boolean {
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
    } catch (error) {
      console.warn('Error in TraceLens ignore hook:', error);
    }
  }

  return false;
}

// Export as fastify plugin
export default fp(traceLensPlugin, {
  fastify: '4.x',
  name: 'tracelens',
});

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyRequest {
    traceLensSpan?: any;
    traceLensStartTime?: bigint;
    traceLens: {
      createSpan: (name: string, attributes?: Record<string, string | number | boolean>) => any;
      getCurrentSpan: () => any;
      addAttribute: (key: string, value: string | number | boolean) => void;
    };
  }

  interface FastifyInstance {
    traceLensSDK: TraceLensServerSDK;
  }
}
