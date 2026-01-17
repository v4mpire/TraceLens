# TraceLens Express API Example

This example demonstrates how to integrate TraceLens server SDK into an Express.js application for comprehensive backend performance monitoring and distributed tracing.

## Features Demonstrated

- **Distributed Tracing**: OpenTelemetry integration with dependency metadata
- **Performance Monitoring**: Request timing, database operations, external API calls
- **Dependency Tracking**: Runtime package analysis and version detection
- **Error Tracking**: Exception monitoring and error correlation
- **Resource Usage**: CPU and memory intensive operation monitoring

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

The API will be available at `http://localhost:3002`.

### Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### Core Endpoints
- `GET /` - API documentation and endpoint list
- `GET /health` - Health check endpoint

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Order Management
- `GET /api/orders` - List orders (with filtering)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/process` - Process order (complex operation)

### Analytics & Performance Testing
- `GET /api/analytics/slow` - Slow analytics operation (3.5s)
- `GET /api/analytics/error` - Error simulation endpoint
- `GET /api/analytics/memory` - Memory intensive operation
- `GET /api/analytics/cpu` - CPU intensive operation
- `GET /api/analytics/dashboard` - Real-time dashboard data

## TraceLens Integration

### 1. SDK Initialization
The TraceLens SDK is initialized in `src/index.ts`:

```typescript
import { TraceLensSDK } from '@tracelens/server-sdk';

const traceLens = new TraceLensSDK({
  projectKey: 'express-example-project',
  endpoint: 'http://localhost:3001/api/traces',
  debug: true
});

// Apply middleware
app.use(traceLens.middleware());
```

### 2. Automatic Tracing
The middleware automatically captures:

- **HTTP Requests**: Method, URL, status code, response time
- **Database Operations**: Query timing and metadata (simulated)
- **External API Calls**: Network request performance
- **Dependency Information**: Package versions and runtime dependencies
- **Error Context**: Exception details and stack traces

### 3. Performance Scenarios

#### Slow Operations (`/api/analytics/slow`)
Demonstrates multi-phase processing with timing:
- Data collection phase (800ms)
- Data aggregation phase (1200ms)  
- Complex calculations phase (1500ms)
- Total processing time: ~3.5 seconds

#### Memory Intensive (`/api/analytics/memory`)
Creates large data structures to demonstrate:
- Memory allocation tracking
- Processing time measurement
- Resource usage monitoring

#### CPU Intensive (`/api/analytics/cpu`)
Performs mathematical calculations to show:
- CPU usage patterns
- Processing efficiency metrics
- Performance bottleneck identification

#### Error Simulation (`/api/analytics/error`)
Triggers various error types:
- `?type=timeout` - Simulates timeout errors
- `?type=database` - Database connection failures
- `?type=validation` - Data validation errors
- `?type=network` - External service failures
- No type parameter - Random error selection

## Example Usage

### Create and Process an Order
```bash
# Create a new user
curl -X POST http://localhost:3002/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Create an order
curl -X POST http://localhost:3002/api/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": ["laptop", "mouse"], "total": 999.99}'

# Process the order (complex operation)
curl -X POST http://localhost:3002/api/orders/1/process
```

### Test Performance Monitoring
```bash
# Trigger slow analytics
curl http://localhost:3002/api/analytics/slow

# Test memory usage
curl "http://localhost:3002/api/analytics/memory?size=5000"

# Test CPU intensive operation
curl "http://localhost:3002/api/analytics/cpu?iterations=5000000"

# Simulate different error types
curl "http://localhost:3002/api/analytics/error?type=database"
curl "http://localhost:3002/api/analytics/error?type=timeout"
```

## Monitoring in Action

1. **Start the API** with `npm run dev`
2. **Make requests** to various endpoints
3. **Check console output** to see TraceLens tracing information
4. **View traces** in the TraceLens dashboard
5. **Analyze performance** bottlenecks and dependencies

## Integration with TraceLens Dashboard

This example sends trace data to the TraceLens ingestion service at `http://localhost:3001/api/traces`.

To see the full pipeline:
1. Start the TraceLens ingestion service
2. Start this Express API example
3. Open the TraceLens dashboard
4. Make API requests
5. View real-time trace analysis and dependency graphs

## Key Files

- `src/index.ts` - Main application with TraceLens middleware setup
- `src/routes/users.ts` - User management endpoints
- `src/routes/orders.ts` - Order processing with complex operations
- `src/routes/analytics.ts` - Performance testing and error simulation
- `src/services/database.ts` - Mock database service with timing simulation

## Performance Characteristics

The TraceLens server SDK provides:
- **Minimal overhead** for production environments
- **Automatic instrumentation** of HTTP requests and database operations
- **Distributed tracing** context propagation
- **Dependency analysis** with runtime package detection
- **Error correlation** with performance data

## Production Considerations

1. **Sampling Configuration**: Adjust sampling rates for production load
2. **Endpoint Configuration**: Update TraceLens ingestion endpoint
3. **Security**: Implement proper API key management
4. **Performance**: Monitor SDK overhead in production
5. **Error Handling**: Ensure TraceLens failures don't impact application

## Next Steps

1. Customize the `projectKey` and `endpoint` for your environment
2. Add custom span attributes for your specific use cases
3. Integrate with your existing logging and monitoring infrastructure
4. Set up alerts based on performance thresholds
5. Use dependency analysis for security vulnerability assessment
