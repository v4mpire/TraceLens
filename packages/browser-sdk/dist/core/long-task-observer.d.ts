import { SDKConfig } from '../config/sdk-config';
import { EventBuffer } from '../batching/event-buffer';
export declare class LongTaskObserver {
    private config;
    private eventBuffer;
    private observer;
    constructor(config: SDKConfig, eventBuffer: EventBuffer);
    start(): void;
    stop(): void;
    private processLongTasks;
    private extractLongTaskData;
    private generateId;
}
//# sourceMappingURL=long-task-observer.d.ts.map