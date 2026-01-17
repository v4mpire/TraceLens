import React, { useState, useEffect } from 'react';
import { getTracer } from '../tracelens-setup';

interface SlowPageProps {
  onButtonClick: (buttonName: string) => void;
}

const SlowPage: React.FC<SlowPageProps> = ({ onButtonClick }) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const tracer = getTracer();

  useEffect(() => {
    // Track page view with performance timing
    const startTime = performance.now();
    
    tracer?.track('page-view', {
      page: 'slow-page',
      timestamp: Date.now(),
      referrer: document.referrer
    });

    // Simulate slow page load
    setTimeout(() => {
      const endTime = performance.now();
      tracer?.track('page-load-complete', {
        page: 'slow-page',
        loadTime: endTime - startTime,
        timestamp: Date.now()
      });
    }, 100);
  }, [tracer]);

  const performSlowOperation = async () => {
    setProcessing(true);
    onButtonClick('slow-operation');

    const startTime = performance.now();

    try {
      // Simulate CPU-intensive operation
      tracer?.track('operation-start', {
        operation: 'cpu-intensive',
        timestamp: Date.now()
      });

      // Simulate blocking operation
      await new Promise(resolve => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          if (count >= 20) { // 2 seconds of processing
            clearInterval(interval);
            resolve(undefined);
          }
        }, 100);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      setResult(`Operation completed in ${duration.toFixed(2)}ms`);

      // Track operation completion
      tracer?.track('operation-complete', {
        operation: 'cpu-intensive',
        duration,
        success: true,
        timestamp: Date.now()
      });

      // Track performance impact
      tracer?.track('performance-impact', {
        operation: 'cpu-intensive',
        duration,
        impact: duration > 1000 ? 'high' : 'medium',
        timestamp: Date.now()
      });

    } catch (error) {
      tracer?.track('operation-error', {
        operation: 'cpu-intensive',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setProcessing(false);
    }
  };

  const simulateMemoryUsage = () => {
    onButtonClick('memory-test');

    const startTime = performance.now();
    
    // Create large array to simulate memory usage
    const largeArray = new Array(1000000).fill(0).map((_, i) => ({
      id: i,
      data: `Item ${i}`,
      timestamp: Date.now()
    }));

    const endTime = performance.now();

    tracer?.track('memory-allocation', {
      operation: 'large-array-creation',
      arraySize: largeArray.length,
      duration: endTime - startTime,
      memoryUsed: largeArray.length * 50, // Approximate bytes
      timestamp: Date.now()
    });

    // Clean up
    setTimeout(() => {
      largeArray.length = 0;
      tracer?.track('memory-cleanup', {
        operation: 'array-cleanup',
        timestamp: Date.now()
      });
    }, 1000);
  };

  return (
    <div className="page">
      <h2>Slow Page</h2>
      <p>This page demonstrates performance tracking for slow operations.</p>

      <div className="actions">
        <button 
          onClick={performSlowOperation}
          disabled={processing}
          className="action-button slow-button"
        >
          {processing ? 'Processing...' : 'Start Slow Operation'}
        </button>

        <button 
          onClick={simulateMemoryUsage}
          className="action-button"
        >
          Test Memory Usage
        </button>
      </div>

      {result && (
        <div className="result-display">
          <h3>Result:</h3>
          <p>{result}</p>
        </div>
      )}

      <div className="performance-info">
        <h4>Performance Tracking:</h4>
        <ul>
          <li>Page load timing measurement</li>
          <li>CPU-intensive operation duration</li>
          <li>Memory allocation tracking</li>
          <li>Performance impact classification</li>
          <li>Operation success/failure tracking</li>
        </ul>
      </div>

      <div className="warning-box">
        <h4>⚠️ Performance Warning</h4>
        <p>This page intentionally performs slow operations to demonstrate TraceLens performance monitoring capabilities.</p>
      </div>
    </div>
  );
};

export default SlowPage;
