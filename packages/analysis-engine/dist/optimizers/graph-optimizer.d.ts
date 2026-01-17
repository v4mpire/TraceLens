import { DependencyGraph } from '../graph/graph-builder';
export interface OptimizationResult {
    originalNodeCount: number;
    optimizedNodeCount: number;
    originalEdgeCount: number;
    optimizedEdgeCount: number;
    processingTime: number;
    optimizations: string[];
}
export declare class GraphOptimizer {
    optimize(graph: DependencyGraph, options?: {
        removeNoise?: boolean;
        simplifyPaths?: boolean;
        mergeShortSpans?: boolean;
        maxNodes?: number;
    }): {
        graph: DependencyGraph;
        result: OptimizationResult;
    };
    private removeNoiseNodes;
    private mergeShortSpans;
    private simplifyLinearPaths;
    private findLinearPath;
    private createSimplifiedNode;
    private replaceLinearPath;
    private limitNodes;
    private recalculateCriticalPath;
    private deepCloneGraph;
}
//# sourceMappingURL=graph-optimizer.d.ts.map