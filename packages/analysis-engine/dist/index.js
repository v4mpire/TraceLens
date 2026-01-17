"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisEngine = void 0;
const graph_builder_1 = require("./graph/graph-builder");
const blocking_path_1 = require("./analyzers/blocking-path");
const graph_optimizer_1 = require("./optimizers/graph-optimizer");
class AnalysisEngine {
    constructor() {
        this.graphBuilder = new graph_builder_1.GraphBuilder();
        this.blockingAnalyzer = new blocking_path_1.BlockingPathAnalyzer();
        this.impactCalculator = new blocking_path_1.ImpactCalculator();
        this.optimizer = new graph_optimizer_1.GraphOptimizer();
    }
    async analyzeTrace(trace, options = {}) {
        const startTime = Date.now();
        // Build dependency graph
        let graph = this.graphBuilder.buildFromTrace(trace);
        // Optimize graph if requested
        let optimization = {
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
        const blockingPaths = this.blockingAnalyzer.identifyBlockingPaths(graph, options.blockingThreshold || 0.05);
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
    async analyzeMultipleTraces(traces, options = {}) {
        const startTime = Date.now();
        // Build merged dependency graph
        let graph = this.graphBuilder.buildFromMultipleTraces(traces);
        // Optimize graph if requested
        let optimization = {
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
        const blockingPaths = this.blockingAnalyzer.identifyBlockingPaths(graph, options.blockingThreshold || 0.03 // Lower threshold for multiple traces
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
    generateRecommendations(graph, blockingPaths, performanceImpact) {
        const recommendations = [];
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
    getGraphSummary(graph) {
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
    calculateGraphDepth(graph) {
        let maxDepth = 0;
        const calculateDepth = (nodeId, currentDepth, visited) => {
            if (visited.has(nodeId))
                return currentDepth;
            visited.add(nodeId);
            const node = graph.nodes.get(nodeId);
            if (!node)
                return currentDepth;
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
exports.AnalysisEngine = AnalysisEngine;
// Export all types and classes
__exportStar(require("./graph/graph-builder"), exports);
__exportStar(require("./analyzers/blocking-path"), exports);
__exportStar(require("./optimizers/graph-optimizer"), exports);
