// Test setup for browser SDK
import 'jest-environment-jsdom';
// Mock browser APIs that might not be available in test environment
Object.defineProperty(global, 'requestIdleCallback', {
    value: (callback) => setTimeout(callback, 0),
    writable: true
});
Object.defineProperty(global, 'cancelIdleCallback', {
    value: (id) => clearTimeout(id),
    writable: true
});
// Mock navigator.sendBeacon
Object.defineProperty(global.navigator, 'sendBeacon', {
    value: jest.fn(() => true),
    writable: true
});
// Mock window.setInterval and clearInterval
Object.defineProperty(global.window, 'setInterval', {
    value: jest.fn((callback, delay) => {
        return setTimeout(callback, delay);
    }),
    writable: true
});
Object.defineProperty(global.window, 'clearInterval', {
    value: jest.fn((id) => clearTimeout(id)),
    writable: true
});
// Mock performance.now with high precision
const originalNow = performance.now;
performance.now = jest.fn(() => Date.now() + Math.random());
// Restore after tests
afterAll(() => {
    performance.now = originalNow;
});
