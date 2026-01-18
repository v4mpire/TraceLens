# TraceLens Troubleshooting Guide

Common issues and solutions for TraceLens deployment and usage.

## Installation Issues

### Docker Compose Fails to Start
**Problem**: Services fail to start with port conflicts or dependency issues.

**Solution**:
```bash
# Stop any conflicting services
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

## Development Issues

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

### ESLint Warnings
**Problem**: Linting fails with configuration errors.

**Solution**:
```bash
# Install missing dependencies
npm install @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Fix auto-fixable issues
npm run lint -- --fix
```

## Production Deployment

### High CPU Usage
**Problem**: TraceLens using excessive CPU in production.

**Solutions**:
- Enable sampling to reduce event volume
- Optimize database queries
- Scale horizontally with multiple instances
- Use Redis for caching

### Memory Leaks
**Problem**: Memory usage continuously increases.

**Solutions**:
- Check for unclosed database connections
- Verify event buffers are being flushed
- Monitor garbage collection
- Use memory profiling tools

## Getting Help

### Enable Debug Mode
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

### Check Service Health
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

### Common Log Locations
- **Browser Console**: F12 → Console tab
- **Server Logs**: `docker-compose logs <service>`
- **Database Logs**: `docker-compose logs postgres`
- **Application Logs**: Check stdout/stderr

## Still Need Help?

- **GitHub Issues**: [Report bugs](https://github.com/v4mpire/TraceLens/issues)
- **Discussions**: [Community help](https://github.com/v4mpire/TraceLens/discussions)
- **Documentation**: [Full docs](../README.md)

---

**Most issues are resolved by checking logs and verifying configuration.** 🔍
