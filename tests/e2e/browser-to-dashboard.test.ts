import { TraceLens } from '@tracelens/browser-sdk';
import { expect, test, describe } from '@jest/globals';

describe('Browser to Dashboard E2E Flow', () => {
  let tracer: TraceLens;
  const mockEndpoint = 'http://localhost:3001/api/events';
  const testProjectKey = 'test-project-key';

  beforeEach(() => {
    // Mock fetch for testing
    global.fetch = jest.fn();
    
    tracer = new TraceLens({
      projectKey: testProjectKey,
      endpoint: mockEndpoint,
      sampling: 1.0 // 100% sampling for tests
    });
  });

  afterEach(() => {
    tracer.stop();
    jest.restoreAllMocks();
  });

  test('should initialize SDK without errors', () => {
    expect(tracer).toBeDefined();
    expect(tracer.isRunning()).toBe(false);
  });

  test('should start tracking and collect performance metrics', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response);

    tracer.start();
    expect(tracer.isRunning()).toBe(true);

    // Simulate performance event
    tracer.track('page-load', {
      url: 'https://example.com',
      loadTime: 1500
    });

    // Wait for batching
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify fetch was called with correct data
    expect(mockFetch).toHaveBeenCalledWith(
      mockEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-API-Key': testProjectKey
        }),
        body: expect.stringContaining('page-load')
      })
    );
  });

  test('should handle API errors gracefully', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    tracer.start();
    tracer.track('test-event', { data: 'test' });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send events')
    );

    consoleSpy.mockRestore();
  });

  test('should batch multiple events efficiently', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response);

    tracer.start();

    // Send multiple events
    for (let i = 0; i < 5; i++) {
      tracer.track(`event-${i}`, { index: i });
    }

    await new Promise(resolve => setTimeout(resolve, 150));

    // Should batch events into single request
    expect(mockFetch).toHaveBeenCalledTimes(1);
    
    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1]?.body as string);
    expect(body.events).toHaveLength(5);
  });

  test('should respect sampling configuration', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    } as Response);

    // Create tracer with 0% sampling
    const sampledTracer = new TraceLens({
      projectKey: testProjectKey,
      endpoint: mockEndpoint,
      sampling: 0.0
    });

    sampledTracer.start();
    sampledTracer.track('sampled-event', { data: 'test' });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not send any requests due to sampling
    expect(mockFetch).not.toHaveBeenCalled();

    sampledTracer.stop();
  });
});
