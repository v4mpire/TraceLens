"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphOptimizer = void 0;
class GraphOptimizer {
    optimize(graph, options = {}) {
        const startTime = Date.now();
        const originalNodeCount = graph.nodes.size;
        const originalEdgeCount = graph.edges.size;
        const optimizations = [];
        let optimizedGraph = this.deepCloneGraph(graph);
        // Remove noise nodes (very short duration, no significant impact)
        if (options.removeNoise !== false) {
            const noiseResult = this.removeNoiseNodes(optimizedGraph);
            optimizedGraph = noiseResult.graph;
            if (noiseResult.removedCount > 0) {
                optimizations.push(`Removed ${noiseResult.removedCount} noise nodes`);
            }
        }
        // Merge short consecutive spans
        if (options.mergeShortSpans !== false) {
            const mergeResult = this.mergeShortSpans(optimizedGraph);
            optimizedGraph = mergeResult.graph;
            if (mergeResult.mergedCount > 0) {
                optimizations.push(`Merged ${mergeResult.mergedCount} short spans`);
            }
        }
        // Simplify linear paths
        if (options.simplifyPaths !== false) {
            const simplifyResult = this.simplifyLinearPaths(optimizedGraph);
            optimizedGraph = simplifyResult.graph;
            if (simplifyResult.simplifiedCount > 0) {
                optimizations.push(`Simplified ${simplifyResult.simplifiedCount} linear paths`);
            }
        }
        // Limit total nodes if specified
        if (options.maxNodes && optimizedGraph.nodes.size > options.maxNodes) {
            const limitResult = this.limitNodes(optimizedGraph, options.maxNodes);
            optimizedGraph = limitResult.graph;
            optimizations.push(`Limited to ${options.maxNodes} most important nodes`);
        }
        // Recalculate critical path after optimization
        optimizedGraph.criticalPath = this.recalculateCriticalPath(optimizedGraph);
        const processingTime = Date.now() - startTime;
        const result = {
            originalNodeCount,
            optimizedNodeCount: optimizedGraph.nodes.size,
            originalEdgeCount,
            optimizedEdgeCount: optimizedGraph.edges.size,
            processingTime,
            optimizations
        };
        return { graph: optimizedGraph, result };
    }
    removeNoiseNodes(graph) {
        const threshold = graph.totalDuration * 0.001; // 0.1% of total duration
        const nodesToRemove = [];
        for (const [nodeId, node] of graph.nodes) {
            // Don't remove root or critical path nodes
            if (graph.rootNodes.includes(nodeId) || graph.criticalPath.includes(nodeId)) {
                continue;
            }
            // Remove nodes with very short duration and no children
            if ((node.duration || 0) < threshold && node.children.length === 0) {
                nodesToRemove.push(nodeId);
            }
        }
        // Remove nodes and update relationships
        for (const nodeId of nodesToRemove) {
            const node = graph.nodes.get(nodeId);
            if (!node)
                continue;
            // Update parent nodes to remove this child
            for (const parentId of node.parents) {
                const parent = graph.nodes.get(parentId);
                if (parent) {
                    parent.children = parent.children.filter(id => id !== nodeId);
                }
            }
            // Remove associated edges
            for (const parentId of node.parents) {
                graph.edges.delete(`${parentId}->${nodeId}`);
            }
            graph.nodes.delete(nodeId);
        }
        // Update leaf nodes
        graph.leafNodes = Array.from(graph.nodes.values())
            .filter(node => node.children.length === 0)
            .map(node => node.id);
        return { graph, removedCount: nodesToRemove.length };
    }
    mergeShortSpans(graph) {
        const threshold = graph.totalDuration * 0.01; // 1% of total duration
        let mergedCount = 0;
        const nodesToMerge = [];
        for (const [nodeId, node] of graph.nodes) {
            // Skip root nodes and nodes with multiple children
            if (graph.rootNodes.includes(nodeId) || node.children.length !== 1) {
                continue;
            }
            const childId = node.children[0];
            if (!childId)
                continue; // Extra safety check
            const child = graph.nodes.get(childId);
            // Merge if both spans are short and child has only one parent
            if (child &&
                (node.duration || 0) < threshold &&
                (child.duration || 0) < threshold &&
                child.parents.length === 1) {
                nodesToMerge.push({ parent: nodeId, child: childId });
            }
        }
        // Perform merges
        for (const { parent: parentId, child: childId } of nodesToMerge) {
            const parent = graph.nodes.get(parentId);
            const child = graph.nodes.get(childId);
            if (!parent || !child)
                continue;
            // Create merged node
            const mergedNode = {
                id: parentId, // Keep parent ID
                type: parent.type,
                name: `${parent.name} → ${child.name}`,
                startTime: parent.startTime,
                endTime: child.endTime || parent.endTime,
                duration: (parent.duration || 0) + (child.duration || 0),
                metadata: {
                    ...parent.metadata,
                    merged: true,
                    originalNodes: [parentId, childId]
                },
                children: child.children,
                parents: parent.parents
            };
            // Update relationships
            for (const grandchildId of child.children) {
                const grandchild = graph.nodes.get(grandchildId);
                if (grandchild) {
                    grandchild.parents = grandchild.parents.map(id => id === childId ? parentId : id);
                }
            }
            // Update edges
            graph.edges.delete(`${parentId}->${childId}`);
            for (const grandchildId of child.children) {
                const edge = graph.edges.get(`${childId}->${grandchildId}`);
                if (edge) {
                    graph.edges.delete(`${childId}->${grandchildId}`);
                    graph.edges.set(`${parentId}->${grandchildId}`, {
                        ...edge,
                        from: parentId
                    });
                }
            }
            // Replace parent node and remove child node
            graph.nodes.set(parentId, mergedNode);
            graph.nodes.delete(childId);
            mergedCount++;
        }
        return { graph, mergedCount };
    }
    simplifyLinearPaths(graph) {
        let simplifiedCount = 0;
        const processedNodes = new Set();
        for (const [nodeId, node] of graph.nodes) {
            if (processedNodes.has(nodeId) || graph.rootNodes.includes(nodeId)) {
                continue;
            }
            // Find linear path starting from this node
            const linearPath = this.findLinearPath(graph, nodeId);
            if (linearPath.length > 3) { // Only simplify paths with 4+ nodes
                const simplifiedNode = this.createSimplifiedNode(graph, linearPath);
                // Replace linear path with simplified node
                this.replaceLinearPath(graph, linearPath, simplifiedNode);
                linearPath.forEach(id => processedNodes.add(id));
                simplifiedCount++;
            }
        }
        return { graph, simplifiedCount };
    }
    findLinearPath(graph, startId) {
        const path = [startId];
        let currentId = startId;
        while (true) {
            const current = graph.nodes.get(currentId);
            if (!current || current.children.length !== 1)
                break;
            const childId = current.children[0];
            if (!childId)
                break; // Extra safety check
            const child = graph.nodes.get(childId);
            if (!child || child.parents.length !== 1)
                break;
            path.push(childId);
            currentId = childId;
        }
        return path;
    }
    createSimplifiedNode(graph, path) {
        const firstId = path[0];
        const lastId = path[path.length - 1];
        if (!firstId || !lastId) {
            throw new Error('Invalid path for simplification');
        }
        const firstNode = graph.nodes.get(firstId);
        const lastNode = graph.nodes.get(lastId);
        if (!firstNode || !lastNode) {
            throw new Error('Nodes not found for simplification');
        }
        const totalDuration = path.reduce((sum, nodeId) => {
            const node = graph.nodes.get(nodeId);
            return sum + (node?.duration || 0);
        }, 0);
        return {
            id: `simplified_${firstId}_${lastId}`,
            type: 'span',
            name: `${firstNode.name} ... ${lastNode.name} (${path.length} steps)`,
            startTime: firstNode.startTime,
            endTime: lastNode.endTime || firstNode.endTime,
            duration: totalDuration,
            metadata: {
                simplified: true,
                originalPath: path,
                stepCount: path.length
            },
            children: lastNode.children,
            parents: firstNode.parents
        };
    }
    replaceLinearPath(graph, path, simplifiedNode) {
        const firstId = path[0];
        const lastId = path[path.length - 1];
        if (!firstId || !lastId)
            return;
        const firstNode = graph.nodes.get(firstId);
        const lastNode = graph.nodes.get(lastId);
        if (!firstNode || !lastNode)
            return;
        // Add simplified node
        graph.nodes.set(simplifiedNode.id, simplifiedNode);
        // Update parent relationships
        for (const parentId of firstNode.parents) {
            const parent = graph.nodes.get(parentId);
            if (parent) {
                parent.children = parent.children.map(id => id === firstId ? simplifiedNode.id : id);
            }
            // Update edge
            const edge = graph.edges.get(`${parentId}->${firstId}`);
            if (edge) {
                graph.edges.delete(`${parentId}->${firstId}`);
                graph.edges.set(`${parentId}->${simplifiedNode.id}`, {
                    ...edge,
                    to: simplifiedNode.id
                });
            }
        }
        // Update child relationships
        for (const childId of lastNode.children) {
            const child = graph.nodes.get(childId);
            if (child) {
                child.parents = child.parents.map(id => id === lastId ? simplifiedNode.id : id);
            }
            // Update edge
            const edge = graph.edges.get(`${lastId}->${childId}`);
            if (edge) {
                graph.edges.delete(`${lastId}->${childId}`);
                graph.edges.set(`${simplifiedNode.id}->${childId}`, {
                    ...edge,
                    from: simplifiedNode.id
                });
            }
        }
        // Remove original nodes and edges
        for (const nodeId of path) {
            graph.nodes.delete(nodeId);
        }
        for (let i = 0; i < path.length - 1; i++) {
            graph.edges.delete(`${path[i]}->${path[i + 1]}`);
        }
    }
    limitNodes(graph, maxNodes) {
        if (graph.nodes.size <= maxNodes)
            return { graph };
        // Score nodes by importance
        const nodeScores = new Map();
        for (const [nodeId, node] of graph.nodes) {
            let score = 0;
            // Critical path nodes get highest score
            if (graph.criticalPath.includes(nodeId))
                score += 100;
            // Root nodes get high score
            if (graph.rootNodes.includes(nodeId))
                score += 50;
            // Duration impact
            score += ((node.duration || 0) / graph.totalDuration) * 50;
            // Connectivity (nodes with many connections are important)
            score += (node.children.length + node.parents.length) * 5;
            nodeScores.set(nodeId, score);
        }
        // Keep top nodes
        const sortedNodes = Array.from(nodeScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxNodes)
            .map(([nodeId]) => nodeId);
        const keptNodes = new Set(sortedNodes);
        // Remove nodes not in the kept set
        for (const nodeId of graph.nodes.keys()) {
            if (!keptNodes.has(nodeId)) {
                graph.nodes.delete(nodeId);
            }
        }
        // Remove edges that reference deleted nodes
        for (const [edgeId, edge] of graph.edges) {
            if (!keptNodes.has(edge.from) || !keptNodes.has(edge.to)) {
                graph.edges.delete(edgeId);
            }
        }
        // Update node relationships
        for (const node of graph.nodes.values()) {
            node.children = node.children.filter(id => keptNodes.has(id));
            node.parents = node.parents.filter(id => keptNodes.has(id));
        }
        // Update root and leaf nodes
        graph.rootNodes = graph.rootNodes.filter(id => keptNodes.has(id));
        graph.leafNodes = graph.leafNodes.filter(id => keptNodes.has(id));
        return { graph };
    }
    recalculateCriticalPath(graph) {
        // Simplified critical path recalculation
        // In a real implementation, this would use the same algorithm as GraphBuilder
        return graph.criticalPath.filter(nodeId => graph.nodes.has(nodeId));
    }
    deepCloneGraph(graph) {
        return {
            nodes: new Map(Array.from(graph.nodes.entries()).map(([id, node]) => [
                id,
                {
                    ...node,
                    children: [...node.children],
                    parents: [...node.parents],
                    metadata: { ...node.metadata }
                }
            ])),
            edges: new Map(Array.from(graph.edges.entries()).map(([id, edge]) => [
                id,
                { ...edge, metadata: { ...edge.metadata } }
            ])),
            rootNodes: [...graph.rootNodes],
            leafNodes: [...graph.leafNodes],
            criticalPath: [...graph.criticalPath],
            totalDuration: graph.totalDuration
        };
    }
}
exports.GraphOptimizer = GraphOptimizer;
