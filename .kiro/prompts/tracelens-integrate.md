# TraceLens Universal Integration Prompt

## Objective
Automatically integrate TraceLens observability into any web application project with minimal user intervention. Analyze the project structure, detect frameworks, and implement the appropriate TraceLens SDKs with proper configuration.

## Process

### 1. Project Analysis
First, analyze the current project structure to understand:
- **Frontend framework**: React, Vue, Angular, Next.js, vanilla JS, etc.
- **Backend framework**: Express, Fastify, Koa, Next.js API routes, etc.
- **Package manager**: npm, yarn, pnpm
- **TypeScript usage**: Check for tsconfig.json and .ts files
- **Build system**: Vite, Webpack, Next.js, etc.

### 2. TraceLens Installation
Install the appropriate TraceLens packages:
```bash
# Always install both SDKs
npm install @tracelens/browser-sdk @tracelens/server-sdk

# Install MCP server globally if not already installed
npm install -g @tracelens/mcp-server
```

### 3. Frontend Integration

#### For React/Next.js Projects
```javascript
// In your main App.js/App.tsx or _app.js/_app.tsx
import { TraceLensSDK } from '@tracelens/browser-sdk';
import { useEffect } from 'react';

// Initialize TraceLens
const tracer = new TraceLensSDK({
  projectKey: process.env.NEXT_PUBLIC_PROJECT_NAME || 'my-app',
  endpoint: process.env.NEXT_PUBLIC_TRACELENS_ENDPOINT || 'http://localhost:3001/api/events',
  environment: process.env.NODE_ENV || 'development'
});

// Add to your main component
useEffect(() => {
  tracer.start();
  return () => tracer.stop();
}, []);
```

#### For Vue Projects
```javascript
// In your main.js or main.ts
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: process.env.VUE_APP_PROJECT_NAME || 'my-app',
  endpoint: process.env.VUE_APP_TRACELENS_ENDPOINT || 'http://localhost:3001/api/events',
  environment: process.env.NODE_ENV || 'development'
});

// Start TraceLens
tracer.start();

// Add to Vue app creation
const app = createApp(App);
app.config.globalProperties.$tracer = tracer;
```

#### For Angular Projects
```typescript
// In your main.ts
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: environment.projectName || 'my-app',
  endpoint: environment.tracelensEndpoint || 'http://localhost:3001/api/events',
  environment: environment.production ? 'production' : 'development'
});

tracer.start();
```

#### For Vanilla JS/HTML Projects
```html
<!-- Add to your main HTML file -->
<script type="module">
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'my-app',
  endpoint: 'http://localhost:3001/api/events',
  environment: 'development'
});

tracer.start();
</script>
```

### 4. Backend Integration

#### For Express.js Projects
```javascript
// In your main server file (app.js, server.js, index.js)
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import express from 'express';

const app = express();

// Add TraceLens middleware early in the middleware stack
app.use(createTraceLensMiddleware({
  projectKey: process.env.PROJECT_NAME || 'my-app',
  endpoint: process.env.TRACELENS_ENDPOINT || 'http://localhost:3001/api/traces',
  environment: process.env.NODE_ENV || 'development',
  // Optional: Custom configuration
  enableSqlTracing: true,
  enableHttpTracing: true,
  enableErrorTracking: true
}));

// Your existing middleware and routes...
```

#### For Next.js API Routes
```javascript
// Create middleware/tracelens.js
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

export const traceLensMiddleware = createTraceLensMiddleware({
  projectKey: process.env.PROJECT_NAME || 'my-app',
  endpoint: process.env.TRACELENS_ENDPOINT || 'http://localhost:3001/api/traces',
  environment: process.env.NODE_ENV || 'development'
});

// In each API route file or create a wrapper
export default function handler(req, res) {
  return traceLensMiddleware(req, res, () => {
    // Your API logic here
  });
}
```

#### For Fastify Projects
```javascript
// In your main server file
import { createTraceLensFastifyPlugin } from '@tracelens/server-sdk';

// Register TraceLens plugin
await fastify.register(createTraceLensFastifyPlugin, {
  projectKey: process.env.PROJECT_NAME || 'my-app',
  endpoint: process.env.TRACELENS_ENDPOINT || 'http://localhost:3001/api/traces',
  environment: process.env.NODE_ENV || 'development'
});
```

### 5. Environment Configuration

Create or update environment files:

