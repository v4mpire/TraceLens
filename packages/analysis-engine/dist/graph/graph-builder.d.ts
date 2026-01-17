import { Trace } from '@tracelens/shared';
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
export declare class GraphBuilder {
    buildFromTrace(trace: Trace): DependencyGraph;
    buildFromMultipleTraces(traces: Trace[]): DependencyGraph;
    private calculateCriticalPath;
}
//# sourceMappingURL=graph-builder.d.ts.map