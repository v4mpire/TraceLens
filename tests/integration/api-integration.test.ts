import request from 'supertest';
import { expect, test, describe } from '@jest/globals';

describe('API Integration Tests', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3001';
  const testProjectKey = 'test-integration-key';

  describe('Events API', () => {
    test('should accept single event', async () => {
      const event = {
        type: 'performance',
        timestamp: Date.now(),
        data: {
          metric: 'LCP',
          value: 2500,
          url: 'https://example.com'
        }
      };

      const response = await request(baseURL)
        .post('/api/events')
        .set('X-API-Key', testProjectKey)
        .send(event)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        eventId: expect.any(String)
      });
    });

    test('should accept batch events', async () => {
      const events = [
        {
          type: 'performance',
          timestamp: Date.now(),
          data: { metric: 'LCP', value: 2500 }
        },
        {
          type: 'performance',
          timestamp: Date.now() + 1000,
          data: { metric: 'FID', value: 100 }
        }
      ];

      const response = await request(baseURL)
        .post('/api/events/batch')
        .set('X-API-Key', testProjectKey)
        .send({ events })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        processed: 2,
        eventIds: expect.arrayContaining([
          expect.any(String),
          expect.any(String)
        ])
      });
    });

    test('should reject invalid events', async () => {
      const invalidEvent = {
        type: 'invalid-type',
        // Missing required fields
      };

      await request(baseURL)
        .post('/api/events')
        .set('X-API-Key', testProjectKey)
        .send(invalidEvent)
        .expect(400);
    });

    test('should require API key authentication', async () => {
      const event = {
        type: 'performance',
        timestamp: Date.now(),
        data: { metric: 'LCP', value: 2500 }
      };

      await request(baseURL)
        .post('/api/events')
        .send(event)
        .expect(401);
    });

    test('should handle rate limiting', async () => {
      const event = {
        type: 'performance',
        timestamp: Date.now(),
        data: { metric: 'LCP', value: 2500 }
      };

      // Send many requests rapidly
      const requests = Array(20).fill(null).map(() =>
        request(baseURL)
          .post('/api/events')
          .set('X-API-Key', testProjectKey)
          .send(event)
      );

      const responses = await Promise.allSettled(requests);
      
      // Some requests should be rate limited
      const rateLimited = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Traces API', () => {
    test('should accept OpenTelemetry traces', async () => {
      const trace = {
        traceId: 'test-trace-123',
        spanId: 'test-span-456',
        operationName: 'GET /api/test',
        startTime: Date.now() - 1000,
        endTime: Date.now(),
        tags: {
          'http.method': 'GET',
          'http.url': '/api/test'
        },
        dependencies: {
          packages: ['express', 'lodash'],
          versions: { express: '4.18.0', lodash: '4.17.21' }
        }
      };

      const response = await request(baseURL)
        .post('/api/traces')
        .set('X-API-Key', testProjectKey)
        .send(trace)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        traceId: 'test-trace-123'
      });
    });

    test('should handle OTLP format traces', async () => {
      const otlpTrace = {
        resourceSpans: [{
          resource: {
            attributes: [{
              key: 'service.name',
              value: { stringValue: 'test-service' }
            }]
          },
          instrumentationLibrarySpans: [{
            spans: [{
              traceId: Buffer.from('test-trace-789').toString('base64'),
              spanId: Buffer.from('test-span-012').toString('base64'),
              name: 'test-operation',
              startTimeUnixNano: (Date.now() - 1000) * 1000000,
              endTimeUnixNano: Date.now() * 1000000
            }]
          }]
        }]
      };

      const response = await request(baseURL)
        .post('/api/traces/otlp')
        .set('X-API-Key', testProjectKey)
        .send(otlpTrace)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        processed: 1
      });
    });
  });

  describe('Analysis API', () => {
    test('should analyze traces and return insights', async () => {
      // First, submit some traces
      const traces = [
        {
          traceId: 'analysis-test-1',
          spanId: 'span-1',
          operationName: 'GET /api/fast',
          startTime: Date.now() - 2000,
          endTime: Date.now() - 1900,
          tags: { 'http.method': 'GET' }
        },
        {
          traceId: 'analysis-test-2',
          spanId: 'span-2',
          operationName: 'GET /api/slow',
          startTime: Date.now() - 1000,
          endTime: Date.now() - 200,
          tags: { 'http.method': 'GET' }
        }
      ];

      for (const trace of traces) {
        await request(baseURL)
          .post('/api/traces')
          .set('X-API-Key', testProjectKey)
          .send(trace);
      }

      // Request analysis
      const response = await request(baseURL)
        .get('/api/analysis')
        .set('X-API-Key', testProjectKey)
        .query({ projectKey: testProjectKey })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        analysis: {
          criticalPath: expect.any(Array),
          bottlenecks: expect.any(Array),
          dependencyGraph: expect.objectContaining({
            nodes: expect.any(Array),
            edges: expect.any(Array)
          })
        }
      });
    });
  });

  describe('Health Check', () => {
    test('should return service health status', async () => {
      const response = await request(baseURL)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(Number),
        services: expect.objectContaining({
          database: expect.any(String),
          redis: expect.any(String)
        })
      });
    });
  });

  describe('Security Analysis', () => {
    test('should return security risk assessment', async () => {
      const response = await request(baseURL)
        .get('/api/security/risks')
        .set('X-API-Key', testProjectKey)
        .query({ projectKey: testProjectKey })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        risks: expect.any(Array),
        summary: expect.objectContaining({
          totalVulnerabilities: expect.any(Number),
          riskLevels: expect.objectContaining({
            THEORETICAL: expect.any(Number),
            POSSIBLE: expect.any(Number),
            LIKELY: expect.any(Number),
            ACTIVE: expect.any(Number)
          })
        })
      });
    });
  });
});
