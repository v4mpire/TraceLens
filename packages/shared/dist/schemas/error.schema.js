// Error event schema for TraceLens
export const ErrorEventSchema = {
    type: 'object',
    required: ['id', 'timestamp', 'type', 'message', 'source', 'projectId'],
    properties: {
        id: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_-]+$',
            minLength: 1,
            maxLength: 100,
            description: 'Unique identifier for this error event'
        },
        timestamp: {
            type: 'number',
            minimum: 1577836800000, // 2020-01-01
            maximum: 2524608000000, // 2050-01-01
            description: 'Error timestamp in milliseconds since epoch'
        },
        type: {
            type: 'string',
            enum: [
                'javascript-error',
                'unhandled-promise-rejection',
                'resource-error',
                'network-error',
                'csp-violation',
                'server-error',
                'database-error',
                'validation-error'
            ],
            description: 'Type of error that occurred'
        },
        message: {
            type: 'string',
            maxLength: 2048,
            description: 'Error message'
        },
        source: {
            type: 'string',
            enum: ['browser', 'server', 'network'],
            description: 'Source of the error'
        },
        projectId: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_-]+$',
            minLength: 3,
            maxLength: 50,
            description: 'Project identifier'
        },
        stack: {
            type: 'string',
            maxLength: 8192,
            description: 'Error stack trace'
        },
        filename: {
            type: 'string',
            maxLength: 1024,
            description: 'File where error occurred'
        },
        lineno: {
            type: 'number',
            minimum: 0,
            description: 'Line number where error occurred'
        },
        colno: {
            type: 'number',
            minimum: 0,
            description: 'Column number where error occurred'
        },
        url: {
            type: 'string',
            format: 'uri',
            maxLength: 2048,
            description: 'URL where error occurred'
        },
        userAgent: {
            type: 'string',
            maxLength: 512,
            description: 'User agent string'
        },
        userId: {
            type: 'string',
            maxLength: 100,
            description: 'User identifier (if available)'
        },
        sessionId: {
            type: 'string',
            maxLength: 100,
            description: 'Session identifier'
        },
        traceId: {
            type: 'string',
            pattern: '^[a-f0-9]{32}$',
            description: 'Associated trace ID if available'
        },
        spanId: {
            type: 'string',
            pattern: '^[a-f0-9]{16}$',
            description: 'Associated span ID if available'
        },
        severity: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'critical'],
            description: 'Error severity level'
        },
        tags: {
            type: 'object',
            patternProperties: {
                '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                    oneOf: [
                        { type: 'string', maxLength: 256 },
                        { type: 'number' },
                        { type: 'boolean' }
                    ]
                }
            },
            additionalProperties: false,
            maxProperties: 50,
            description: 'Additional tags for categorization'
        },
        context: {
            type: 'object',
            properties: {
                component: {
                    type: 'string',
                    maxLength: 256,
                    description: 'Component where error occurred'
                },
                action: {
                    type: 'string',
                    maxLength: 256,
                    description: 'Action being performed when error occurred'
                },
                environment: {
                    type: 'string',
                    enum: ['development', 'staging', 'production'],
                    description: 'Environment where error occurred'
                },
                version: {
                    type: 'string',
                    maxLength: 50,
                    description: 'Application version'
                },
                buildId: {
                    type: 'string',
                    maxLength: 100,
                    description: 'Build identifier'
                }
            },
            additionalProperties: false,
            description: 'Additional context about the error'
        },
        fingerprint: {
            type: 'string',
            pattern: '^[a-f0-9]{32}$',
            description: 'Error fingerprint for grouping similar errors'
        },
        count: {
            type: 'number',
            minimum: 1,
            default: 1,
            description: 'Number of times this error occurred'
        },
        firstSeen: {
            type: 'number',
            minimum: 1577836800000,
            description: 'Timestamp when this error was first seen'
        },
        lastSeen: {
            type: 'number',
            minimum: 1577836800000,
            description: 'Timestamp when this error was last seen'
        }
    },
    additionalProperties: false
};
