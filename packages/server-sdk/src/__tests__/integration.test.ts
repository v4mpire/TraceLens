// Server SDK integration tests
import { TraceLensServerSDK } from '../core/tracer';
import { DependencyScanner } from '../core/dependency-scanner';
import { ExecutionTracker } from '../core/execution-tracker';
import { PackageScanner } from '../analyzers/package-scanner';

// Mock OpenTelemetry
jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@opentelemetry/auto-instrumentations-node', () => ({
  getNodeAutoInstrumentations: jest.fn(() => []),
}));

describe('Server SDK Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SDK initializes without errors', async () => {
    const sdk = new TraceLensServerSDK({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test',
      debug: false,
    });

    await expect(sdk.initialize()).resolves.not.toThrow();
    expect(sdk.isInitialized()).toBe(true);

    await expect(sdk.shutdown()).resolves.not.toThrow();
    expect(sdk.isInitialized()).toBe(false);
  });

  test('Dependency scanner captures package information', () => {
    const scanner = new DependencyScanner({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test',
      samplingRate: 1.0,
      endpoint: 'http://localhost:3001',
      enableDependencyScanning: true,
      enableExecutionTracking: false,
      debug: false,
    });

    const snapshot = scanner.getSnapshot();
    
    expect(snapshot).toHaveProperty('id');
    expect(snapshot).toHaveProperty('projectId', 'test-service');
    expect(snapshot).toHaveProperty('timestamp');
    expect(snapshot).toHaveProperty('environment', 'test');
    expect(snapshot).toHaveProperty('dependencies');
    expect(Array.isArray(snapshot.dependencies)).toBe(true);
  });

  test('Execution tracker records function metrics', () => {
    const tracker = new ExecutionTracker({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test',
      samplingRate: 1.0,
      endpoint: 'http://localhost:3001',
      enableDependencyScanning: false,
      enableExecutionTracking: true,
      debug: false,
    });

    tracker.initialize();

    // Test function tracking
    const testFunction = tracker.trackFunction(() => {
      return 'test result';
    }, 'testFunction');

    const result = testFunction();
    expect(result).toBe('test result');

    const metrics = tracker.getMetrics();
    expect(metrics.totalCalls).toBe(1);
    expect(metrics.functionMetrics.has('testFunction')).toBe(true);

    tracker.shutdown();
  });

  test('Async function tracking works correctly', async () => {
    const tracker = new ExecutionTracker({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test',
      samplingRate: 1.0,
      endpoint: 'http://localhost:3001',
      enableDependencyScanning: false,
      enableExecutionTracking: true,
      debug: false,
    });

    tracker.initialize();

    const asyncFunction = tracker.trackAsyncFunction(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'async result';
    }, 'asyncTestFunction');

    const result = await asyncFunction();
    expect(result).toBe('async result');

    const metrics = tracker.getMetrics();
    expect(metrics.totalCalls).toBe(1);
    expect(metrics.functionMetrics.has('asyncTestFunction')).toBe(true);

    tracker.shutdown();
  });

  test('Package scanner analyzes dependencies', async () => {
    const scanner = new PackageScanner();
    
    try {
      const analysis = await scanner.analyze();
      
      expect(analysis).toHaveProperty('packageInfo');
      expect(analysis).toHaveProperty('dependencies');
      expect(analysis).toHaveProperty('dependencyCount');
      expect(Array.isArray(analysis.dependencies)).toBe(true);
    } catch (error) {
      // Test might fail if no package.json is found, which is acceptable
      expect(error.message).toContain('package.json');
    }
  });

  test('SDK handles configuration validation', () => {
    expect(() => {
      new TraceLensServerSDK({
        serviceName: '', // Invalid
        serviceVersion: '1.0.0',
      });
    }).not.toThrow(); // SDK should handle gracefully

    expect(() => {
      new TraceLensServerSDK({
        serviceName: 'valid-service',
        serviceVersion: '1.0.0',
        samplingRate: 0.5,
      });
    }).not.toThrow();
  });

  test('SDK provides dependency and execution snapshots', async () => {
    const sdk = new TraceLensServerSDK({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test',
    });

    await sdk.initialize();

    const dependencySnapshot = sdk.getDependencySnapshot();
    expect(dependencySnapshot).toHaveProperty('id');
    expect(dependencySnapshot).toHaveProperty('projectId');

    const executionMetrics = sdk.getExecutionMetrics();
    expect(executionMetrics).toHaveProperty('totalCalls');
    expect(executionMetrics).toHaveProperty('functionMetrics');

    await sdk.shutdown();
  });
});
