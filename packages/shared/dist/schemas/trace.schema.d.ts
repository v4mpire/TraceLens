export declare const TraceSpanSchema: {
    readonly type: "object";
    readonly required: readonly ["traceId", "spanId", "operationName", "startTime", "tags", "status"];
    readonly properties: {
        readonly traceId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{32}$";
            readonly description: "Hexadecimal trace ID (32 characters)";
        };
        readonly spanId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{16}$";
            readonly description: "Hexadecimal span ID (16 characters)";
        };
        readonly parentSpanId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{16}$";
            readonly description: "Hexadecimal parent span ID (16 characters)";
        };
        readonly operationName: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 256;
            readonly description: "Name of the operation being traced";
        };
        readonly startTime: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Start time in microseconds since epoch";
        };
        readonly endTime: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "End time in microseconds since epoch";
        };
        readonly duration: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Duration in microseconds";
        };
        readonly tags: {
            readonly type: "object";
            readonly patternProperties: {
                readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                    readonly oneOf: readonly [{
                        readonly type: "string";
                        readonly maxLength: 1024;
                    }, {
                        readonly type: "number";
                    }, {
                        readonly type: "boolean";
                    }];
                };
            };
            readonly additionalProperties: false;
            readonly description: "Key-value pairs providing additional context";
        };
        readonly logs: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["timestamp", "fields"];
                readonly properties: {
                    readonly timestamp: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly description: "Log timestamp in microseconds since epoch";
                    };
                    readonly fields: {
                        readonly type: "object";
                        readonly patternProperties: {
                            readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly maxLength: 1024;
                                }, {
                                    readonly type: "number";
                                }, {
                                    readonly type: "boolean";
                                }];
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
            };
            readonly maxItems: 100;
            readonly description: "Structured log events within the span";
        };
        readonly status: {
            readonly type: "string";
            readonly enum: readonly ["OK", "CANCELLED", "UNKNOWN", "INVALID_ARGUMENT", "DEADLINE_EXCEEDED", "NOT_FOUND", "ALREADY_EXISTS", "PERMISSION_DENIED", "RESOURCE_EXHAUSTED", "FAILED_PRECONDITION", "ABORTED", "OUT_OF_RANGE", "UNIMPLEMENTED", "INTERNAL", "UNAVAILABLE", "DATA_LOSS", "UNAUTHENTICATED"];
            readonly description: "Span status indicating success or failure";
        };
    };
    readonly additionalProperties: false;
};
export declare const TraceSchema: {
    readonly type: "object";
    readonly required: readonly ["traceId", "spans", "startTime"];
    readonly properties: {
        readonly traceId: {
            readonly type: "string";
            readonly pattern: "^[a-f0-9]{32}$";
            readonly description: "Hexadecimal trace ID (32 characters)";
        };
        readonly spans: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["traceId", "spanId", "operationName", "startTime", "tags", "status"];
                readonly properties: {
                    readonly traceId: {
                        readonly type: "string";
                        readonly pattern: "^[a-f0-9]{32}$";
                        readonly description: "Hexadecimal trace ID (32 characters)";
                    };
                    readonly spanId: {
                        readonly type: "string";
                        readonly pattern: "^[a-f0-9]{16}$";
                        readonly description: "Hexadecimal span ID (16 characters)";
                    };
                    readonly parentSpanId: {
                        readonly type: "string";
                        readonly pattern: "^[a-f0-9]{16}$";
                        readonly description: "Hexadecimal parent span ID (16 characters)";
                    };
                    readonly operationName: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly maxLength: 256;
                        readonly description: "Name of the operation being traced";
                    };
                    readonly startTime: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly description: "Start time in microseconds since epoch";
                    };
                    readonly endTime: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly description: "End time in microseconds since epoch";
                    };
                    readonly duration: {
                        readonly type: "number";
                        readonly minimum: 0;
                        readonly description: "Duration in microseconds";
                    };
                    readonly tags: {
                        readonly type: "object";
                        readonly patternProperties: {
                            readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                                readonly oneOf: readonly [{
                                    readonly type: "string";
                                    readonly maxLength: 1024;
                                }, {
                                    readonly type: "number";
                                }, {
                                    readonly type: "boolean";
                                }];
                            };
                        };
                        readonly additionalProperties: false;
                        readonly description: "Key-value pairs providing additional context";
                    };
                    readonly logs: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["timestamp", "fields"];
                            readonly properties: {
                                readonly timestamp: {
                                    readonly type: "number";
                                    readonly minimum: 0;
                                    readonly description: "Log timestamp in microseconds since epoch";
                                };
                                readonly fields: {
                                    readonly type: "object";
                                    readonly patternProperties: {
                                        readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                                            readonly oneOf: readonly [{
                                                readonly type: "string";
                                                readonly maxLength: 1024;
                                            }, {
                                                readonly type: "number";
                                            }, {
                                                readonly type: "boolean";
                                            }];
                                        };
                                    };
                                    readonly additionalProperties: false;
                                };
                            };
                        };
                        readonly maxItems: 100;
                        readonly description: "Structured log events within the span";
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly enum: readonly ["OK", "CANCELLED", "UNKNOWN", "INVALID_ARGUMENT", "DEADLINE_EXCEEDED", "NOT_FOUND", "ALREADY_EXISTS", "PERMISSION_DENIED", "RESOURCE_EXHAUSTED", "FAILED_PRECONDITION", "ABORTED", "OUT_OF_RANGE", "UNIMPLEMENTED", "INTERNAL", "UNAVAILABLE", "DATA_LOSS", "UNAUTHENTICATED"];
                        readonly description: "Span status indicating success or failure";
                    };
                };
                readonly additionalProperties: false;
            };
            readonly minItems: 1;
            readonly maxItems: 1000;
            readonly description: "Array of spans that make up this trace";
        };
        readonly startTime: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Trace start time in microseconds since epoch";
        };
        readonly endTime: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Trace end time in microseconds since epoch";
        };
        readonly duration: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Total trace duration in microseconds";
        };
        readonly rootSpan: {
            readonly type: "object";
            readonly required: readonly ["traceId", "spanId", "operationName", "startTime", "tags", "status"];
            readonly properties: {
                readonly traceId: {
                    readonly type: "string";
                    readonly pattern: "^[a-f0-9]{32}$";
                    readonly description: "Hexadecimal trace ID (32 characters)";
                };
                readonly spanId: {
                    readonly type: "string";
                    readonly pattern: "^[a-f0-9]{16}$";
                    readonly description: "Hexadecimal span ID (16 characters)";
                };
                readonly parentSpanId: {
                    readonly type: "string";
                    readonly pattern: "^[a-f0-9]{16}$";
                    readonly description: "Hexadecimal parent span ID (16 characters)";
                };
                readonly operationName: {
                    readonly type: "string";
                    readonly minLength: 1;
                    readonly maxLength: 256;
                    readonly description: "Name of the operation being traced";
                };
                readonly startTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "Start time in microseconds since epoch";
                };
                readonly endTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "End time in microseconds since epoch";
                };
                readonly duration: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "Duration in microseconds";
                };
                readonly tags: {
                    readonly type: "object";
                    readonly patternProperties: {
                        readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                            readonly oneOf: readonly [{
                                readonly type: "string";
                                readonly maxLength: 1024;
                            }, {
                                readonly type: "number";
                            }, {
                                readonly type: "boolean";
                            }];
                        };
                    };
                    readonly additionalProperties: false;
                    readonly description: "Key-value pairs providing additional context";
                };
                readonly logs: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["timestamp", "fields"];
                        readonly properties: {
                            readonly timestamp: {
                                readonly type: "number";
                                readonly minimum: 0;
                                readonly description: "Log timestamp in microseconds since epoch";
                            };
                            readonly fields: {
                                readonly type: "object";
                                readonly patternProperties: {
                                    readonly '^[a-zA-Z][a-zA-Z0-9._-]*$': {
                                        readonly oneOf: readonly [{
                                            readonly type: "string";
                                            readonly maxLength: 1024;
                                        }, {
                                            readonly type: "number";
                                        }, {
                                            readonly type: "boolean";
                                        }];
                                    };
                                };
                                readonly additionalProperties: false;
                            };
                        };
                    };
                    readonly maxItems: 100;
                    readonly description: "Structured log events within the span";
                };
                readonly status: {
                    readonly type: "string";
                    readonly enum: readonly ["OK", "CANCELLED", "UNKNOWN", "INVALID_ARGUMENT", "DEADLINE_EXCEEDED", "NOT_FOUND", "ALREADY_EXISTS", "PERMISSION_DENIED", "RESOURCE_EXHAUSTED", "FAILED_PRECONDITION", "ABORTED", "OUT_OF_RANGE", "UNIMPLEMENTED", "INTERNAL", "UNAVAILABLE", "DATA_LOSS", "UNAUTHENTICATED"];
                    readonly description: "Span status indicating success or failure";
                };
            };
            readonly additionalProperties: false;
        };
    };
    readonly additionalProperties: false;
};
//# sourceMappingURL=trace.schema.d.ts.map