// Blocking path identification and bottleneck detection
import { DependencyGraph, GraphNode, GraphEdge } from '../graph/graph-builder';

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

export class BlockingPathAnalyzer {
  public identifyBlockingPaths(graph: DependencyGraph, threshold: number = 0.1): BlockingPath[] {
    const blockingPaths: BlockingPath[] = [];
    
    // Analyze each path from root to leaf
    for (const rootId of graph.rootNodes) {
      const paths = this.findAllPaths(graph, rootId);
      
      for (const path of paths) {
        const pathDuration = this.calculatePathDuration(graph, path);
        const blockingDuration = this.calculateBlockingDuration(graph, path);
        const impactPercentage = (blockingDuration / graph.totalDuration) * 100;
        
        if (impactPercentage >= threshold * 100) {
          const bottlenecks = this.identifyBottlenecks(graph, path);
          
          blockingPaths.push({
            path,
            totalDuration: pathDuration,
            blockingDuration,
            impactPercentage,
            bottlenecks
          });
        }
      }
    }
    
    // Sort by impact percentage (highest first)
    return blockingPaths.sort((a, b) => b.impactPercentage - a.impactPercentage);
  }

  private findAllPaths(graph: DependencyGraph, startId: string, visited = new Set<string>()): string[][] {
    const paths: string[][] = [];
    const node = graph.nodes.get(startId);
    
    if (!node || visited.has(startId)) {
      return paths;
    }
    
    visited.add(startId);
    
    if (node.children.length === 0) {
      // Leaf node - end of path
      paths.push([startId]);
    } else {
      // Continue exploring children
      for (const childId of node.children) {
        const childPaths = this.findAllPaths(graph, childId, new Set(visited));
        for (const childPath of childPaths) {
          paths.push([startId, ...childPath]);
        }
      }
    }
    
    visited.delete(startId);
    return paths;
  }

  private calculatePathDuration(graph: DependencyGraph, path: string[]): number {
    let totalDuration = 0;
    
    for (const nodeId of path) {
      const node = graph.nodes.get(nodeId);
      if (node?.duration) {
        totalDuration += node.duration;
      }
    }
    
    return totalDuration;
  }

  private calculateBlockingDuration(graph: DependencyGraph, path: string[]): number {
    // Calculate the actual blocking time by considering parallel execution
    let blockingDuration = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const currentId = path[i];
      const nextId = path[i + 1];
      const edge = graph.edges.get(`${currentId}->${nextId}`);
      
      if (edge && edge.type === 'blocks') {
        blockingDuration += edge.weight;
      }
    }
    
    return blockingDuration;
  }

  private identifyBottlenecks(graph: DependencyGraph, path: string[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    for (const nodeId of path) {
      const node = graph.nodes.get(nodeId);
      if (!node?.duration) continue;
      
      const impactPercentage = (node.duration / graph.totalDuration) * 100;
      
      // Consider nodes with >5% impact as potential bottlenecks
      if (impactPercentage >= 5) {
        const type = this.classifyBottleneckType(node);
        const recommendations = this.generateRecommendations(node, type);
        
        bottlenecks.push({
          nodeId,
          name: node.name,
          duration: node.duration,
          impactPercentage,
          type,
          recommendations
        });
      }
    }
    
    return bottlenecks.sort((a, b) => b.impactPercentage - a.impactPercentage);
  }

  private classifyBottleneckType(node: GraphNode): 'cpu' | 'io' | 'network' | 'database' | 'external' {
    const tags = node.metadata.tags || {};
    const name = node.name.toLowerCase();
    
    if (tags['db.type'] || name.includes('database') || name.includes('query')) {
      return 'database';
    }
    
    if (tags['http.url'] || name.includes('http') || name.includes('request')) {
      return 'network';
    }
    
    if (name.includes('file') || name.includes('read') || name.includes('write')) {
      return 'io';
    }
    
    if (tags['component'] === 'external' || name.includes('external')) {
      return 'external';
    }
    
    return 'cpu';
  }

  private generateRecommendations(node: GraphNode, type: string): string[] {
    const recommendations: string[] = [];
    
    switch (type) {
      case 'database':
        recommendations.push('Consider adding database indexes');
        recommendations.push('Optimize query performance');
        recommendations.push('Implement connection pooling');
        break;
      case 'network':
        recommendations.push('Implement request caching');
        recommendations.push('Reduce payload size');
        recommendations.push('Use connection keep-alive');
        break;
      case 'io':
        recommendations.push('Implement file caching');
        recommendations.push('Use asynchronous I/O operations');
        recommendations.push('Optimize file access patterns');
        break;
      case 'external':
        recommendations.push('Implement circuit breaker pattern');
        recommendations.push('Add request timeout handling');
        recommendations.push('Consider service redundancy');
        break;
      case 'cpu':
        recommendations.push('Profile CPU-intensive operations');
        recommendations.push('Consider algorithm optimization');
        recommendations.push('Implement caching for expensive calculations');
        break;
    }
    
    return recommendations;
  }
}

