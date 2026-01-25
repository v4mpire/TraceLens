# TraceLens Integration Troubleshooting Guide

## Common Integration Issues and Solutions

### 1. Port Conflicts

**Problem**: TraceLens dashboard conflicts with your application port (both on localhost:3000)

**Solution**: Use configurable ports
```bash
# Run TraceLens on different ports
python3 install.py --dashboard-port 3002 --api-port 3001

# Your app can stay on localhost:3000
# TraceLens dashboard will be on localhost:3002
```

**Environment Variables**:
```bash
export TRACELENS_DASHBOARD_PORT=3002
export TRACELENS_API_PORT=3001
python3 install.py
```

### 2. SDK Package Import Issues

**Problem**: `Module not found: Can't resolve '@tracelens/browser-sdk'`

**Solutions**:

#### Option A: Verify Package Installation
```bash
npm ls @tracelens/browser-sdk
npm ls @tracelens/server-sdk

# If not found, install:
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

#### Option B: Use Direct API Calls (Temporary Workaround)
```typescript
// Frontend - Direct API integration
const sendEvent = async (eventData: any) => {
  try {
    await fetch('http://localhost:3001/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
  } catch (error) {
    console.warn('TraceLens event failed:', error);
  }
};

// Backend - Direct API integration
const sendTrace = async (traceData: any) => {
  try {
    await fetch('http://localhost:3001/api/traces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(traceData)
    });
  } catch (error) {
    console.warn('TraceLens trace failed:', error);
  }
};
```

### 3. Docker Build Issues

**Problem**: Docker builds fail when importing TraceLens SDKs

**Solution**: Multi-stage Docker build
```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# Skip TraceLens imports during build if needed
ENV SKIP_TRACELENS=true
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
CMD ["npm", "start"]
```

### 4. Next.js Integration Issues

**Problem**: Next.js specific integration challenges

**Solution**: Conditional loading
```typescript
// pages/_app.tsx or app/layout.tsx
import { useEffect } from 'react';

export default function App({ Component, pageProps }: any) {
  useEffect(() => {
    // Only load TraceLens in browser environment
    if (typeof window !== 'undefined') {
      import('@tracelens/browser-sdk').then(({ TraceLensSDK }) => {
        const tracer = new TraceLensSDK({
          projectKey: process.env.NEXT_PUBLIC_PROJECT_NAME || 'my-app',
          endpoint: process.env.NEXT_PUBLIC_TRACELENS_ENDPOINT || 'http://localhost:3001/api/events'
        });
        tracer.start();
      }).catch(error => {
        console.warn('TraceLens failed to load:', error);
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
```

### 5. Development Workflow

**Problem**: Need to run both TraceLens and your app simultaneously

**Solution**: Use different terminals and ports
```bash
# Terminal 1: Start TraceLens
cd TraceLens
python3 install.py --dashboard-port 3002

# Terminal 2: Start your app
cd your-project
npm run dev  # Runs on localhost:3000

# Access:
# Your app: http://localhost:3000
# TraceLens: http://localhost:3002
```

### 6. Environment Configuration

**Problem**: Different endpoints for development vs production

**Solution**: Environment-based configuration
```bash
# .env.local (development)
NEXT_PUBLIC_TRACELENS_ENDPOINT=http://localhost:3001/api/events
TRACELENS_API_ENDPOINT=http://localhost:3001/api/traces

# .env.production (production)
NEXT_PUBLIC_TRACELENS_ENDPOINT=https://your-tracelens.com/api/events
TRACELENS_API_ENDPOINT=https://your-tracelens.com/api/traces
```

### 7. MCP Integration Issues

**Problem**: AI queries not working

**Solutions**:
```bash
# Check MCP server installation
which tracelens-mcp

# Verify MCP configuration
cat ~/.kiro/settings/mcp.json

# Test MCP connection
kiro-cli "/mcp"

# Restart Kiro CLI after TraceLens setup
```

### 8. Performance Impact

**Problem**: Concerned about performance overhead

**Solution**: TraceLens is designed for <1ms overhead
```typescript
// Configure sampling for production
const tracer = new TraceLensSDK({
  projectKey: 'my-app',
  endpoint: 'http://localhost:3001/api/events',
  sampling: {
    rate: 0.1, // Sample 10% of events in production
    maxEventsPerSecond: 100
  }
});
```

## Quick Validation Commands

```bash
# Test TraceLens API
curl http://localhost:3001/health

# Test TraceLens dashboard
curl http://localhost:3002

# Test event ingestion
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{"message":"hello"}}'

# Test AI integration
kiro-cli "Check TraceLens health status"
```

## Getting Help

1. **Check logs**: Look for TraceLens errors in browser console and server logs
2. **Verify services**: Ensure TraceLens API and dashboard are running
3. **Test endpoints**: Use curl to verify API connectivity
4. **Check ports**: Ensure no port conflicts with your application
5. **Review configuration**: Verify environment variables and MCP setup

## Common Error Messages

### "EADDRINUSE: address already in use"
- **Cause**: Port conflict
- **Solution**: Use `--dashboard-port` and `--api-port` flags

### "Module not found: @tracelens/browser-sdk"
- **Cause**: Package not properly installed or built
- **Solution**: Use direct API calls or verify package installation

### "Failed to fetch" in browser
- **Cause**: CORS or network connectivity issue
- **Solution**: Ensure TraceLens API is running and accessible

### "MCP server not found"
- **Cause**: MCP server not installed globally
- **Solution**: `npm install -g @tracelens/mcp-server`

---

**Need more help?** Check the [GitHub Issues](https://github.com/v4mpire/TraceLens/issues) or create a new issue with your specific setup details.
