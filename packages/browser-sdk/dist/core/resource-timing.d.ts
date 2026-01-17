import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';
export declare class ResourceTiming {
    private config;
    private eventBuffer;
    private observer;
    private processedResources;
    constructor(config: SDKConfig, eventBuffer: EventBuffer);
    start(): void;
    stop(): void;
    private processEntries;
    private extractResourceData;
    private generateId;
}
//# sourceMappingURL=resource-timing.d.ts.map