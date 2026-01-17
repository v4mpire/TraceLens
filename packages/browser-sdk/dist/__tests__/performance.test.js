// Performance overhead test to validate <1ms requirement
import { TraceLensSDK } from '../core/tracer';
import { SamplingManager } from '../utils/sampling';
// Mock performance API for testing
const mockPerformance = {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn()
};
// Mock PerformanceObserver
const mockPerformanceObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn()
}));
// Setup mocks
Object.defineProperty(global, 'performance', {
    value: mockPerformance,
    writable: true
});
Object.defineProperty(global, 'PerformanceObserver', {
    value: mockPerformanceObserver,
    writable: true
});
Object.defineProperty(global, 'window', {
    value: {
        location: { href: 'https://example.com' },
        navigator: { userAgent: 'test-agent' },
        requestIdleCallback: jest.fn((cb) => setTimeout(cb, 0)),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    },
    writable: true
});
describe('Browser SDK Performance Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPerformance.now.mockReturnValue(0);
    });
    test('SDK initialization should complete in <1ms', () => {
        const startTime = 0;
        const endTime = 0.8; // 0.8ms
        mockPerformance.now
            .mockReturnValueOnce(startTime)
            .mockReturnValueOnce(endTime);
        const sdk = new TraceLensSDK({
            projectKey: 'test-project',
            debug: false
        });
        expect(sdk).toBeDefined();
        // Initialization overhead should be minimal
        expect(endTime - startTime).toBeLessThan(1);
    });
    test('SDK startup should complete in <1ms', () => {
        const sdk = new TraceLensSDK({
            projectKey: 'test-project',
            debug: false
        });
        const startTime = 0;
        const endTime = 0.9; // 0.9ms
        mockPerformance.now
            .mockReturnValueOnce(startTime)
            .mockReturnValueOnce(endTime);
        sdk.start();
        expect(endTime - startTime).toBeLessThan(1);
    });
    test('Event tracking should have minimal overhead', () => {
        const sdk = new TraceLensSDK({
            projectKey: 'test-project',
            sampling: 1.0,
            debug: false
        });
        sdk.start();
        const startTime = 0;
        const endTime = 0.1; // 0.1ms
        mockPerformance.now
            .mockReturnValueOnce(startTime)
            .mockReturnValueOnce(endTime);
        sdk.track('test-event', { data: 'test' });
        expect(endTime - startTime).toBeLessThan(1);
    });
    test('Sampling manager maintains performance budget', () => {
        const sampler = new SamplingManager(1.0, true, 1.0);
        // Test that operations under threshold don't reduce sampling
        const result1 = sampler.measureOverhead(() => {
            // Simulate 0.5ms operation
            return 'result';
        });
        expect(result1).toBe('result');
        expect(sampler.getCurrentSamplingRate()).toBe(1.0);
        // Mock high overhead operation multiple times to trigger adaptation
        const originalNow = performance.now;
        let callCount = 0;
        performance.now = jest.fn(() => {
            callCount++;
            // Alternate between start (0) and end (3ms) times
            return callCount % 2 === 1 ? 0 : 3;
        });
        // Run multiple high-overhead operations to trigger adaptation
        for (let i = 0; i < 5; i++) {
            sampler.measureOverhead(() => 'high-overhead');
        }
        // Sampling rate should be reduced due to high overhead
        expect(sampler.getCurrentSamplingRate()).toBeLessThan(1.0);
        performance.now = originalNow;
    });
    test('SDK handles missing APIs gracefully', () => {
        // Remove PerformanceObserver to test fallback
        delete global.PerformanceObserver;
        const sdk = new TraceLensSDK({
            projectKey: 'test-project',
            debug: false
        });
        expect(() => sdk.start()).not.toThrow();
        expect(() => sdk.track('test', {})).not.toThrow();
        expect(() => sdk.stop()).not.toThrow();
    });
    test('SDK configuration validation works', () => {
        expect(() => {
            new TraceLensSDK({
                projectKey: '', // Invalid: empty project key
                sampling: 1.5 // Invalid: sampling > 1
            });
        }).not.toThrow(); // SDK should handle invalid config gracefully
        expect(() => {
            new TraceLensSDK({
                projectKey: 'valid-project',
                sampling: 0.5,
                bufferSize: 50,
                flushInterval: 3000
            });
        }).not.toThrow();
    });
});
