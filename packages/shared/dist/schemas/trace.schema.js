// Trace span event schema for TraceLens
export const TraceSpanSchema = {
    type: 'object',
    required: ['traceId', 'spanId', 'operationName', 'startTime', 'tags', 'status'],
    properties: {
        traceId: {
            type: 'string',
            pattern: '^[a-f0-9]{32}$',
            description: 'Hexadecimal trace ID (32 characters)'
        },
        spanId: {
            type: 'string',
            pattern: '^[a-f0-9]{16}$',
            description: 'Hexadecimal span ID (16 characters)'
        },
        parentSpanId: {
            type: 'string',
            pattern: '^[a-f0-9]{16}$',
            description: 'Hexadecimal parent span ID (16 characters)'
        },
        operationName: {
            type: 'string',
            minLength: 1,
            maxLength: 256,
            description: 'Name of the operation being traced'
        },
        startTime: {
            type: 'number',
            minimum: 0,
            description: 'Start time in microseconds since epoch'
        },
        endTime: {
            type: 'number',
            minimum: 0,
            description: 'End time in microseconds since epoch'
        },
        duration: {
            type: 'number',
            minimum: 0,
            description: 'Duration in microseconds'
        },
        tags: {
            type: 'object',
            patternProperties: {
                '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                    oneOf: [
                        { type: 'string', maxLength: 1024 },
                        { type: 'number' },
                        { type: 'boolean' }
                    ]
                }
            },
            additionalProperties: false,
            description: 'Key-value pairs providing additional context'
        },
        logs: {
            type: 'array',
            items: {
                type: 'object',
                required: ['timestamp', 'fields'],
                properties: {
                    timestamp: {
                        type: 'number',
                        minimum: 0,
                        description: 'Log timestamp in microseconds since epoch'
                    },
                    fields: {
                        type: 'object',
                        patternProperties: {
                            '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                                oneOf: [
                                    { type: 'string', maxLength: 1024 },
                                    { type: 'number' },
                                    { type: 'boolean' }
                                ]
                            }
                        },
                        additionalProperties: false
                    }
                }
            },
            maxItems: 100,
            description: 'Structured log events within the span'
        },
        status: {
            type: 'string',
            enum: [
                'OK',
                'CANCELLED',
                'UNKNOWN',
                'INVALID_ARGUMENT',
                'DEADLINE_EXCEEDED',
                'NOT_FOUND',
                'ALREADY_EXISTS',
                'PERMISSION_DENIED',
                'RESOURCE_EXHAUSTED',
                'FAILED_PRECONDITION',
                'ABORTED',
                'OUT_OF_RANGE',
                'UNIMPLEMENTED',
                'INTERNAL',
                'UNAVAILABLE',
                'DATA_LOSS',
                'UNAUTHENTICATED'
            ],
            description: 'Span status indicating success or failure'
        }
    },
    additionalProperties: false
};
export const TraceSchema = {
    type: 'object',
    required: ['traceId', 'spans', 'startTime'],
    properties: {
        traceId: {
            type: 'string',
            pattern: '^[a-f0-9]{32}$',
            description: 'Hexadecimal trace ID (32 characters)'
        },
        spans: {
            type: 'array',
            items: TraceSpanSchema,
            minItems: 1,
            maxItems: 1000,
            description: 'Array of spans that make up this trace'
        },
        startTime: {
            type: 'number',
            minimum: 0,
            description: 'Trace start time in microseconds since epoch'
        },
        endTime: {
            type: 'number',
            minimum: 0,
            description: 'Trace end time in microseconds since epoch'
        },
        duration: {
            type: 'number',
            minimum: 0,
            description: 'Total trace duration in microseconds'
        },
        rootSpan: TraceSpanSchema
    },
    additionalProperties: false
};
