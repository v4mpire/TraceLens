"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Service health checks and monitoring endpoints
const express_1 = require("express");
const router = (0, express_1.Router)();
// Basic health check
router.get('/', async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const db = req.db;
        const isHealthy = await db.isHealthy();
        const health = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '0.1.0',
            environment: process.env.NODE_ENV || 'development',
            database: isHealthy ? 'connected' : 'disconnected'
        };
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(isHealthy ? 200 : 503).json({
            ...health,
            responseTime: Math.round(responseTime * 100) / 100
        });
    }
    catch (error) {
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: Math.round(responseTime * 100) / 100
        });
    }
});
// Detailed health check
router.get('/detailed', async (req, res) => {
    const startTime = process.hrtime.bigint();
    try {
        const db = req.db;
        // Check database connectivity
        const dbStartTime = Date.now();
        const dbHealthy = await db.isHealthy();
        const dbLatency = Date.now() - dbStartTime;
        const overallStatus = dbHealthy ? 'healthy' : 'unhealthy';
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(overallStatus === 'healthy' ? 200 : 503).json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            responseTime: Math.round(responseTime * 100) / 100,
            checks: {
                database: {
                    status: dbHealthy ? 'healthy' : 'unhealthy',
                    latency: dbLatency
                }
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                version: process.env.npm_package_version || '0.1.0',
                environment: process.env.NODE_ENV || 'development'
            }
        });
    }
    catch (error) {
        const responseTime = Number(process.hrtime.bigint() - startTime) / 1000000;
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            responseTime: Math.round(responseTime * 100) / 100,
            error: error instanceof Error ? error.message : 'Health check failed'
        });
    }
});
// Readiness probe (Kubernetes-style)
router.get('/ready', async (req, res) => {
    try {
        const db = req.db;
        const isReady = await db.isHealthy();
        if (isReady) {
            res.status(200).json({
                status: 'ready',
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(503).json({
                status: 'not ready',
                timestamp: new Date().toISOString(),
                message: 'Database not available'
            });
        }
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Readiness check failed'
        });
    }
});
// Liveness probe (Kubernetes-style)
router.get('/live', (req, res) => {
    // Simple liveness check - if we can respond, we're alive
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        pid: process.pid
    });
});
exports.default = router;