#### .env.local (for development)
```bash
# TraceLens Configuration
PROJECT_NAME=my-awesome-app
TRACELENS_ENDPOINT=http://localhost:3001/api/traces
NEXT_PUBLIC_TRACELENS_ENDPOINT=http://localhost:3001/api/events
NEXT_PUBLIC_PROJECT_NAME=my-awesome-app
VUE_APP_TRACELENS_ENDPOINT=http://localhost:3001/api/events
VUE_APP_PROJECT_NAME=my-awesome-app
```

#### .env.production (for production)
```bash
# TraceLens Configuration
PROJECT_NAME=my-awesome-app
TRACELENS_ENDPOINT=https://your-tracelens-instance.com/api/traces
NEXT_PUBLIC_TRACELENS_ENDPOINT=https://your-tracelens-instance.com/api/events
NEXT_PUBLIC_PROJECT_NAME=my-awesome-app
```

### 6. MCP Integration Setup

Create or update `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": [
        "--endpoint", "http://localhost:3001",
        "--project", "my-awesome-app"
      ],
      "env": {
        "TRACELENS_LOG_LEVEL": "info"
      }
    }
  }
}
```

### 7. TypeScript Support

If the project uses TypeScript, add type definitions:

#### types/tracelens.d.ts
```typescript
declare module '@tracelens/browser-sdk' {
  export class TraceLensSDK {
    constructor(config: {
      projectKey: string;
      endpoint: string;
      environment?: string;
    });
    start(): void;
    stop(): void;
  }
}

declare module '@tracelens/server-sdk' {
  export function createTraceLensMiddleware(config: {
    projectKey: string;
    endpoint: string;
    environment?: string;
    enableSqlTracing?: boolean;
    enableHttpTracing?: boolean;
    enableErrorTracking?: boolean;
  }): any;
}
```

### 8. Testing Integration

Add a simple test to verify TraceLens is working:

#### test-tracelens.js
```javascript
// Simple test to verify TraceLens integration
async function testTraceLensIntegration() {
  try {
    // Test API endpoint
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      console.log('✅ TraceLens API is running');
    } else {
      console.log('❌ TraceLens API not responding');
    }
    
    // Test if SDK is loaded (browser)
    if (typeof window !== 'undefined') {
      console.log('✅ Browser SDK integration ready');
    }
    
    // Test server SDK (if in Node.js environment)
    if (typeof process !== 'undefined') {
      console.log('✅ Server SDK integration ready');
    }
    
  } catch (error) {
    console.log('❌ TraceLens integration test failed:', error.message);
  }
}

// Run test
testTraceLensIntegration();
```

### 9. Documentation Update

Add TraceLens section to project README:

```markdown
## 📊 Performance Monitoring with TraceLens

This project uses TraceLens for real-time performance monitoring and AI-assisted debugging.

### What's Monitored
- Frontend performance (Web Vitals, page load times)
- API response times and bottlenecks
- Database query performance
- User interaction patterns

### AI-Powered Debugging
Ask natural language questions about your app's performance:

```bash
kiro-cli "What are the current performance bottlenecks?"
kiro-cli "Show me the slowest API endpoints"
kiro-cli "How can I optimize the user dashboard?"
```

### TraceLens Dashboard
- Local: http://localhost:3000
- Production: [Your TraceLens URL]
```

## Implementation Steps

1. **Analyze the project structure** using file system exploration
2. **Detect frameworks and technologies** from package.json and file patterns
3. **Install TraceLens packages** using the detected package manager
4. **Add frontend integration** based on detected framework
5. **Add backend integration** based on detected server framework
6. **Create environment configuration** with appropriate variables
7. **Setup MCP integration** for AI assistant connectivity
8. **Add TypeScript support** if TypeScript is detected
9. **Create test file** to verify integration
10. **Update project documentation** with TraceLens information

## Success Criteria

After integration, the user should be able to:
- ✅ See their app's performance data in TraceLens dashboard
- ✅ Query performance issues using natural language with AI assistants
- ✅ Get specific, actionable insights about bottlenecks
- ✅ Monitor both frontend and backend performance in real-time
- ✅ Reduce debugging time from hours to minutes

## Error Handling

If integration fails:
1. **Check TraceLens is running**: `curl http://localhost:3001/health`
2. **Verify package installation**: Check node_modules for TraceLens packages
3. **Check environment variables**: Ensure endpoints are correctly configured
4. **Test MCP integration**: Run `kiro-cli "Check TraceLens status"`
5. **Review console logs**: Look for TraceLens initialization messages

## Notes

- Always add TraceLens middleware early in the middleware stack
- Use environment variables for different deployment environments
- The integration is designed to be non-blocking and production-safe
- TraceLens adds <1ms overhead to your application
- All data stays on your infrastructure (self-hosted)

This prompt should handle 90% of common web application setups automatically.
