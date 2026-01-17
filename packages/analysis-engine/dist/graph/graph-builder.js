"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphBuilder = void 0;
class GraphBuilder {
    buildFromTrace(trace) {
        const nodes = new Map();
        const edges = new Map();
        // Create nodes from spans
        for (const span of trace.spans) {
            const node = {
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
                const edge = {
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
    buildFromMultipleTraces(traces) {
        const mergedNodes = new Map();
        const mergedEdges = new Map();
        const allRootNodes = new Set();
        const allLeafNodes = new Set();
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
                }
                else {
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
                }
                else {
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
    calculateCriticalPath(nodes, edges, rootNodes) {
        const distances = new Map();
        const predecessors = new Map();
        // Initialize distances
        for (const nodeId of nodes.keys()) {
            distances.set(nodeId, -Infinity);
        }
        // Set root nodes distance to 0
        for (const rootId of rootNodes) {
            distances.set(rootId, 0);
        }
        // Topological sort and longest path calculation
        const visited = new Set();
        const stack = [];
        const topologicalSort = (nodeId) => {
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
            const nodeId = stack.pop();
            const node = nodes.get(nodeId);
            if (!node)
                continue;
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
        const path = [];
        let current = endNode;
        while (current) {
            path.unshift(current);
            current = predecessors.get(current) || '';
        }
        return path;
    }
}
exports.GraphBuilder = GraphBuilder;
