import React, { useState, useEffect } from 'react';
import { getTracer } from '../tracelens-setup';

interface ErrorPageProps {
  onButtonClick: (buttonName: string) => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ onButtonClick }) => {
  const [errorCount, setErrorCount] = useState(0);
  const tracer = getTracer();

  useEffect(() => {
    tracer?.track('page-view', {
      page: 'error-page',
      timestamp: Date.now(),
      referrer: document.referrer
    });
  }, [tracer]);

  const triggerJavaScriptError = () => {
    onButtonClick('trigger-js-error');
    
    try {
      // Intentionally cause an error
      const obj: any = null;
      obj.nonExistentMethod();
    } catch (error) {
      setErrorCount(prev => prev + 1);
      
      tracer?.track('javascript-error', {
        errorType: 'TypeError',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        page: 'error-page',
        errorCount: errorCount + 1,
        timestamp: Date.now()
      });

      console.error('Tracked JavaScript error:', error);
    }
  };

  const triggerNetworkError = async () => {
    onButtonClick('trigger-network-error');

    try {
      const response = await fetch('https://nonexistent-api.example.com/data');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setErrorCount(prev => prev + 1);

      tracer?.track('network-error', {
        errorType: 'NetworkError',
        message: error instanceof Error ? error.message : 'Network request failed',
        url: 'https://nonexistent-api.example.com/data',
        page: 'error-page',
        errorCount: errorCount + 1,
        timestamp: Date.now()
      });

      console.error('Tracked network error:', error);
    }
  };

  const triggerAsyncError = async () => {
    onButtonClick('trigger-async-error');

    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Async operation failed'));
        }, 1000);
      });
    } catch (error) {
      setErrorCount(prev => prev + 1);

      tracer?.track('async-error', {
        errorType: 'AsyncError',
        message: error instanceof Error ? error.message : 'Async error',
        operation: 'delayed-promise',
        page: 'error-page',
        errorCount: errorCount + 1,
        timestamp: Date.now()
      });

      console.error('Tracked async error:', error);
    }
  };

  const triggerCustomError = () => {
    onButtonClick('trigger-custom-error');

    const customError = new Error('This is a custom error for testing');
    customError.name = 'CustomTestError';

    setErrorCount(prev => prev + 1);

    tracer?.track('custom-error', {
      errorType: 'CustomTestError',
      message: customError.message,
      stack: customError.stack,
      severity: 'warning',
      page: 'error-page',
      errorCount: errorCount + 1,
      timestamp: Date.now()
    });

    console.error('Tracked custom error:', customError);
  };

  return (
    <div className="page">
      <h2>Error Page</h2>
      <p>This page demonstrates error tracking and monitoring capabilities.</p>

      <div className="error-stats">
        <h3>Error Count: {errorCount}</h3>
      </div>

      <div className="actions">
        <button 
          onClick={triggerJavaScriptError}
          className="action-button error-button"
        >
          Trigger JS Error
        </button>

        <button 
          onClick={triggerNetworkError}
          className="action-button error-button"
        >
          Trigger Network Error
        </button>

        <button 
          onClick={triggerAsyncError}
          className="action-button error-button"
        >
          Trigger Async Error
        </button>

        <button 
          onClick={triggerCustomError}
          className="action-button error-button"
        >
          Trigger Custom Error
        </button>
      </div>

      <div className="error-info">
        <h4>Error Tracking Features:</h4>
        <ul>
          <li>JavaScript runtime errors with stack traces</li>
          <li>Network request failures and timeouts</li>
          <li>Async operation errors and rejections</li>
          <li>Custom error events with metadata</li>
          <li>Error frequency and pattern tracking</li>
        </ul>
      </div>

      <div className="info-box">
        <h4>📊 Error Analytics</h4>
        <p>All errors are automatically tracked and sent to TraceLens for analysis. Check the browser console to see the error tracking in action.</p>
        <p>In a real application, these errors would be correlated with performance data to identify problematic code paths.</p>
      </div>
    </div>
  );
};

export default ErrorPage;
