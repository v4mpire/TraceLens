export declare const ErrorEventSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "timestamp", "type", "message", "source", "projectId"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^[a-zA-Z0-9_-]+$";
            readonly minLength: 1;
            readonly maxLength: 100;
            readonly description: "Unique identifier for this error event";
        };
        readonly timestamp: {
            readonly type: "number";
            readonly minimum: 1577836800000;
            readonly maximum: 2524608000000;
            readonly description: "Error timestamp in milliseconds since epoch";
        };
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["javascript-error", "unhandled-promise-rejection", "resource-error", "network-error", "csp-violation", "server-error", "database-error", "validation-error"];
            readonly description: "Type of error that occurred";
        };
        readonly message: {
            readonly type: "string";
            readonly maxLength: 2048;
            readonly description: "Error message";
        };
        readonly source: {
            readonly type: "string";
            readonly enum: readonly ["browser", "server", "network"];
            readonly description: "Source of the error";
        };
        readonly projectId: {
            readonly type: "string";
            readonly pattern: "^[a-zA-Z0-9_-]+$";
            readonly minLength: 3;
            readonly maxLength: 50;
            readonly description: "Project identifier";
        };
        readonly stack: {
            readonly type: "string";
            readonly maxLength: 8192;
            readonly description: "Error stack trace";
        };
        readonly filename: {
            readonly type: "string";
            readonly maxLength: 1024;
            readonly description: "File where error occurred";
        };
        readonly lineno: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Line number where error occurred";
        };
        readonly colno: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Column number where error occurred";
        };
        readonly url: {
            readonly type: "string";
            readonly format: "uri";
            readonly maxLength: 2048;
            readonly description: "URL where error occurred";
        };
        readonly userAgent: {
            readonly type: "string";
            readonly maxLength: 512;
            readonly description: "User agent string";
        };
        readonly userId: {
            readonly type: "string";
            readonly maxLength: 100;
            readonly description: "User identifier (if available)";
        };
        readonly sessionId: {
            readonly type: "string";
            readonly maxLength: 100;
            readonly description: "Session identifier";
        };
        readonly traceId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{32}$";
            readonly description: "Associated trace ID if available";
        };
        readonly spanId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{16}$";
            readonly description: "Associated span ID if available";
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: readonly ["low", "medium", "high", "critical"];
            readonly description: "Error severity level";
        };
        readonly tags: {
            readonly type: "object";
            readonly patternProperties: {
                readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly maxLength: 256;
                    }, {
                        readonly type: "number";
                    }, {
                        readonly type: "boolean";
                    }];
                };
            };
            readonly additionalProperties: false;
            readonly maxProperties: 50;
            readonly description: "Additional tags for categorization";
        };
        readonly context: {
            readonly type: "object";
            readonly properties: {
                readonly component: {
                    readonly type: "string";
                    readonly maxLength: 256;
                    readonly description: "Component where error occurred";
                };
                readonly action: {
                    readonly type: "string";
                    readonly maxLength: 256;
                    readonly description: "Action being performed when error occurred";
                };
                readonly environment: {
                    readonly type: "string";
                    readonly enum: readonly ["development", "staging", "production"];
                    readonly description: "Environment where error occurred";
                };
                readonly version: {
                    readonly type: "string";
                    readonly maxLength: 50;
                    readonly description: "Application version";
                };
                readonly buildId: {
                    readonly type: "string";
                    readonly maxLength: 100;
                    readonly description: "Build identifier";
                };
            };
            readonly additionalProperties: false;
            readonly description: "Additional context about the error";
        };
        readonly fingerprint: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{32}$";
            readonly description: "Error fingerprint for grouping similar errors";
        };
        readonly count: {
            readonly type: "number";
            readonly minimum: 1;
            readonly default: 1;
            readonly description: "Number of times this error occurred";
        };
        readonly firstSeen: {
            readonly type: "number";
            readonly minimum: 1577836800000;
            readonly description: "Timestamp when this error was first seen";
        };
        readonly lastSeen: {
            readonly type: "number";
            readonly minimum: 1577836800000;
            readonly description: "Timestamp when this error was last seen";
        };
    };
    readonly additionalProperties: false;
};
//# sourceMappingURL=error.schema.d.ts.map