import { TracingConfig } from '@tracelens/shared';
export interface ServerSDKConfig extends TracingConfig {
    enableDependencyScanning: boolean;
    enableExecutionTracking: boolean;
    otlpEndpoint?: string;
    debug: boolean;
}
export declare class TraceLensServerSDK {
    private config;
    private nodeSDK;
    private dependencyScanner;
    private executionTracker;
    private initialized;
    constructor(config: Partial<ServerSDKConfig>);
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getDependencySnapshot(): import("@tracelens/shared").DependencySnapshot;
    getExecutionMetrics(): import("./execution-tracker").ExecutionMetrics;
    isInitialized(): boolean;
    private createTraceExporter;
}
//# sourceMappingURL=tracer.d.ts.map