import { TraceLens } from '@tracelens/browser-sdk';

let tracer: TraceLens | null = null;

export function initializeTraceLens() {
  if (tracer) {
    return tracer;
  }

  tracer = new TraceLens({
    projectKey: 'react-example-project',
    endpoint: 'http://localhost:3001/api/events',
    sampling: 1.0, // 100% sampling for demo
    debug: true // Enable debug logging
  });

  tracer.start();

  // Track initial page load
  tracer.track('app-initialized', {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  console.log('TraceLens initialized successfully');
  return tracer;
}

export function getTracer(): TraceLens | null {
  return tracer;
}
