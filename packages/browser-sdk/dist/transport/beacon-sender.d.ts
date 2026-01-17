import { PerformanceEvent } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
export declare class BeaconSender {
    private config;
    private fallbackQueue;
    constructor(config: SDKConfig);
    send(events: PerformanceEvent[]): Promise<void>;
    private sendWithBeacon;
    private sendWithFetch;
    getQueueSize(): number;
    clearQueue(): void;
}
//# sourceMappingURL=beacon-sender.d.ts.map