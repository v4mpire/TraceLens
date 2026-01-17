// Directed dependency graph construction from traces
import { Trace, TraceSpan } from '@tracelens/shared';

export interface GraphNode {
  id: string;
  type: 'span' | 'resource' | 'dependency';
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata: Record<string, any>;
  children: string[];
  parents: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'calls' | 'depends' | 'blocks' | 'triggers';
  weight: number;
  metadata: Record<string, any>;
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  rootNodes: string[];
  leafNodes: string[];
  criticalPath: string[];
  totalDuration: number;
}

export class GraphBuilder {
  public buildFromTrace(trace: Trace): DependencyGraph {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge>();

    // Create nodes from spans
    for (const span of trace.spans) {
      const node: GraphNode = {
        id: span.spanId,
        type: 'span',
        name: span.operationName,
        startTime: span.startTime,
        endTime: span.endTime,
        duration: span.duration,
        metadata: {
          traceId: span.traceId,
          tags: span.tags || {},
          status: span.status
        },
        children: [],
        parents: []
      };
      nodes.set(span.spanId, node);
    }

    // Create edges from parent-child relationships
    for (const span of trace.spans) {
      if (span.parentSpanId) {
        const edgeId = `${span.parentSpanId}->${span.spanId}`;
        const edge: GraphEdge = {
          from: span.parentSpanId,
          to: span.spanId,
          type: 'calls',
          weight: span.duration || 0,
          metadata: {
            relationship: 'parent-child'
          }
        };
        edges.set(edgeId, edge);

        // Update node relationships
        const parentNode = nodes.get(span.parentSpanId);
        const childNode = nodes.get(span.spanId);
        if (parentNode && childNode) {
          parentNode.children.push(span.spanId);
          childNode.parents.push(span.parentSpanId);
        }
      }
    }

    // Identify root and leaf nodes
    const rootNodes = Array.from(nodes.values())
      .filter(node => node.parents.length === 0)
      .map(node => node.id);

    const leafNodes = Array.from(nodes.values())
      .filter(node => node.children.length === 0)
      .map(node => node.id);

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(nodes, edges, rootNodes);

    return {
      nodes,
      edges,
      rootNodes,
      leafNodes,
      criticalPath,
      totalDuration: trace.duration || 0
    };
  }

  public buildFromMultipleTraces(traces: Trace[]): DependencyGraph {
    const mergedNodes = new Map<string, GraphNode>();
    const mergedEdges = new Map<string, GraphEdge>();
    const allRootNodes = new Set<string>();
    const allLeafNodes = new Set<string>();

    for (const trace of traces) {
      const graph = this.buildFromTrace(trace);
      
      // Merge nodes
      for (const [nodeId, node] of graph.nodes) {
        const existingNode = mergedNodes.get(nodeId);
        if (existingNode) {
          // Merge metadata and update timing
          existingNode.metadata = { ...existingNode.metadata, ...node.metadata };
          if (node.startTime < existingNode.startTime) {
            existingNode.startTime = node.startTime;
          }
          if (node.endTime && existingNode.endTime && node.endTime > existingNode.endTime) {
            existingNode.endTime = node.endTime;
            existingNode.duration = existingNode.endTime - existingNode.startTime;
          }
        } else {
          mergedNodes.set(nodeId, { ...node });
        }
      }

      // Merge edges
      for (const [edgeId, edge] of graph.edges) {
        const existingEdge = mergedEdges.get(edgeId);
        if (existingEdge) {
          // Update weight with average
          existingEdge.weight = (existingEdge.weight + edge.weight) / 2;
          existingEdge.metadata = { ...existingEdge.metadata, ...edge.metadata };
        } else {
          mergedEdges.set(edgeId, { ...edge });
        }
      }

      // Collect root and leaf nodes
      graph.rootNodes.forEach(id => allRootNodes.add(id));
      graph.leafNodes.forEach(id => allLeafNodes.add(id));
    }

    const criticalPath = this.calculateCriticalPath(mergedNodes, mergedEdges, Array.from(allRootNodes));
    const totalDuration = Math.max(...traces.map(t => t.duration || 0));

    return {
      nodes: mergedNodes,
      edges: mergedEdges,
      rootNodes: Array.from(allRootNodes),
      leafNodes: Array.from(allLeafNodes),
      criticalPath,
      totalDuration
    };
  }

  private calculateCriticalPath(
    nodes: Map<string, GraphNode>,
    edges: Map<string, GraphEdge>,
    rootNodes: string[]
  ): string[] {
    const distances = new Map<string, number>();
    const predecessors = new Map<string, string>();
    
    // Initialize distances
    for (const nodeId of nodes.keys()) {
      distances.set(nodeId, -Infinity);
    }
    
    // Set root nodes distance to 0
    for (const rootId of rootNodes) {
      distances.set(rootId, 0);
    }

    // Topological sort and longest path calculation
    const visited = new Set<string>();
    const stack: string[] = [];

    const topologicalSort = (nodeId: string) => {
      visited.add(nodeId);
      const node = nodes.get(nodeId);
      if (node) {
        for (const childId of node.children) {
          if (!visited.has(childId)) {
            topologicalSort(childId);
          }
        }
      }
      stack.push(nodeId);
    };

    // Perform topological sort
    for (const rootId of rootNodes) {
      if (!visited.has(rootId)) {
        topologicalSort(rootId);
      }
    }

    // Calculate longest paths (critical path)
    while (stack.length > 0) {
      const nodeId = stack.pop()!;
      const node = nodes.get(nodeId);
      if (!node) continue;

      const currentDistance = distances.get(nodeId) || 0;
      
      for (const childId of node.children) {
        const edge = edges.get(`${nodeId}->${childId}`);
        const edgeWeight = edge?.weight || 0;
        const newDistance = currentDistance + edgeWeight;
        
        if (newDistance > (distances.get(childId) || -Infinity)) {
          distances.set(childId, newDistance);
          predecessors.set(childId, nodeId);
        }
      }
    }

    // Find the node with maximum distance (end of critical path)
    let maxDistance = -Infinity;
    let endNode = '';
    for (const [nodeId, distance] of distances) {
      if (distance > maxDistance) {
        maxDistance = distance;
        endNode = nodeId;
      }
    }

    // Reconstruct critical path
    const path: string[] = [];
    let current = endNode;
    while (current) {
      path.unshift(current);
      current = predecessors.get(current) || '';
    }

    return path;
  }
}
