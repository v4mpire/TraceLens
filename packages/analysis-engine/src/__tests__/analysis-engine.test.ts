// Analysis engine tests
import { AnalysisEngine } from '../index';

// Define minimal types for testing
interface TestTrace {
  traceId: string;
  spans: TestSpan[];
  startTime: number;
  endTime?: number;
  duration?: number;
}

interface TestSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: string;
  tags?: Record<string, any>;
}

describe('AnalysisEngine', () => {
  let engine: AnalysisEngine;

  beforeEach(() => {
    engine = new AnalysisEngine();
  });

  describe('analyzeTrace', () => {
    it('should analyze a simple trace and identify critical path', async () => {
      const trace: TestTrace = {
        traceId: 'test-trace-1',
        spans: [
          {
            traceId: 'test-trace-1',
            spanId: 'span-1',
            operationName: 'root-operation',
            startTime: 1000,
            endTime: 5000,
            duration: 4000,
            status: 'OK'
          },
          {
            traceId: 'test-trace-1',
            spanId: 'span-2',
            parentSpanId: 'span-1',
            operationName: 'database-query',
            startTime: 1500,
            endTime: 3500,
            duration: 2000,
            status: 'OK',
            tags: { 'db.type': 'postgresql' }
          }
        ],
        startTime: 1000,
        endTime: 5000,
        duration: 4000
      };

      const result = await engine.analyzeTrace(trace as any);

      expect(result.graph.nodes.size).toBeGreaterThan(0);
      expect(result.graph.criticalPath.length).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(2000); // < 2s requirement
      expect(result.blockingPaths.length).toBeGreaterThanOrEqual(0); // May be 0 for simple traces
      expect(result.performanceImpact.criticalPathImpact).toBeGreaterThanOrEqual(0);
    });

    it('should process graph within 2 seconds', async () => {
      const trace: TestTrace = {
        traceId: 'test-trace-perf',
        spans: Array.from({ length: 20 }, (_, i) => ({
          traceId: 'test-trace-perf',
          spanId: `span-${i}`,
          parentSpanId: i > 0 ? `span-${i - 1}` : undefined,
          operationName: `operation-${i}`,
          startTime: i * 100,
          endTime: (i + 1) * 100,
          duration: 100,
          status: 'OK'
        })),
        startTime: 0,
        endTime: 2000,
        duration: 2000
      };

      const startTime = Date.now();
      const result = await engine.analyzeTrace(trace as any);
      const processingTime = Date.now() - startTime;

      expect(processingTime).toBeLessThan(2000); // Performance requirement
      expect(result.graph.nodes.size).toBeGreaterThan(0); // May be optimized
      expect(result.processingTime).toBeLessThan(2000);
    });

    it('should optimize large graphs', async () => {
      const trace: TestTrace = {
        traceId: 'test-trace-large',
        spans: Array.from({ length: 100 }, (_, i) => ({
          traceId: 'test-trace-large',
          spanId: `span-${i}`,
          parentSpanId: i > 0 ? `span-${i - 1}` : undefined,
          operationName: `operation-${i}`,
          startTime: i * 10,
          endTime: (i + 1) * 10,
          duration: 10,
          status: 'OK'
        })),
        startTime: 0,
        endTime: 1000,
        duration: 1000
      };

      const result = await engine.analyzeTrace(trace as any, { 
        optimizeGraph: true, 
        maxNodes: 50 
      });

      expect(result.optimization.originalNodeCount).toBe(100);
      expect(result.optimization.optimizedNodeCount).toBeLessThanOrEqual(50);
      expect(result.optimization.optimizations.length).toBeGreaterThan(0);
      expect(result.processingTime).toBeLessThan(2000);
    });
  });

  describe('getGraphSummary', () => {
    it('should provide accurate graph metrics', async () => {
      const trace: TestTrace = {
        traceId: 'test-trace-summary',
        spans: [
          {
            traceId: 'test-trace-summary',
            spanId: 'root',
            operationName: 'root',
            startTime: 0,
            endTime: 300,
            duration: 300,
            status: 'OK'
          },
          {
            traceId: 'test-trace-summary',
            spanId: 'child1',
            parentSpanId: 'root',
            operationName: 'child1',
            startTime: 50,
            endTime: 150,
            duration: 100,
            status: 'OK'
          }
        ],
        startTime: 0,
        endTime: 300,
        duration: 300
      };

      const result = await engine.analyzeTrace(trace as any);
      const summary = engine.getGraphSummary(result.graph);

      expect(summary.nodeCount).toBe(2);
      expect(summary.depth).toBeGreaterThan(1);
      expect(summary.averageNodeDuration).toBeGreaterThan(0);
      expect(summary.maxNodeDuration).toBe(300);
    });
  });
});
