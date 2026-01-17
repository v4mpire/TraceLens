// Event ingestion endpoints for TraceLens
import { Router, Request, Response } from 'express';
import { EventValidator } from '../../validators/event-validator';
import { DataSanitizer } from '../../sanitizers/data-sanitizer';
import { DatabaseManager } from '../../database/database-manager';
import { authenticateApiKey } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rate-limiter';
import { PerformanceEvent } from '@tracelens/shared';

const router = Router();
const eventValidator = new EventValidator();
const dataSanitizer = new DataSanitizer();

// Batch event ingestion endpoint
router.post('/batch', authenticateApiKey, rateLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = process.hrtime.bigint();
  
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;

    if (!Array.isArray(req.body)) {
      res.status(400).json({
        success: false,
        error: 'Request body must be an array of events'
      });
      return;
    }

    // Validate and sanitize events
    const validatedEvents = eventValidator.validateEventBatch(req.body);
    const sanitizedEvents = validatedEvents.map(event => dataSanitizer.sanitizeEvent(event as unknown as Record<string, unknown>) as unknown as PerformanceEvent);

    // Store events in database
    await db.insertPerformanceEventBatch(projectId, sanitizedEvents);

    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;

    res.status(200).json({
      success: true,
      processed: sanitizedEvents.length,
      processingTime: Math.round(processingTime * 100) / 100,
      message: 'Events processed successfully'
    });

  } catch (error) {
    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
    
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
        processingTime: Math.round(processingTime * 100) / 100
      });
    } else {
      console.error('Batch event ingestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        processingTime: Math.round(processingTime * 100) / 100
      });
    }
  }
});

// Single event ingestion endpoint
router.post('/single', authenticateApiKey, rateLimiter, async (req: Request, res: Response): Promise<void> => {
  const startTime = process.hrtime.bigint();
  
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;

    // Validate and sanitize event
    const validatedEvent = eventValidator.validateEvent(req.body);
    const sanitizedEvent = dataSanitizer.sanitizeEvent(validatedEvent as unknown as Record<string, unknown>) as unknown as PerformanceEvent;

    // Store event in database
    await db.insertPerformanceEvent(projectId, sanitizedEvent);

    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;

    res.status(200).json({
      success: true,
      eventId: sanitizedEvent.id,
      processingTime: Math.round(processingTime * 100) / 100,
      message: 'Event processed successfully'
    });

  } catch (error) {
    const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
    
    if (error instanceof Error && error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.message,
        processingTime: Math.round(processingTime * 100) / 100
      });
    } else {
      console.error('Single event ingestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        processingTime: Math.round(processingTime * 100) / 100
      });
    }
  }
});

// Event query endpoint
router.get('/', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const projectId = (req as any).projectId;
    const db = (req as any).db as DatabaseManager;
    
    const eventType = req.query.type as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const events = await db.getPerformanceEventsByProject(projectId, eventType, limit, offset);

    res.json({
      success: true,
      events,
      count: events.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Event query error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
