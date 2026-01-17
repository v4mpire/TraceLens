export declare const PerformanceEventSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "timestamp", "type", "data", "url", "userAgent"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^[a-zA-Z0-9_-]+$";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly timestamp: {
            readonly type: "number";
            readonly minimum: 1577836800000;
            readonly maximum: 2524608000000;
        };
        readonly type: {
            readonly type: "string";
            readonly enum: readonly ["web-vitals", "resource-timing", "navigation-timing", "long-task"];
        };
        readonly data: {
            readonly oneOf: readonly [{
                readonly $ref: "#/definitions/WebVitalsData";
            }, {
                readonly $ref: "#/definitions/ResourceTimingData";
            }, {
                readonly $ref: "#/definitions/NavigationTimingData";
            }, {
                readonly $ref: "#/definitions/LongTaskData";
            }];
        };
        readonly url: {
            readonly type: "string";
            readonly format: "uri";
            readonly maxLength: 2048;
        };
        readonly userAgent: {
            readonly type: "string";
            readonly maxLength: 512;
        };
    };
    readonly definitions: {
        readonly WebVitalsData: {
            readonly type: "object";
            readonly properties: {
                readonly cls: {
                    readonly $ref: "#/definitions/CLSMetric";
                };
                readonly fid: {
                    readonly $ref: "#/definitions/FIDMetric";
                };
                readonly lcp: {
                    readonly $ref: "#/definitions/LCPMetric";
                };
                readonly fcp: {
                    readonly $ref: "#/definitions/FCPMetric";
                };
                readonly ttfb: {
                    readonly $ref: "#/definitions/TTFBMetric";
                };
                readonly inp: {
                    readonly $ref: "#/definitions/INPMetric";
                };
            };
        };
        readonly BaseMetric: {
            readonly type: "object";
            readonly required: readonly ["name", "value", "rating", "delta", "id", "navigationType"];
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                };
                readonly value: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly rating: {
                    readonly type: "string";
                    readonly enum: readonly ["good", "needs-improvement", "poor"];
                };
                readonly delta: {
                    readonly type: "number";
                };
                readonly id: {
                    readonly type: "string";
                };
                readonly navigationType: {
                    readonly type: "string";
                    readonly enum: readonly ["navigate", "reload", "back-forward", "prerender"];
                };
            };
        };
        readonly CLSMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "CLS";
                    };
                    readonly value: {
                        readonly maximum: 1;
                    };
                };
            }];
        };
        readonly FIDMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "FID";
                    };
                    readonly value: {
                        readonly maximum: 10000;
                    };
                };
            }];
        };
        readonly LCPMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "LCP";
                    };
                    readonly value: {
                        readonly maximum: 30000;
                    };
                };
            }];
        };
        readonly FCPMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "FCP";
                    };
                    readonly value: {
                        readonly maximum: 10000;
                    };
                };
            }];
        };
        readonly TTFBMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "TTFB";
                    };
                    readonly value: {
                        readonly maximum: 5000;
                    };
                };
            }];
        };
        readonly INPMetric: {
            readonly allOf: readonly [{
                readonly $ref: "#/definitions/BaseMetric";
            }, {
                readonly properties: {
                    readonly name: {
                        readonly const: "INP";
                    };
                    readonly value: {
                        readonly maximum: 1000;
                    };
                };
            }];
        };
        readonly ResourceTimingData: {
            readonly type: "object";
            readonly required: readonly ["name", "entryType", "startTime", "duration"];
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                    readonly maxLength: 2048;
                };
                readonly entryType: {
                    readonly const: "resource";
                };
                readonly startTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly duration: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly initiatorType: {
                    readonly type: "string";
                };
                readonly nextHopProtocol: {
                    readonly type: "string";
                };
                readonly renderBlockingStatus: {
                    readonly type: "string";
                };
                readonly responseStatus: {
                    readonly type: "number";
                    readonly minimum: 100;
                    readonly maximum: 599;
                };
                readonly transferSize: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly encodedBodySize: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly decodedBodySize: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly responseStart: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly responseEnd: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
            };
        };
        readonly NavigationTimingData: {
            readonly type: "object";
            readonly required: readonly ["type"];
            readonly properties: {
                readonly domComplete: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly domContentLoadedEventEnd: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly domContentLoadedEventStart: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly domInteractive: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly loadEventEnd: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly loadEventStart: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly redirectCount: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly type: {
                    readonly type: "string";
                    readonly enum: readonly ["navigate", "reload", "back-forward", "prerender"];
                };
                readonly unloadEventEnd: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly unloadEventStart: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
            };
        };
        readonly LongTaskData: {
            readonly type: "object";
            readonly required: readonly ["name", "entryType", "startTime", "duration"];
            readonly properties: {
                readonly name: {
                    readonly const: "longtask";
                };
                readonly entryType: {
                    readonly const: "longtask";
                };
                readonly startTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly duration: {
                    readonly type: "number";
                    readonly minimum: 50;
                };
                readonly attribution: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly properties: {
                            readonly name: {
                                readonly type: "string";
                            };
                            readonly entryType: {
                                readonly const: "taskattribution";
                            };
                            readonly startTime: {
                                readonly type: "number";
                                readonly minimum: 0;
                            };
                            readonly duration: {
                                readonly type: "number";
                                readonly minimum: 0;
                            };
                            readonly containerType: {
                                readonly type: "string";
                            };
                            readonly containerSrc: {
                                readonly type: "string";
                            };
                            readonly containerId: {
                                readonly type: "string";
                            };
                            readonly containerName: {
                                readonly type: "string";
                            };
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=performance.schema.d.ts.map