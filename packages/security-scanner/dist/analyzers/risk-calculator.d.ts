import { DependencyGraph } from '@tracelens/analysis-engine';
import { VulnerabilityMatch } from '../vulnerability-matcher';
export interface RuntimeRisk {
    cveId: string;
    packageName: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    runtimeExposure: boolean;
    executionPaths: string[];
    impactScore: number;
    riskLevel: 'THEORETICAL' | 'POSSIBLE' | 'LIKELY' | 'ACTIVE';
    recommendations: string[];
}
export interface ExecutionContext {
    traceId: string;
    spanIds: string[];
    operationNames: string[];
    frequency: number;
    lastSeen: Date;
}
export declare class RuntimeRiskCalculator {
    calculateRuntimeRisk(vulnerabilities: VulnerabilityMatch[], dependencyGraph: DependencyGraph, executionHistory?: ExecutionContext[]): RuntimeRisk[];
    private assessVulnerabilityRisk;
    private findExecutionPaths;
    private nodeReferencesPackage;
    private findPathToNode;
    private checkRuntimeExposure;
    private calculateImpactScore;
    private determineRiskLevel;
    private generateRecommendations;
}
//# sourceMappingURL=risk-calculator.d.ts.map