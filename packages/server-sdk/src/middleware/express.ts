// Express.js middleware for TraceLens
import { Request, Response, NextFunction } from 'express';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { TraceLensServerSDK, ServerSDKConfig } from '../core/tracer';

export interface TraceLensExpressOptions extends Partial<ServerSDKConfig> {
  ignorePaths?: string[];
  ignoreIncomingRequestHook?: (req: Request) => boolean;
  requestHook?: (span: any, req: Request) => void;
  responseHook?: (span: any, res: Response) => void;
}

export function createTraceLensMiddleware(options: TraceLensExpressOptions = {}) {
  const sdk = new TraceLensServerSDK(options);
  const tracer = trace.getTracer('tracelens-express');
  
  // Initialize SDK
  sdk.initialize().catch(error => {
    console.error('Failed to initialize TraceLens SDK:', error);
  });

  return function traceLensMiddleware(req: Request, res: Response, next: NextFunction) {
    // Check if request should be ignored
    if (shouldIgnoreRequest(req, options)) {
      return next();
    }

    const startTime = process.hrtime.bigint();
    const spanName = `${req.method} ${req.route?.path || req.path}`;
    
    const span = tracer.startSpan(spanName, {
      kind: SpanKind.SERVER,
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
      } catch (error) {
        console.warn('Error in TraceLens request hook:', error);
      }
    }

    // Wrap response to capture response data
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(body: any) {
      captureResponse(span, res, body, startTime, options);
      return originalSend.call(this, body);
    };

    res.json = function(body: any) {
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
    context.with(trace.setSpan(context.active(), span), () => {
      next();
    });
  };
}

function shouldIgnoreRequest(req: Request, options: TraceLensExpressOptions): boolean {
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
    } catch (error) {
      console.warn('Error in TraceLens ignore hook:', error);
    }
  }

  return false;
}

function captureResponse(
  span: any, 
  res: Response, 
  body: any, 
  startTime: bigint, 
  options: TraceLensExpressOptions
) {
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
      code: SpanStatusCode.ERROR,
      message: `HTTP ${res.statusCode}`,
    });
  } else {
    span.setStatus({ code: SpanStatusCode.OK });
  }

  // Add custom response attributes
  if (options.responseHook) {
    try {
      options.responseHook(span, res);
    } catch (error) {
      console.warn('Error in TraceLens response hook:', error);
    }
  }

  span.end();
}

// Utility function to get SDK instance for manual instrumentation
export function getTraceLensSDK(): TraceLensServerSDK | null {
  // This would need to be implemented with a global registry
  // For now, return null and require manual SDK management
  return null;
}

// Decorator for automatic function tracing
export function traced(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    const tracer = trace.getTracer('tracelens-decorator');
    const span = tracer.startSpan(`${target.constructor.name}.${propertyName}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'function.class': target.constructor.name,
        'function.method': propertyName,
        'function.args.count': args.length,
      },
    });

    return context.with(trace.setSpan(context.active(), span), () => {
      try {
        const result = method.apply(this, args);
        
        // Handle promises
        if (result && typeof result.then === 'function') {
          return result
            .then((value: any) => {
              span.setStatus({ code: SpanStatusCode.OK });
              span.end();
              return value;
            })
            .catch((error: any) => {
              span.recordException(error);
              span.setStatus({ 
                code: SpanStatusCode.ERROR, 
                message: error.message 
              });
              span.end();
              throw error;
            });
        }
        
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error: any) {
        span.recordException(error);
        span.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: error.message 
        });
        span.end();
        throw error;
      }
    });
  };

  return descriptor;
}
