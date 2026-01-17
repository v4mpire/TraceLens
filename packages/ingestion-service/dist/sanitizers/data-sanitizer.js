"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSanitizer = void 0;
class DataSanitizer {
    constructor(config = {}) {
        // Common PII patterns
        this.piiPatterns = [
            { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
            { name: 'phone', pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE]' },
            { name: 'ssn', pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g, replacement: '[SSN]' },
            { name: 'creditCard', pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CARD]' },
            { name: 'ipAddress', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: '[IP]' },
            { name: 'uuid', pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, replacement: '[UUID]' }
        ];
        // Sensitive field names
        this.sensitiveFields = new Set([
            'password', 'passwd', 'pwd', 'secret', 'token', 'key', 'auth', 'authorization',
            'cookie', 'session', 'csrf', 'api_key', 'apikey', 'access_token', 'refresh_token',
            'private_key', 'public_key', 'certificate', 'cert', 'signature', 'hash'
        ]);
        this.config = {
            enablePIIFiltering: true,
            enableDataSanitization: true,
            customPatterns: [],
            allowedDomains: [],
            maxStringLength: 1000,
            maxObjectDepth: 10,
            ...config
        };
    }
    sanitizeEvent(event) {
        if (!this.config.enableDataSanitization) {
            return event;
        }
        return this.sanitizeObject(event, 0);
    }
    sanitizeTrace(trace) {
        if (!this.config.enableDataSanitization) {
            return trace;
        }
        const sanitized = { ...trace };
        // Sanitize spans
        if (Array.isArray(sanitized.spans)) {
            sanitized.spans = sanitized.spans.map(span => this.sanitizeSpan(span));
        }
        return sanitized;
    }
    sanitizeSpan(span) {
        if (!span || typeof span !== 'object') {
            return span;
        }
        const s = span;
        const sanitized = { ...s };
        // Sanitize tags
        if (sanitized.tags && typeof sanitized.tags === 'object') {
            sanitized.tags = this.sanitizeObject(sanitized.tags, 0);
        }
        // Sanitize logs
        if (Array.isArray(sanitized.logs)) {
            sanitized.logs = sanitized.logs.map(log => {
                if (log && typeof log === 'object') {
                    const l = log;
                    return {
                        ...l,
                        fields: l.fields ? this.sanitizeObject(l.fields, 0) : {}
                    };
                }
                return log;
            });
        }
        // Sanitize operation name
        if (typeof sanitized.operationName === 'string') {
            sanitized.operationName = this.sanitizeString(sanitized.operationName);
        }
        return sanitized;
    }
    sanitizeObject(obj, depth) {
        if (depth > this.config.maxObjectDepth) {
            return '[TRUNCATED_DEPTH]';
        }
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }
        if (typeof obj === 'number' || typeof obj === 'boolean') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item, depth + 1));
        }
        if (typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                const sanitizedKey = this.sanitizeString(key);
                // Check if field is sensitive
                if (this.isSensitiveField(key)) {
                    sanitized[sanitizedKey] = '[REDACTED]';
                }
                else {
                    sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
                }
            }
            return sanitized;
        }
        return obj;
    }
    sanitizeString(str) {
        if (typeof str !== 'string') {
            return str;
        }
        let sanitized = str;
        // Truncate if too long
        if (sanitized.length > this.config.maxStringLength) {
            sanitized = sanitized.substring(0, this.config.maxStringLength) + '[TRUNCATED]';
        }
        // Apply PII filtering
        if (this.config.enablePIIFiltering) {
            // Apply built-in PII patterns
            for (const pattern of this.piiPatterns) {
                sanitized = sanitized.replace(pattern.pattern, pattern.replacement);
            }
            // Apply custom patterns
            for (const pattern of this.config.customPatterns) {
                sanitized = sanitized.replace(pattern.pattern, pattern.replacement);
            }
        }
        // Sanitize URLs
        sanitized = this.sanitizeUrl(sanitized);
        return sanitized;
    }
    sanitizeUrl(str) {
        try {
            const url = new URL(str);
            // Check if domain is allowed
            if (this.config.allowedDomains.length > 0) {
                const isAllowed = this.config.allowedDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain));
                if (!isAllowed) {
                    return '[EXTERNAL_URL]';
                }
            }
            // Remove sensitive query parameters
            const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth', 'session'];
            for (const param of sensitiveParams) {
                if (url.searchParams.has(param)) {
                    url.searchParams.set(param, '[REDACTED]');
                }
            }
            return url.toString();
        }
        catch {
            // Not a valid URL, return as-is
            return str;
        }
    }
    isSensitiveField(fieldName) {
        const lowerField = fieldName.toLowerCase();
        // Check exact matches
        if (this.sensitiveFields.has(lowerField)) {
            return true;
        }
        // Check if field contains sensitive keywords
        for (const sensitive of this.sensitiveFields) {
            if (lowerField.includes(sensitive)) {
                return true;
            }
        }
        return false;
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
    }
    addCustomPattern(name, pattern, replacement) {
        this.config.customPatterns.push({ name, pattern, replacement });
    }
    removeCustomPattern(name) {
        this.config.customPatterns = this.config.customPatterns.filter(p => p.name !== name);
    }
}
exports.DataSanitizer = DataSanitizer;
