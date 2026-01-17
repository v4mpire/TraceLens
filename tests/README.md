# TraceLens Integration Tests

This directory contains comprehensive end-to-end and integration tests for the TraceLens platform, validating the complete data flow from SDK ingestion through dashboard visualization.

## Test Structure

### End-to-End Tests (`tests/e2e/`)
- **`browser-to-dashboard.test.ts`** - Complete browser SDK to dashboard flow
- **`server-to-analysis.test.ts`** - Server SDK to analysis engine integration

### Integration Tests (`tests/integration/`)
- **`api-integration.test.ts`** - API endpoint integration testing

## Test Coverage

### Browser SDK Integration
- SDK initialization and configuration
- Event tracking and batching
- Data transmission and error handling
- Sampling configuration validation
- Performance overhead verification

### Server SDK Integration  
- OpenTelemetry trace generation
- Dependency metadata capture
- Middleware integration (Express.js)
- Distributed tracing correlation
- Performance impact measurement

### API Integration
- Event ingestion endpoints (single and batch)
- Trace ingestion (native and OTLP formats)
- Data validation and error handling
- Authentication and rate limiting
- Analysis and security endpoints

### Analysis Engine Integration
- Trace processing and graph construction
- Critical path identification
- Performance bottleneck detection
- Causal dependency analysis
- Deterministic result validation

## Running Tests

### Prerequisites
- Node.js 18+
- TraceLens packages built (`npm run build` in project root)
- Optional: TraceLens services running for full integration

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
# End-to-end tests only
npm run test:e2e

# Integration tests only  
npm run test:integration

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Individual Test Files
```bash
# Browser SDK flow
npx jest tests/e2e/browser-to-dashboard.test.ts

# Server SDK flow
npx jest tests/e2e/server-to-analysis.test.ts

# API integration
npx jest tests/integration/api-integration.test.ts
```

## Test Configuration

### Environment Variables
```bash
# API base URL for integration tests
API_BASE_URL=http://localhost:3001

# Test project key
TEST_PROJECT_KEY=test-integration-key

# Test timeout (milliseconds)
TEST_TIMEOUT=30000
```

### Mock Configuration
Tests use comprehensive mocking for:
- HTTP requests (fetch API)
- Database operations
- External service calls
- File system operations
- Time-dependent operations

## Validation Scenarios

### Performance Requirements
- ✅ Browser SDK overhead < 1ms
- ✅ API response time < 100ms  
- ✅ Analysis processing < 2s
- ✅ Dashboard load time < 2s

### Functional Requirements
- ✅ Event ingestion and validation
- ✅ Trace correlation and analysis
- ✅ Dependency graph construction
- ✅ Security risk assessment
- ✅ Error handling and resilience

### Integration Requirements
- ✅ SDK to API data flow
- ✅ API to analysis pipeline
- ✅ Analysis to dashboard display
- ✅ Cross-service trace correlation
- ✅ Real-time data processing

## Test Data

### Sample Events
```javascript
// Performance event
{
  type: 'performance',
  timestamp: Date.now(),
  data: {
    metric: 'LCP',
    value: 2500,
    url: 'https://example.com'
  }
}

// Trace data
{
  traceId: 'test-trace-123',
  spanId: 'test-span-456', 
  operationName: 'GET /api/test',
  startTime: Date.now() - 1000,
  endTime: Date.now(),
  tags: {
    'http.method': 'GET',
    'http.url': '/api/test'
  }
}
```

### Mock Services
- **Database Service**: In-memory data with realistic timing
- **External APIs**: Configurable success/failure rates
- **Network Requests**: Controlled latency and error simulation

## Continuous Integration

### GitHub Actions Integration
```yaml
- name: Run Integration Tests
  run: |
    npm run build
    npm run test:integration
  env:
    API_BASE_URL: http://localhost:3001
    TEST_PROJECT_KEY: ci-test-key
```

### Test Reporting
- **Coverage Reports**: HTML and LCOV formats
- **Performance Metrics**: Response time validation
- **Error Tracking**: Comprehensive error scenario testing
- **Regression Detection**: Automated performance threshold validation

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase `TEST_TIMEOUT` environment variable
- Check if TraceLens services are running
- Verify network connectivity

**Mock data issues**
- Clear Jest cache: `npx jest --clearCache`
- Verify mock setup in `jest.setup.js`
- Check test data consistency

**Integration failures**
- Ensure all packages are built: `npm run build`
- Verify API endpoints are accessible
- Check authentication configuration

### Debug Mode
```bash
# Enable debug logging
DEBUG=tracelens:* npm test

# Run specific test with verbose output
npx jest --verbose tests/e2e/browser-to-dashboard.test.ts
```

## Contributing

### Adding New Tests
1. Follow existing test structure and naming conventions
2. Include comprehensive assertions and error scenarios
3. Add performance validation where applicable
4. Update this README with new test descriptions

### Test Guidelines
- **Isolation**: Each test should be independent
- **Deterministic**: Tests should produce consistent results
- **Performance**: Validate timing requirements
- **Error Handling**: Test failure scenarios thoroughly
- **Documentation**: Clear test descriptions and comments

## Next Steps

1. **Expand Coverage**: Add tests for new features and edge cases
2. **Performance Testing**: Load testing for high-volume scenarios  
3. **Security Testing**: Vulnerability and penetration testing
4. **Browser Testing**: Cross-browser compatibility validation
5. **Mobile Testing**: Mobile device and network condition testing
