"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchRateLimiter = exports.rateLimiter = void 0;
// Rate limiting middleware
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Create rate limiter for API endpoints
exports.rateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => {
        // Use project ID if available, otherwise fall back to IP
        const projectId = req.projectId;
        return projectId || req.ip || 'unknown';
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.round(60) // seconds
        });
    }
});
// Stricter rate limiter for batch endpoints
exports.batchRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each project to 100 batch requests per minute
    message: {
        success: false,
        error: 'Batch rate limit exceeded',
        message: 'Too many batch requests. Please reduce request frequency.'
    },
    keyGenerator: (req) => {
        const projectId = req.projectId;
        return `batch:${projectId || req.ip || 'unknown'}`;
    }
});
