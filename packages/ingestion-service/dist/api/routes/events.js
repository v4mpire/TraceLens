"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Event ingestion endpoints for TraceLens
const express_1 = require("express");
const event_validator_1 = require("../../validators/event-validator");
const data_sanitizer_1 = require("../../sanitizers/data-sanitizer");
const auth_1 = require("../../middleware/auth");
const rate_limiter_1 = require("../../middleware/rate-limiter");
const router = (0, express_1.Router)();
const eventValidator = new event_validator_1.EventValidator();
const dataSanitizer = new data_sanitizer_1.DataSanitizer();
// Batch event ingestion endpoint
router.post('/batch', auth_1.authenticateApiKey, rate_limiter_1.rateLimiter, async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const projectId = req.projectId;
        const db = req.db;
        if (!Array.isArray(req.body)) {
            res.status(400).json({
                success: false,
                error: 'Request body must be an array of events'
            });
            return;
        }
        // Validate and sanitize events
        const validatedEvents = eventValidator.validateEventBatch(req.body);
        const sanitizedEvents = validatedEvents.map(event => dataSanitizer.sanitizeEvent(event));
        // Store events in database
        await db.insertPerformanceEventBatch(projectId, sanitizedEvents);
        const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(200).json({
            success: true,
            processed: sanitizedEvents.length,
            processingTime: Math.round(processingTime * 100) / 100,
            message: 'Events processed successfully'
        });
    }
    catch (error) {
        const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        if (error instanceof Error && error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.message,
                processingTime: Math.round(processingTime * 100) / 100
            });
        }
        else {
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
router.post('/single', auth_1.authenticateApiKey, rate_limiter_1.rateLimiter, async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const projectId = req.projectId;
        const db = req.db;
        // Validate and sanitize event
        const validatedEvent = eventValidator.validateEvent(req.body);
        const sanitizedEvent = dataSanitizer.sanitizeEvent(validatedEvent);
        // Store event in database
        await db.insertPerformanceEvent(projectId, sanitizedEvent);
        const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(200).json({
            success: true,
            eventId: sanitizedEvent.id,
            processingTime: Math.round(processingTime * 100) / 100,
            message: 'Event processed successfully'
        });
    }
    catch (error) {
        const processingTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        if (error instanceof Error && error.name === 'ValidationError') {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.message,
                processingTime: Math.round(processingTime * 100) / 100
            });
        }
        else {
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
router.get('/', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const projectId = req.projectId;
        const db = req.db;
        const eventType = req.query.type;
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const offset = parseInt(req.query.offset) || 0;
        const events = await db.getPerformanceEventsByProject(projectId, eventType, limit, offset);
        res.json({
            success: true,
            events,
            count: events.length,
            limit,
            offset
        });
    }
    catch (error) {
        console.error('Event query error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
