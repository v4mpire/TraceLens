// Main analysis engine orchestrating graph construction and analysis
import { Trace } from '@tracelens/shared';
import { GraphBuilder, DependencyGraph } from './graph/graph-builder';
import { BlockingPathAnalyzer, ImpactCalculator, BlockingPath } from './analyzers/blocking-path';
import { GraphOptimizer, OptimizationResult } from './optimizers/graph-optimizer';

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

export class AnalysisEngine {
  private graphBuilder: GraphBuilder;
  private blockingAnalyzer: BlockingPathAnalyzer;
  private impactCalculator: ImpactCalculator;
  private optimizer: GraphOptimizer;

  constructor() {
    this.graphBuilder = new GraphBuilder();
    this.blockingAnalyzer = new BlockingPathAnalyzer();
    this.impactCalculator = new ImpactCalculator();
    this.optimizer = new GraphOptimizer();
  }

  public async analyzeTrace(trace: Trace, options: AnalysisOptions = {}): Promise<AnalysisResult> {
    const startTime = Date.now();

    // Build dependency graph
    let graph = this.graphBuilder.buildFromTrace(trace);

    // Optimize graph if requested
    let optimization: OptimizationResult = {
      originalNodeCount: graph.nodes.size,
      optimizedNodeCount: graph.nodes.size,
      originalEdgeCount: graph.edges.size,
      optimizedEdgeCount: graph.edges.size,
      processingTime: 0,
      optimizations: []
    };

    if (options.optimizeGraph !== false) {
      const optimizationResult = this.optimizer.optimize(graph, {
        maxNodes: options.maxNodes || 100
      });
      graph = optimizationResult.graph;
      optimization = optimizationResult.result;
    }

    // Analyze blocking paths
    const blockingPaths = this.blockingAnalyzer.identifyBlockingPaths(
      graph, 
      options.blockingThreshold || 0.05
    );

    // Calculate performance impact
    const performanceImpact = this.impactCalculator.calculatePerformanceImpact(graph);

    // Generate recommendations
    const recommendations = options.includeRecommendations !== false 
      ? this.generateRecommendations(graph, blockingPaths, performanceImpact)
      : [];

    const processingTime = Date.now() - startTime;

    return {
      graph,
      blockingPaths,
      performanceImpact,
      optimization,
      processingTime,
      recommendations
    };
  }

  public async analyzeMultipleTraces(traces: Trace[], options: AnalysisOptions = {}): Promise<AnalysisResult> {
    const startTime = Date.now();

    // Build merged dependency graph
    let graph = this.graphBuilder.buildFromMultipleTraces(traces);

    // Optimize graph if requested
    let optimization: OptimizationResult = {
      originalNodeCount: graph.nodes.size,
      optimizedNodeCount: graph.nodes.size,
      originalEdgeCount: graph.edges.size,
      optimizedEdgeCount: graph.edges.size,
      processingTime: 0,
      optimizations: []
    };

    if (options.optimizeGraph !== false) {
      const optimizationResult = this.optimizer.optimize(graph, {
        maxNodes: options.maxNodes || 200 // Allow more nodes for multiple traces
      });
      graph = optimizationResult.graph;
      optimization = optimizationResult.result;
    }

    // Analyze blocking paths
    const blockingPaths = this.blockingAnalyzer.identifyBlockingPaths(
      graph, 
      options.blockingThreshold || 0.03 // Lower threshold for multiple traces
    );

    // Calculate performance impact
    const performanceImpact = this.impactCalculator.calculatePerformanceImpact(graph);

    // Generate recommendations
    const recommendations = options.includeRecommendations !== false 
      ? this.generateRecommendations(graph, blockingPaths, performanceImpact)
      : [];

    const processingTime = Date.now() - startTime;

    return {
      graph,
      blockingPaths,
      performanceImpact,
      optimization,
      processingTime,
      recommendations
    };
  }

  private generateRecommendations(
    graph: DependencyGraph, 
    blockingPaths: BlockingPath[], 
    performanceImpact: any
  ): string[] {
    const recommendations: string[] = [];

    // Critical path recommendations
    if (performanceImpact.criticalPathImpact > 70) {
      recommendations.push('Critical path dominates execution time - focus optimization efforts here');
    }

    // Bottleneck recommendations
    if (performanceImpact.bottleneckImpact > 50) {
      recommendations.push('Major bottlenecks detected - prioritize the top 3 bottlenecks for optimization');
    }

    // Parallelization recommendations
    if (performanceImpact.parallelizationOpportunity > 20) {
      recommendations.push('Significant parallelization opportunities available - consider async processing');
    }

    // Specific bottleneck recommendations
    const topBottlenecks = blockingPaths
      .flatMap(path => path.bottlenecks)
      .sort((a, b) => b.impactPercentage - a.impactPercentage)
      .slice(0, 3);

    for (const bottleneck of topBottlenecks) {
      recommendations.push(`${bottleneck.name}: ${bottleneck.recommendations[0]}`);
    }

    // Graph complexity recommendations
    if (graph.nodes.size > 100) {
      recommendations.push('Complex execution graph - consider breaking down large operations');
    }

    // Performance threshold recommendations
    if (graph.totalDuration > 5000) { // 5 seconds
      recommendations.push('Long execution time detected - implement performance monitoring alerts');
    }

    return recommendations.slice(0, 8); // Limit to top 8 recommendations
  }

  public getGraphSummary(graph: DependencyGraph): {
    nodeCount: number;
    edgeCount: number;
    depth: number;
    criticalPathLength: number;
    averageNodeDuration: number;
    maxNodeDuration: number;
  } {
    const nodeCount = graph.nodes.size;
    const edgeCount = graph.edges.size;
    
    // Calculate graph depth
    const depth = this.calculateGraphDepth(graph);
    
    // Critical path metrics
    const criticalPathLength = graph.criticalPath.length;
    
    // Duration metrics
    const durations = Array.from(graph.nodes.values())
      .map(node => node.duration || 0)
      .filter(duration => duration > 0);
    
    const averageNodeDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;
    
    const maxNodeDuration = durations.length > 0 ? Math.max(...durations) : 0;

    return {
      nodeCount,
      edgeCount,
      depth,
      criticalPathLength,
      averageNodeDuration,
      maxNodeDuration
    };
  }

  private calculateGraphDepth(graph: DependencyGraph): number {
    let maxDepth = 0;
    
    const calculateDepth = (nodeId: string, currentDepth: number, visited: Set<string>): number => {
      if (visited.has(nodeId)) return currentDepth;
      
      visited.add(nodeId);
      const node = graph.nodes.get(nodeId);
      if (!node) return currentDepth;
      
      let maxChildDepth = currentDepth;
      for (const childId of node.children) {
        const childDepth = calculateDepth(childId, currentDepth + 1, new Set(visited));
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
      
      return maxChildDepth;
    };
    
    for (const rootId of graph.rootNodes) {
      const depth = calculateDepth(rootId, 1, new Set());
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return maxDepth;
  }
}

// Export all types and classes
export * from './graph/graph-builder';
export * from './analyzers/blocking-path';
export * from './optimizers/graph-optimizer';
