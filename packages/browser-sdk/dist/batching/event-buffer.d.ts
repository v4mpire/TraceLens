import { PerformanceEvent } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
export declare class EventBuffer {
    private config;
    private buffer;
    private sender;
    private flushTimer;
    constructor(config: SDKConfig);
    add(event: PerformanceEvent): void;
    flush(): void;
    getBufferSize(): number;
    clear(): void;
    destroy(): void;
    private startFlushTimer;
    private stopFlushTimer;
}
//# sourceMappingURL=event-buffer.d.ts.map