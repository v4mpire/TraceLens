"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.AuthMiddleware = void 0;
class AuthMiddleware {
    constructor() {
        // Main authentication middleware
        this.authenticate = (req, res, next) => {
            const apiKey = this.extractApiKey(req);
            if (!apiKey) {
                res.status(401).json({
                    error: 'Authentication required',
                    message: 'API key must be provided via Authorization header or X-API-Key header'
                });
                return;
            }
            const keyInfo = this.validApiKeys.get(apiKey);
            if (!keyInfo) {
                res.status(401).json({
                    error: 'Invalid API key',
                    message: 'The provided API key is not valid'
                });
                return;
            }
            // Add project information to request
            req.projectKey = apiKey;
            req.projectId = keyInfo.projectId;
            next();
        };
        // Optional authentication (allows unauthenticated requests)
        this.optionalAuth = (req, res, next) => {
            const apiKey = this.extractApiKey(req);
            if (apiKey) {
                const keyInfo = this.validApiKeys.get(apiKey);
                if (keyInfo) {
                    req.projectKey = apiKey;
                    req.projectId = keyInfo.projectId;
                }
            }
            next();
        };
        // Permission-based authorization
        this.requirePermission = (permission) => {
            return (req, res, next) => {
                if (!req.projectKey) {
                    res.status(401).json({
                        error: 'Authentication required',
                        message: 'API key required for this operation'
                    });
                    return;
                }
                const keyInfo = this.validApiKeys.get(req.projectKey);
                if (!keyInfo || !keyInfo.permissions.includes(permission)) {
                    res.status(403).json({
                        error: 'Insufficient permissions',
                        message: `This operation requires '${permission}' permission`
                    });
                    return;
                }
                next();
            };
        };
        this.validApiKeys = new Map();
        this.loadApiKeys();
    }
    // Extract API key from request headers
    extractApiKey(req) {
        // Check Authorization header (Bearer token)
        const authHeader = req.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        // Check X-API-Key header
        const apiKeyHeader = req.get('X-API-Key');
        if (apiKeyHeader) {
            return apiKeyHeader;
        }
        // Check X-Project-Key header (legacy support)
        const projectKeyHeader = req.get('X-Project-Key');
        if (projectKeyHeader) {
            return projectKeyHeader;
        }
        return null;
    }
    // Load API keys from environment or database
    loadApiKeys() {
        // In production, this would load from a database
        // For now, load from environment variables
        const defaultApiKey = process.env.TRACELENS_API_KEY || 'dev-api-key-12345';
        const defaultProjectId = process.env.TRACELENS_PROJECT_ID || 'default-project';
        this.validApiKeys.set(defaultApiKey, {
            projectId: defaultProjectId,
            name: 'Default Development Key',
            permissions: ['events:write', 'traces:write', 'stats:read']
        });
        // Load additional keys from environment
        const additionalKeys = process.env.TRACELENS_ADDITIONAL_KEYS;
        if (additionalKeys) {
            try {
                const keys = JSON.parse(additionalKeys);
                for (const [apiKey, config] of Object.entries(keys)) {
                    this.validApiKeys.set(apiKey, config);
                }
            }
            catch (error) {
                console.warn('Failed to parse additional API keys:', error);
            }
        }
        console.log(`Loaded ${this.validApiKeys.size} API key(s)`);
    }
    // Refresh API keys (for runtime updates)
    refreshApiKeys() {
        this.validApiKeys.clear();
        this.loadApiKeys();
    }
    // Get project information for an API key
    getProjectInfo(apiKey) {
        return this.validApiKeys.get(apiKey) || null;
    }
    // Validate API key format
    static isValidApiKeyFormat(apiKey) {
        // API keys should be at least 20 characters and contain only alphanumeric characters and hyphens
        return /^[a-zA-Z0-9-]{20,}$/.test(apiKey);
    }
}
exports.AuthMiddleware = AuthMiddleware;
// Create singleton instance
exports.authMiddleware = new AuthMiddleware();
