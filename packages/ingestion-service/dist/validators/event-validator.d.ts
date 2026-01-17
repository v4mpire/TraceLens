import { PerformanceEvent } from '@tracelens/shared';
export declare class ValidationError extends Error {
    errors: any[];
    constructor(message: string, errors: any[]);
}
export declare class EventValidator {
    private ajv;
    constructor();
    validateEvent(event: unknown): PerformanceEvent;
    validateEventBatch(events: unknown[]): PerformanceEvent[];
    private validateEventData;
    private validateWebVitalsData;
    private validateMetric;
    private validateResourceTimingData;
    private validateNavigationTimingData;
    private validateLongTaskData;
    private validateErrorData;
}
//# sourceMappingURL=event-validator.d.ts.map