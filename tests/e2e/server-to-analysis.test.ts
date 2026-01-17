import { TraceLensSDK } from '@tracelens/server-sdk';
import { AnalysisEngine } from '@tracelens/analysis-engine';
import { expect, test, describe } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('Server SDK to Analysis E2E Flow', () => {
  let app: express.Application;
  let sdk: TraceLensSDK;
  let analysisEngine: AnalysisEngine;

  beforeEach(() => {
    app = express();
    
    sdk = new TraceLensSDK({
      projectKey: 'test-project',
      endpoint: 'http://localhost:3001/api/traces'
    });

    analysisEngine = new AnalysisEngine();

    // Apply middleware
    app.use(sdk.middleware());
    
    // Test routes
    app.get('/api/users', async (req, res) => {
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 50));
      res.json([{ id: 1, name: 'Test User' }]);
    });

    app.get('/api/slow-endpoint', async (req, res) => {
      // Simulate slow operation
      await new Promise(resolve => setTimeout(resolve, 200));
      res.json({ message: 'Slow response' });
    });
  });

  afterEach(() => {
    sdk.stop();
  });

  test('should generate traces for HTTP requests', async () => {
    const traces: any[] = [];
    
    // Mock trace collection
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(response.body).toEqual([{ id: 1, name: 'Test User' }]);
    
    // Wait for trace processing
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject({
      operationName: 'GET /api/users',
      duration: expect.any(Number),
      tags: expect.objectContaining({
        'http.method': 'GET',
        'http.url': '/api/users'
      })
    });
  });

  test('should capture dependency information', async () => {
    const traces: any[] = [];
    
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    await request(app)
      .get('/api/users')
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100));

    const trace = traces[0];
    expect(trace.dependencies).toBeDefined();
    expect(trace.dependencies.packages).toContain('express');
  });

  test('should analyze traces for performance bottlenecks', async () => {
    const traces: any[] = [];
    
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    // Make requests to both fast and slow endpoints
    await Promise.all([
      request(app).get('/api/users'),
      request(app).get('/api/slow-endpoint')
    ]);

    await new Promise(resolve => setTimeout(resolve, 100));

    // Analyze collected traces
    const analysis = analysisEngine.analyzeTraces(traces);

    expect(analysis.criticalPath).toBeDefined();
    expect(analysis.bottlenecks).toHaveLength(1);
    expect(analysis.bottlenecks[0]).toMatchObject({
      operation: 'GET /api/slow-endpoint',
      type: 'PROCESSING_DELAY',
      impact: expect.any(Number)
    });
  });

  test('should build causal dependency graph', async () => {
    const traces: any[] = [];
    
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    await request(app)
      .get('/api/users')
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100));

    const graph = analysisEngine.buildDependencyGraph(traces);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.edges).toHaveLength(0);
    expect(graph.nodes[0]).toMatchObject({
      id: expect.any(String),
      operation: 'GET /api/users',
      duration: expect.any(Number)
    });
  });

  test('should handle trace correlation across services', async () => {
    const traces: any[] = [];
    
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    // Simulate distributed trace with correlation ID
    const correlationId = 'test-correlation-123';
    
    await request(app)
      .get('/api/users')
      .set('X-Trace-ID', correlationId)
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 100));

    const trace = traces[0];
    expect(trace.traceId).toBe(correlationId);
    expect(trace.parentSpanId).toBeUndefined(); // Root span
  });

  test('should measure performance impact accurately', async () => {
    const traces: any[] = [];
    
    sdk.onTrace((trace) => {
      traces.push(trace);
    });

    const startTime = Date.now();
    
    await request(app)
      .get('/api/slow-endpoint')
      .expect(200);

    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    await new Promise(resolve => setTimeout(resolve, 100));

    const trace = traces[0];
    expect(trace.duration).toBeGreaterThan(200); // Should capture the 200ms delay
    expect(trace.duration).toBeLessThan(actualDuration + 50); // Allow some overhead
  });
});
