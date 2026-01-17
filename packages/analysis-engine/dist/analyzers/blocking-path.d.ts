import { DependencyGraph } from '../graph/graph-builder';
export interface BlockingPath {
    path: string[];
    totalDuration: number;
    blockingDuration: number;
    impactPercentage: number;
    bottlenecks: Bottleneck[];
}
export interface Bottleneck {
    nodeId: string;
    name: string;
    duration: number;
    impactPercentage: number;
    type: 'cpu' | 'io' | 'network' | 'database' | 'external';
    recommendations: string[];
}
export declare class BlockingPathAnalyzer {
    identifyBlockingPaths(graph: DependencyGraph, threshold?: number): BlockingPath[];
    private findAllPaths;
    private calculatePathDuration;
    private calculateBlockingDuration;
    private identifyBottlenecks;
    private classifyBottleneckType;
    private generateRecommendations;
}
export declare class ImpactCalculator {
    calculatePerformanceImpact(graph: DependencyGraph): {
        criticalPathImpact: number;
        bottleneckImpact: number;
        parallelizationOpportunity: number;
        totalOptimizationPotential: number;
    };
    private calculateCriticalPathDuration;
    private identifyMajorBottlenecks;
    private calculateParallelizationOpportunity;
    private findSiblingNodes;
}
//# sourceMappingURL=blocking-path.d.ts.map