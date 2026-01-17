export declare class SamplingManager {
    private samplingRate;
    private adaptiveSampling;
    private performanceThreshold;
    private currentOverhead;
    private measurementCount;
    constructor(samplingRate?: number, adaptiveSampling?: boolean, performanceThreshold?: number);
    shouldSample(): boolean;
    measureOverhead<T>(operation: () => T): T;
    getCurrentSamplingRate(): number;
    getAverageOverhead(): number;
    setSamplingRate(rate: number): void;
    enableAdaptiveSampling(enabled: boolean): void;
    private updateOverheadMeasurement;
}
export declare function createTimeBudgetSampler(budgetMs: number): () => boolean;
export declare function createUserInteractionSampler(): () => boolean;
//# sourceMappingURL=sampling.d.ts.map