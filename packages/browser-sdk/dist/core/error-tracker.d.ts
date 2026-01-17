import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';
export declare class ErrorTracker {
    private config;
    private eventBuffer;
    private originalErrorHandler;
    private originalUnhandledRejectionHandler;
    constructor(config: SDKConfig, eventBuffer: EventBuffer);
    start(): void;
    stop(): void;
    private handleError;
    private determineSeverity;
    private generateId;
}
//# sourceMappingURL=error-tracker.d.ts.map