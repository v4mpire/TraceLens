import { CVEData } from './cve-fetcher';
import { RuntimeDependency } from './vulnerability-matcher';
import { RuntimeRisk, ExecutionContext } from './analyzers/risk-calculator';
import { DependencyGraph } from '@tracelens/analysis-engine';
export interface SecurityScanResult {
    scanId: string;
    timestamp: Date;
    dependenciesScanned: number;
    vulnerabilitiesFound: number;
    runtimeRisks: RuntimeRisk[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        activeRisks: number;
        theoreticalRisks: number;
    };
    processingTime: number;
}
export interface ScanOptions {
    includeTheoretical?: boolean;
    minSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    maxResults?: number;
}
export declare class SecurityScanner {
    private cveFetcher;
    private vulnerabilityMatcher;
    private riskCalculator;
    private updateScheduler?;
    private cveCache;
    constructor(nvdApiKey?: string);
    scanDependencies(dependencies: RuntimeDependency[], dependencyGraph?: DependencyGraph, executionHistory?: ExecutionContext[], options?: ScanOptions): Promise<SecurityScanResult>;
    startPeriodicUpdates(onUpdate?: (cves: CVEData[]) => Promise<void>): void;
    stopPeriodicUpdates(): void;
    getUpdateStatus(): {
        isRunning: boolean;
        lastUpdate?: Date;
        nextUpdate?: Date;
    };
    private getRecentCVEs;
    private convertToBasicRisks;
    private applyFilters;
    private generateSummary;
    getCacheStats(): {
        cveCount: number;
        oldestCVE: number | null;
        newestCVE: number | null;
    };
}
export * from './cve-fetcher';
export * from './vulnerability-matcher';
export * from './analyzers/risk-calculator';
export * from './schedulers/cve-updater';
//# sourceMappingURL=index.d.ts.map