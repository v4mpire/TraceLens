# TraceLens React Example

This example demonstrates how to integrate TraceLens browser SDK into a React application for comprehensive frontend performance monitoring.

## Features Demonstrated

- **Performance Tracking**: Web Vitals, page load times, user interactions
- **Error Monitoring**: JavaScript errors, network failures, async operation errors
- **User Journey Tracking**: Navigation events, button clicks, API calls
- **Real-time Analytics**: Performance impact measurement and bottleneck detection

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Build for Production
```bash
npm run build
npm run preview
```

## TraceLens Integration

### 1. SDK Initialization
The TraceLens SDK is initialized in `src/tracelens-setup.ts`:

```typescript
import { TraceLens } from '@tracelens/browser-sdk';

const tracer = new TraceLens({
  projectKey: 'react-example-project',
  endpoint: 'http://localhost:3001/api/events',
  sampling: 1.0, // 100% sampling for demo
  debug: true
});

tracer.start();
```

### 2. Event Tracking
Events are tracked throughout the application:

- **Page Views**: Automatic tracking on component mount
- **User Interactions**: Button clicks, form submissions
- **API Calls**: Performance timing and success/failure tracking
- **Navigation**: Route changes and page transitions
- **Errors**: JavaScript errors, network failures, async errors

### 3. Performance Monitoring
The example includes several performance scenarios:

- **Fast Operations**: Normal page interactions
- **Slow Operations**: CPU-intensive tasks with timing measurement
- **Memory Usage**: Large data structure creation and cleanup
- **Error Scenarios**: Various error types for monitoring

## Example Pages

### Home Page (`/`)
- Basic event tracking
- API call simulation
- User interaction monitoring
- Performance timing measurement

### Slow Page (`/slow`)
- CPU-intensive operations
- Memory allocation tracking
- Performance impact analysis
- Long-running task monitoring

### Error Page (`/error`)
- JavaScript error simulation
- Network error handling
- Async operation failures
- Custom error tracking

## Monitoring in Action

1. **Open Browser DevTools** to see TraceLens events in the console
2. **Check Network Tab** to see event batching and transmission
3. **Navigate between pages** to see page view tracking
4. **Trigger slow operations** to see performance impact measurement
5. **Cause errors** to see error tracking and reporting

## Integration with TraceLens Dashboard

This example sends data to the TraceLens ingestion service at `http://localhost:3001/api/events`. 

To see the full pipeline:
1. Start the TraceLens ingestion service
2. Start this React example
3. Open the TraceLens dashboard
4. Interact with the React app
5. View real-time analytics in the dashboard

## Key Files

- `src/tracelens-setup.ts` - SDK initialization and configuration
- `src/App.tsx` - Main application with navigation tracking
- `src/components/HomePage.tsx` - Basic performance tracking
- `src/components/SlowPage.tsx` - Performance impact demonstration
- `src/components/ErrorPage.tsx` - Error monitoring examples

## Performance Considerations

The TraceLens SDK is designed for production use with:
- **<1ms overhead** for event tracking
- **Non-blocking** data transmission
- **Automatic batching** for efficient network usage
- **Error resilience** to prevent impact on host application

## Next Steps

1. Customize the `projectKey` and `endpoint` for your environment
2. Adjust sampling rates for production deployment
3. Add custom event tracking for your specific use cases
4. Integrate with your existing error monitoring workflow
5. Set up alerts and dashboards based on TraceLens data
