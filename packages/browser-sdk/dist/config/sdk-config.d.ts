export interface SDKConfig {
    projectKey: string;
    endpoint: string;
    sampling: number;
    bufferSize: number;
    flushInterval: number;
    enableWebVitals: boolean;
    enableResourceTiming: boolean;
    enableLongTasks: boolean;
    enableErrorTracking: boolean;
    debug: boolean;
}
export declare const DEFAULT_CONFIG: SDKConfig;
export declare function validateConfig(config: Partial<SDKConfig>): string[];
//# sourceMappingURL=sdk-config.d.ts.map