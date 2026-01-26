# TraceLens Troubleshooting Guide

Comprehensive solutions for TraceLens deployment, integration, and usage issues.

## Installation Issues

### Port Conflicts
**Problem**: TraceLens conflicts with your application port (both on localhost:3000)

**Solution**: Use configurable ports
```bash
# Run TraceLens on different ports
python3 install.py --dashboard-port 3002 --api-port 3001

# Environment variables approach
export TRACELENS_DASHBOARD_PORT=3002
export TRACELENS_API_PORT=3001
python3 install.py
```

### Docker Compose Fails to Start
**Problem**: Services fail to start with port conflicts or dependency issues.

**Solution**:
```bash
# Stop conflicting services
sudo lsof -i :3000 :3001 :5432 :6379
sudo kill -9 <PID>

# Clean up and restart
docker-compose down -v
docker-compose up -d
```

### NPM Install Fails
**Problem**: Package installation fails with dependency conflicts.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## SDK Integration Issues

### SDK Package Import Issues
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

### Browser SDK Not Tracking Events
**Problem**: No events appearing in dashboard.

**Checklist**:
- ✅ Correct endpoint URL (http://localhost:3001/api/events)
- ✅ Valid project key
- ✅ CORS enabled on API server
- ✅ Network tab shows successful POST requests

**Debug**:
```javascript
const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events',
  debug: true // Enable debug logging
});
```

### Server SDK Not Sending Traces
**Problem**: No traces in dashboard from backend.

**Checklist**:
- ✅ Middleware properly installed
- ✅ OpenTelemetry dependencies installed
- ✅ Correct trace endpoint
- ✅ No firewall blocking requests

**Debug**:
```javascript
const tracer = new TraceLensServerSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces',
  debug: true
});
```

## Framework-Specific Issues

### Next.js Integration Issues
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

### Docker Build Issues
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

## Database Issues

### PostgreSQL Connection Errors
**Problem**: Cannot connect to database.

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Database Migration Failures
**Problem**: Schema migrations fail.

**Solution**:
```bash
# Manual migration
docker-compose exec postgres psql -U tracelens -d tracelens -f /docker-entrypoint-initdb.d/init.sql
```

## Network Issues

### CORS Errors in Browser
**Problem**: Browser blocks API requests due to CORS.

**Solution**: Add CORS headers to ingestion service:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### API Requests Timing Out
**Problem**: Requests to TraceLens API timeout.

**Solutions**:
- Check network connectivity
- Verify API server is running
- Increase request timeout in SDK
- Check firewall settings

## Performance Issues

### High Memory Usage
**Problem**: TraceLens consuming too much memory.

**Solutions**:
- Reduce sampling rate in SDK configuration
- Increase flush interval to batch more events
- Check for memory leaks in custom instrumentation

```javascript
const tracer = new TraceLensSDK({
  sampling: 0.1, // Sample 10% of events
  flushInterval: 10000 // Flush every 10 seconds
});
```

### Slow Dashboard Loading
**Problem**: Dashboard takes >5 seconds to load.

**Solutions**:
- Check database query performance
- Verify Redis cache is working
- Reduce data retention period
- Optimize dependency graph complexity

### High CPU Usage
**Problem**: TraceLens using excessive CPU in production.

**Solutions**:
- Enable sampling to reduce event volume
- Optimize database queries
- Scale horizontally with multiple instances
- Use Redis for caching

## Development Workflow

### Development Environment Setup
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

### Environment Configuration
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

### TypeScript Compilation Errors
**Problem**: Build fails with TypeScript errors.

**Solution**:
```bash
# Clean build cache
npm run clean

# Rebuild all packages
npm run build

# Check specific package
cd packages/browser-sdk
npm run type-check
```

## AI Integration Issues

### MCP Integration Issues
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

## Validation Commands

### Quick Health Checks
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

### Service Status
```bash
# All services status
docker-compose ps

# Service logs
docker-compose logs web
docker-compose logs ingestion-service
docker-compose logs postgres
docker-compose logs redis

# API health check
curl http://localhost:3001/api/health
```

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

## Debug Mode

### Enable Debug Logging
```javascript
// Browser SDK
const tracer = new TraceLensSDK({
  debug: true,
  logLevel: 'debug'
});

// Server SDK  
const tracer = new TraceLensServerSDK({
  debug: true,
  logLevel: 'debug'
});
```

### Log Locations
- **Browser Console**: F12 → Console tab
- **Server Logs**: `docker-compose logs <service>`
- **Database Logs**: `docker-compose logs postgres`
- **Application Logs**: Check stdout/stderr

## Getting Help

1. **Check logs**: Look for TraceLens errors in browser console and server logs
2. **Verify services**: Ensure TraceLens API and dashboard are running
3. **Test endpoints**: Use curl to verify API connectivity
4. **Check ports**: Ensure no port conflicts with your application
5. **Review configuration**: Verify environment variables and MCP setup

### Community Support
- **GitHub Issues**: [Report bugs](https://github.com/v4mpire/TraceLens/issues)
- **Discussions**: [Community help](https://github.com/v4mpire/TraceLens/discussions)
- **Documentation**: [Full docs](../README.md)

---

**Most issues are resolved by checking logs and verifying configuration.** 🔍