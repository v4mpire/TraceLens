"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// OpenTelemetry trace ingestion endpoints
const express_1 = require("express");
const trace_normalizer_1 = require("../../normalizers/trace-normalizer");
const data_sanitizer_1 = require("../../sanitizers/data-sanitizer");
const auth_1 = require("../../middleware/auth");
const rate_limiter_1 = require("../../middleware/rate-limiter");
const router = (0, express_1.Router)();
const traceNormalizer = new trace_normalizer_1.TraceNormalizer();
const dataSanitizer = new data_sanitizer_1.DataSanitizer();
// OTLP trace ingestion endpoint (OpenTelemetry standard)
router.post('/otlp', auth_1.authenticateApiKey, rate_limiter_1.rateLimiter, async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const projectId = req.projectId;
        const db = req.db;
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
        const errors = [];
        // Process each resource span
        for (const resourceSpan of resourceSpans) {
            try {
                const traces = traceNormalizer.normalizeOTLPResourceSpan(resourceSpan);
                // Sanitize and store traces
                for (const trace of traces) {
                    const sanitizedTrace = dataSanitizer.sanitizeTrace(trace);
                    await db.insertTrace(projectId, sanitizedTrace);
                    processedCount++;
                }
            }
            catch (error) {
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
    }
    catch (error) {
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
router.post('/native', auth_1.authenticateApiKey, rate_limiter_1.rateLimiter, async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const projectId = req.projectId;
        const db = req.db;
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
        const errors = [];
        for (let i = 0; i < req.body.length; i++) {
            try {
                const normalizedTrace = traceNormalizer.normalizeTrace(req.body[i]);
                const sanitizedTrace = dataSanitizer.sanitizeTrace(normalizedTrace);
                await db.insertTrace(projectId, sanitizedTrace);
                processedCount++;
            }
            catch (error) {
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
    }
    catch (error) {
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
router.get('/', auth_1.authenticateApiKey, async (req, res) => {
    try {
        const projectId = req.projectId;
        const db = req.db;
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
        const offset = parseInt(req.query.offset) || 0;
        const traces = await db.getTracesByProject(projectId, limit, offset);
        res.json({
            success: true,
            traces,
            count: traces.length,
            limit,
            offset
        });
    }
    catch (error) {
        console.error('Trace query error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
