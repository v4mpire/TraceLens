// Global test setup
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock fetch globally for browser SDK tests
global.fetch = jest.fn();