export class ImpactCalculator {
  public calculatePerformanceImpact(graph: DependencyGraph): {
    criticalPathImpact: number;
    bottleneckImpact: number;
    parallelizationOpportunity: number;
    totalOptimizationPotential: number;
  } {
    const criticalPathDuration = this.calculateCriticalPathDuration(graph);
    const totalDuration = graph.totalDuration;
    
    const criticalPathImpact = (criticalPathDuration / totalDuration) * 100;
    
    // Calculate bottleneck impact
    const bottlenecks = this.identifyMajorBottlenecks(graph);
    const bottleneckImpact = bottlenecks.reduce((sum, b) => sum + b.impactPercentage, 0);
    
    // Calculate parallelization opportunity
    const parallelizationOpportunity = this.calculateParallelizationOpportunity(graph);
    
    // Estimate total optimization potential
    const totalOptimizationPotential = Math.min(
      bottleneckImpact + parallelizationOpportunity,
      80 // Cap at 80% to be realistic
    );
    
    return {
      criticalPathImpact,
      bottleneckImpact,
      parallelizationOpportunity,
      totalOptimizationPotential
    };
  }

  private calculateCriticalPathDuration(graph: DependencyGraph): number {
    let duration = 0;
    
    for (const nodeId of graph.criticalPath) {
      const node = graph.nodes.get(nodeId);
      if (node?.duration) {
        duration += node.duration;
      }
    }
    
    return duration;
  }

  private identifyMajorBottlenecks(graph: DependencyGraph): Bottleneck[] {
    const analyzer = new BlockingPathAnalyzer();
    const blockingPaths = analyzer.identifyBlockingPaths(graph, 0.05); // 5% threshold
    
    const allBottlenecks: Bottleneck[] = [];
    for (const path of blockingPaths) {
      allBottlenecks.push(...path.bottlenecks);
    }
    
    // Deduplicate and return top bottlenecks
    const uniqueBottlenecks = new Map<string, Bottleneck>();
    for (const bottleneck of allBottlenecks) {
      const existing = uniqueBottlenecks.get(bottleneck.nodeId);
      if (!existing || bottleneck.impactPercentage > existing.impactPercentage) {
        uniqueBottlenecks.set(bottleneck.nodeId, bottleneck);
      }
    }
    
    return Array.from(uniqueBottlenecks.values())
      .sort((a, b) => b.impactPercentage - a.impactPercentage)
      .slice(0, 5); // Top 5 bottlenecks
  }

  private calculateParallelizationOpportunity(graph: DependencyGraph): number {
    let parallelizableTime = 0;
    const processedNodes = new Set<string>();
    
    // Find nodes that could potentially run in parallel
    for (const [nodeId, node] of graph.nodes) {
      if (processedNodes.has(nodeId)) continue;
      
      // Find sibling nodes (same parent, no dependencies between them)
      const siblings = this.findSiblingNodes(graph, nodeId);
      
      if (siblings.length > 1) {
        // Calculate potential time savings from parallelization
        const totalSiblingTime = siblings.reduce((sum, siblingId) => {
          const siblingNode = graph.nodes.get(siblingId);
          return sum + (siblingNode?.duration || 0);
        }, 0);
        
        const maxSiblingTime = Math.max(...siblings.map(siblingId => {
          const siblingNode = graph.nodes.get(siblingId);
          return siblingNode?.duration || 0;
        }));
        
        parallelizableTime += totalSiblingTime - maxSiblingTime;
        
        // Mark siblings as processed
        siblings.forEach(id => processedNodes.add(id));
      }
    }
    
    return (parallelizableTime / graph.totalDuration) * 100;
  }

  private findSiblingNodes(graph: DependencyGraph, nodeId: string): string[] {
    const node = graph.nodes.get(nodeId);
    if (!node || node.parents.length === 0) return [nodeId];
    
    const siblings = new Set<string>([nodeId]);
    
    for (const parentId of node.parents) {
      const parent = graph.nodes.get(parentId);
      if (parent) {
        parent.children.forEach(childId => siblings.add(childId));
      }
    }
    
    return Array.from(siblings);
  }
}
