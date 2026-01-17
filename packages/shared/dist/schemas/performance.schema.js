// Performance timing event schema for TraceLens
export const PerformanceEventSchema = {
    type: 'object',
    required: ['id', 'timestamp', 'type', 'data', 'url', 'userAgent'],
    properties: {
        id: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_-]+$',
            minLength: 1,
            maxLength: 100
        },
        timestamp: {
            type: 'number',
            minimum: 1577836800000, // 2020-01-01
            maximum: 2524608000000 // 2050-01-01
        },
        type: {
            type: 'string',
            enum: ['web-vitals', 'resource-timing', 'navigation-timing', 'long-task']
        },
        data: {
            oneOf: [
                { $ref: '#/definitions/WebVitalsData' },
                { $ref: '#/definitions/ResourceTimingData' },
                { $ref: '#/definitions/NavigationTimingData' },
                { $ref: '#/definitions/LongTaskData' }
            ]
        },
        url: {
            type: 'string',
            format: 'uri',
            maxLength: 2048
        },
        userAgent: {
            type: 'string',
            maxLength: 512
        }
    },
    definitions: {
        WebVitalsData: {
            type: 'object',
            properties: {
                cls: { $ref: '#/definitions/CLSMetric' },
                fid: { $ref: '#/definitions/FIDMetric' },
                lcp: { $ref: '#/definitions/LCPMetric' },
                fcp: { $ref: '#/definitions/FCPMetric' },
                ttfb: { $ref: '#/definitions/TTFBMetric' },
                inp: { $ref: '#/definitions/INPMetric' }
            }
        },
        BaseMetric: {
            type: 'object',
            required: ['name', 'value', 'rating', 'delta', 'id', 'navigationType'],
            properties: {
                name: { type: 'string' },
                value: { type: 'number', minimum: 0 },
                rating: {
                    type: 'string',
                    enum: ['good', 'needs-improvement', 'poor']
                },
                delta: { type: 'number' },
                id: { type: 'string' },
                navigationType: {
                    type: 'string',
                    enum: ['navigate', 'reload', 'back-forward', 'prerender']
                }
            }
        },
        CLSMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'CLS' },
                        value: { maximum: 1 }
                    }
                }
            ]
        },
        FIDMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'FID' },
                        value: { maximum: 10000 }
                    }
                }
            ]
        },
        LCPMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'LCP' },
                        value: { maximum: 30000 }
                    }
                }
            ]
        },
        FCPMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'FCP' },
                        value: { maximum: 10000 }
                    }
                }
            ]
        },
        TTFBMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'TTFB' },
                        value: { maximum: 5000 }
                    }
                }
            ]
        },
        INPMetric: {
            allOf: [
                { $ref: '#/definitions/BaseMetric' },
                {
                    properties: {
                        name: { const: 'INP' },
                        value: { maximum: 1000 }
                    }
                }
            ]
        },
        ResourceTimingData: {
            type: 'object',
            required: ['name', 'entryType', 'startTime', 'duration'],
            properties: {
                name: { type: 'string', maxLength: 2048 },
                entryType: { const: 'resource' },
                startTime: { type: 'number', minimum: 0 },
                duration: { type: 'number', minimum: 0 },
                initiatorType: { type: 'string' },
                nextHopProtocol: { type: 'string' },
                renderBlockingStatus: { type: 'string' },
                responseStatus: { type: 'number', minimum: 100, maximum: 599 },
                transferSize: { type: 'number', minimum: 0 },
                encodedBodySize: { type: 'number', minimum: 0 },
                decodedBodySize: { type: 'number', minimum: 0 },
                responseStart: { type: 'number', minimum: 0 },
                responseEnd: { type: 'number', minimum: 0 }
            }
        },
        NavigationTimingData: {
            type: 'object',
            required: ['type'],
            properties: {
                domComplete: { type: 'number', minimum: 0 },
                domContentLoadedEventEnd: { type: 'number', minimum: 0 },
                domContentLoadedEventStart: { type: 'number', minimum: 0 },
                domInteractive: { type: 'number', minimum: 0 },
                loadEventEnd: { type: 'number', minimum: 0 },
                loadEventStart: { type: 'number', minimum: 0 },
                redirectCount: { type: 'number', minimum: 0 },
                type: {
                    type: 'string',
                    enum: ['navigate', 'reload', 'back-forward', 'prerender']
                },
                unloadEventEnd: { type: 'number', minimum: 0 },
                unloadEventStart: { type: 'number', minimum: 0 }
            }
        },
        LongTaskData: {
            type: 'object',
            required: ['name', 'entryType', 'startTime', 'duration'],
            properties: {
                name: { const: 'longtask' },
                entryType: { const: 'longtask' },
                startTime: { type: 'number', minimum: 0 },
                duration: { type: 'number', minimum: 50 }, // Long tasks are >= 50ms
                attribution: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            entryType: { const: 'taskattribution' },
                            startTime: { type: 'number', minimum: 0 },
                            duration: { type: 'number', minimum: 0 },
                            containerType: { type: 'string' },
                            containerSrc: { type: 'string' },
                            containerId: { type: 'string' },
                            containerName: { type: 'string' }
                        }
                    }
                }
            }
        }
    }
};
