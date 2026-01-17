// OpenTelemetry trace ingestion endpoints
import { Router, Request, Response } from 'express';
import { TraceNormalizer } from '../../normalizers/trace-normalizer';
import { DataSanitizer } from '../../sanitizers/data-sanitizer';
import { DatabaseManager } from '../../database/database-manager';
import { authenticateApiKey } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rate-limiter';
import { TraceSpan, Trace } from '@tracelens/shared';

const router = Router();
const traceNormalizer = new TraceNormalizer();
const dataSanitizer = new DataSanitizer();

// OTLP trace ingestion endpoint (OpenTelemetry standard)
router.post('/otlp', authenticateApiKey, rateLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = process.hrtime.bigint();
  
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;
    
    const contentType = req.get('Content-Type');
    
    // Support both JSON and protobuf (simplified to JSON for now)
    if (!contentType?.includes('application/json')) {
      res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json'
      });
      return;
    }

    const { resourceSpans } = req.body;
    
    if (!resourceSpans || !Array.isArray(resourceSpans)) {
      res.status(400).json({
        error: 'Invalid OTLP format',
        message: 'resourceSpans array is required'
      });
      return;
    }

    let processedCount = 0;
    const errors: string[] = [];

    // Process each resource span
    for (const resourceSpan of resourceSpans) {
      try {
        const traces = traceNormalizer.normalizeOTLPResourceSpan(resourceSpan);
        
        // Sanitize and store traces
        for (const trace of traces) {
          const sanitizedTrace = dataSanitizer.sanitizeTrace(trace as unknown as Record<string, unknown>) as unknown as Trace;
          await db.insertTrace(projectId, sanitizedTrace);
          processedCount++;
        }
      } catch (error) {
        errors.push(`Resource span error: ${error instanceof Error ? error.message : 'Invalid format'}`);
      }
    }

    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;

    res.status(200).json({
      success: true,
      processed: processedCount,
      errors: errors.length,
      processingTime: Math.round(processingTime * 100) / 100
    });

  } catch (error) {
    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
    
    console.error('OTLP trace ingestion error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      processingTime: Math.round(processingTime * 100) / 100,
      message: 'Failed to process traces'
    });
  }
});

// TraceLens native trace format
router.post('/native', authenticateApiKey, rateLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = process.hrtime.bigint();
  
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;

    if (!Array.isArray(req.body)) {
      res.status(400).json({
        error: 'Invalid request format',
        message: 'Request body must be an array of traces'
      });
      return;
    }

    if (req.body.length > 100) {
      res.status(413).json({
        error: 'Batch too large',
        message: 'Maximum 100 traces per batch'
      });
      return;
    }

    let processedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < req.body.length; i++) {
      try {
        const normalizedTrace = traceNormalizer.normalizeTrace(req.body[i]);
        const sanitizedTrace = dataSanitizer.sanitizeTrace(normalizedTrace as unknown as Record<string, unknown>) as unknown as Trace;
        await db.insertTrace(projectId, sanitizedTrace);
        processedCount++;
      } catch (error) {
        errors.push(`Trace ${i}: ${error instanceof Error ? error.message : 'Invalid trace'}`);
      }
    }

    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;

    res.status(200).json({
      success: true,
      processed: processedCount,
      errors: errors.length,
      processingTime: Math.round(processingTime * 100) / 100,
      message: 'Traces processed successfully'
    });

  } catch (error) {
    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
    
    console.error('Native trace ingestion error:', error);
    
    res.status(500).json({
      error: 'Internal server error',
      processingTime: Math.round(processingTime * 100) / 100,
      message: 'Failed to process traces'
    });
  }
});

// Trace query endpoint
router.get('/', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;
    
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const traces = await db.getTracesByProject(projectId, limit, offset);

    res.json({
      success: true,
      traces,
      count: traces.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Trace query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
