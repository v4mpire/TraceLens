# TraceLens Universal Integration Guide

## 🚀 One-Command Integration

TraceLens provides a universal prompt that automatically integrates observability into any web application project.

### Quick Integration

```bash
# In your project directory with Kiro CLI
@tracelens-integrate
```

**That's it!** The AI assistant will:
- ✅ Analyze your project structure (React, Vue, Express, etc.)
- ✅ Install TraceLens packages
- ✅ Add frontend monitoring (2 lines)
- ✅ Add backend tracing (3 lines)  
- ✅ Configure environment variables
- ✅ Set up AI integration
- ✅ Update documentation

## Supported Frameworks

### Frontend
- **React** (Create React App, Vite, custom)
- **Next.js** (App Router, Pages Router)
- **Vue** (Vue 3, Nuxt.js)
- **Angular** (Angular 15+)
- **Vanilla JS** (HTML/JS projects)
- **Svelte/SvelteKit**

### Backend
- **Express.js** (CommonJS, ES Modules)
- **Next.js API Routes**
- **Fastify**
- **Koa**
- **Node.js HTTP server**

### Package Managers
- **npm** (default)
- **yarn**
- **pnpm**

## What Gets Added

### Frontend Integration
```javascript
// Automatically added to your main app file
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-name',
  endpoint: 'http://localhost:3001/api/events'
});
tracer.start();
```

### Backend Integration
```javascript
// Automatically added to your server file
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

app.use(createTraceLensMiddleware({
  projectKey: 'your-project-name',
  endpoint: 'http://localhost:3001/api/traces'
}));
```

### Environment Configuration
```bash
# .env.local (automatically created)
PROJECT_NAME=your-project-name
TRACELENS_ENDPOINT=http://localhost:3001/api/traces
NEXT_PUBLIC_TRACELENS_ENDPOINT=http://localhost:3001/api/events
```

### AI Integration
```json
// .kiro/settings/mcp.json (automatically configured)
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001"]
    }
  }
}
```

## After Integration

### Immediate Benefits
- 📊 **Real-time monitoring** at http://localhost:3000
- 🔍 **Performance insights** with exact bottleneck identification
- 🤖 **AI-powered debugging** with natural language queries
- ⚡ **<1ms overhead** - production-safe monitoring

### AI Queries You Can Make
```bash
kiro-cli "What are my app's current performance bottlenecks?"
kiro-cli "Show me the slowest API endpoints"
kiro-cli "How can I optimize the user dashboard load time?"
kiro-cli "What database queries are taking too long?"
kiro-cli "Which frontend components are causing layout shifts?"
```

### Example AI Response
```
Your app has 2 main bottlenecks:

1. /api/users endpoint: 340ms average (85% of requests affected)
   - Root cause: Database query without index on user_id
   - Fix: Add index on user_id column
   
2. Dashboard component: 180ms render time
   - Root cause: Unnecessary re-renders on state change
   - Fix: Use React.memo() or useMemo() for expensive calculations
```

## Prerequisites

### 1. TraceLens Running
```bash
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
python3 install.py
```

### 2. Kiro CLI with MCP
```bash
# Ensure you have Kiro CLI installed
# The integration prompt will configure MCP automatically
```

## Manual Integration (Advanced)

If you prefer manual setup, see the [detailed integration guide](.kiro/prompts/tracelens-integrate.md).

## Troubleshooting

### Integration Failed
1. **Check project structure**: Ensure package.json exists
2. **Verify TraceLens is running**: `curl http://localhost:3001/health`
3. **Check permissions**: Ensure write access to project files
4. **Review logs**: Check console output for specific errors

### AI Queries Not Working
1. **Test MCP connection**: `/mcp` in Kiro CLI
2. **Verify configuration**: Check `.kiro/settings/mcp.json`
3. **Restart Kiro CLI**: Exit and restart after integration

### No Data in Dashboard
1. **Generate traffic**: Visit your app, make API calls
2. **Check endpoints**: Verify TraceLens endpoints in env vars
3. **Review integration**: Ensure SDKs are properly initialized

## Best Practices

### Development
- Use the integration prompt in development environment first
- Test with sample traffic before production deployment
- Monitor the TraceLens dashboard during integration

### Production
- Update environment variables for production endpoints
- Ensure TraceLens instance is deployed and accessible
- Monitor performance impact (should be <1ms)

### Team Usage
- Commit the TraceLens integration to version control
- Share MCP configuration with team members
- Document custom TraceLens queries in project README

## Support

- **GitHub Issues**: [TraceLens Repository](https://github.com/v4mpire/TraceLens/issues)
- **Documentation**: [Full API Reference](../docs/API.md)
- **Examples**: [Integration Examples](../examples/)

---

**Ready to transform your debugging workflow?** Use `@tracelens-integrate` in any project and start getting precise performance insights in minutes! 🚀
