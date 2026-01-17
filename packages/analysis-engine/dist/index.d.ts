import { Trace } from '@tracelens/shared';
import { DependencyGraph } from './graph/graph-builder';
import { BlockingPath } from './analyzers/blocking-path';
import { OptimizationResult } from './optimizers/graph-optimizer';
export interface AnalysisResult {
    graph: DependencyGraph;
    blockingPaths: BlockingPath[];
    performanceImpact: {
        criticalPathImpact: number;
        bottleneckImpact: number;
        parallelizationOpportunity: number;
        totalOptimizationPotential: number;
    };
    optimization: OptimizationResult;
    processingTime: number;
    recommendations: string[];
}
export interface AnalysisOptions {
    optimizeGraph?: boolean;
    maxNodes?: number;
    blockingThreshold?: number;
    includeRecommendations?: boolean;
}
export declare class AnalysisEngine {
    private graphBuilder;
    private blockingAnalyzer;
    private impactCalculator;
    private optimizer;
    constructor();
    analyzeTrace(trace: Trace, options?: AnalysisOptions): Promise<AnalysisResult>;
    analyzeMultipleTraces(traces: Trace[], options?: AnalysisOptions): Promise<AnalysisResult>;
    private generateRecommendations;
    getGraphSummary(graph: DependencyGraph): {
        nodeCount: number;
        edgeCount: number;
        depth: number;
        criticalPathLength: number;
        averageNodeDuration: number;
        maxNodeDuration: number;
    };
    private calculateGraphDepth;
}
export * from './graph/graph-builder';
export * from './analyzers/blocking-path';
export * from './optimizers/graph-optimizer';
//# sourceMappingURL=index.d.ts.map