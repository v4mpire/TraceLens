// Rate limiting middleware
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Create rate limiter for API endpoints
export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): string => {
    // Use project ID if available, otherwise fall back to IP
    const projectId = (req as any).projectId;
    return projectId || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(60) // seconds
    });
  }
});

// Stricter rate limiter for batch endpoints
export const batchRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each project to 100 batch requests per minute
  message: {
    success: false,
    error: 'Batch rate limit exceeded',
    message: 'Too many batch requests. Please reduce request frequency.'
  },
  keyGenerator: (req: Request): string => {
    const projectId = (req as any).projectId;
    return `batch:${projectId || req.ip || 'unknown'}`;
  }
});
