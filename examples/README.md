# TraceLens Integration Examples

Complete examples showing how to integrate TraceLens with popular frameworks.

## React Application Example

### Installation
```bash
npm install @tracelens/browser-sdk
```

### Basic Integration
```javascript
// src/tracelens.js
import { TraceLensSDK } from '@tracelens/browser-sdk';

export const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events',
  enableWebVitals: true,
  enableResourceTiming: true,
  sampling: 1.0 // 100% in development
});

// Start tracking
tracer.start();
```

### App.js Integration
```javascript
// src/App.js
import React, { useEffect } from 'react';
import { tracer } from './tracelens';

function App() {
  useEffect(() => {
    // Track page load
    tracer.trackPageLoad('home');
    
    // Track custom events
    tracer.trackEvent('app-mounted', {
      timestamp: Date.now(),
      route: window.location.pathname
    });
  }, []);

  const handleButtonClick = () => {
    // Track user interactions
    tracer.trackInteraction('button-click', {
      component: 'main-cta',
      timestamp: Date.now()
    });
  };

  return (
    <div className="App">
      <h1>My App with TraceLens</h1>
      <button onClick={handleButtonClick}>
        Track This Click
      </button>
    </div>
  );
}

export default App;
```

### Custom Hook for Tracking
```javascript
// src/hooks/useTraceLens.js
import { useEffect } from 'react';
import { tracer } from '../tracelens';

export function useTraceLens(componentName) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      tracer.trackEvent('component-lifecycle', {
        component: componentName,
        duration,
        type: 'unmount'
      });
    };
  }, [componentName]);

  const trackAction = (action, data = {}) => {
    tracer.trackEvent('user-action', {
      component: componentName,
      action,
      ...data,
      timestamp: Date.now()
    });
  };

  return { trackAction };
}
```

## Express API Example

### Installation
```bash
npm install @tracelens/server-sdk
```

### Basic Integration
```javascript
// server.js
import express from 'express';
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

const app = express();

// Add TraceLens middleware
app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces',
  enableDependencyScanning: true,
  enableExecutionTracking: true
}));

// Your routes
app.get('/api/users', async (req, res) => {
  // TraceLens automatically tracks:
  // - Request timing
  // - Database queries
  // - External API calls
  // - Dependencies used
  
  const users = await db.users.findAll();
  res.json(users);
});

app.listen(3000, () => {
  console.log('Server running with TraceLens monitoring');
});
```

### Custom Span Tracking
```javascript
// services/userService.js
import { TraceLensServerSDK } from '@tracelens/server-sdk';

const tracer = new TraceLensServerSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
});

export class UserService {
  async getUserProfile(userId) {
    return tracer.createSpan('get-user-profile', async (span) => {
      span.setAttributes({
        'user.id': userId,
        'operation': 'database-query'
      });

      try {
        // Database query
        const user = await db.users.findById(userId);
        
        // External API call
        const preferences = await tracer.createSpan('fetch-preferences', async (prefSpan) => {
          prefSpan.setAttributes({
            'external.api': 'preferences-service',
            'user.id': userId
          });
          
          return await fetch(`/api/preferences/${userId}`);
        });

        span.setStatus({ code: 'OK' });
        return { user, preferences };
        
      } catch (error) {
        span.setStatus({ 
          code: 'ERROR', 
          message: error.message 
        });
        throw error;
      }
    });
  }
}
```

## Next.js Application Example

### pages/_app.js
```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const tracer = new TraceLensSDK({
  projectKey: process.env.NEXT_PUBLIC_TRACELENS_PROJECT_KEY,
  endpoint: process.env.NEXT_PUBLIC_TRACELENS_ENDPOINT,
  enableWebVitals: true
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    tracer.start();

    // Track route changes
    const handleRouteChange = (url) => {
      tracer.trackPageLoad(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
```

### API Route with TraceLens
```javascript
// pages/api/users.js
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

const traceLensMiddleware = createTraceLensMiddleware({
  projectKey: process.env.TRACELENS_PROJECT_KEY,
  endpoint: process.env.TRACELENS_ENDPOINT
});

export default async function handler(req, res) {
  // Apply TraceLens middleware
  await new Promise((resolve) => {
    traceLensMiddleware(req, res, resolve);
  });

  if (req.method === 'GET') {
    // Your API logic here
    const users = await fetchUsers();
    res.status(200).json(users);
  }
}
```

## Vue.js Application Example

### main.js
```javascript
import { createApp } from 'vue';
import { TraceLensSDK } from '@tracelens/browser-sdk';
import App from './App.vue';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

const app = createApp(App);

// Vue plugin for TraceLens
app.config.globalProperties.$tracer = tracer;

// Start tracking
tracer.start();

app.mount('#app');
```

### Component Usage
```vue
<template>
  <div>
    <button @click="trackClick">Track This</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  mounted() {
    this.$tracer.trackEvent('component-mounted', {
      component: 'MyComponent'
    });
  },
  methods: {
    trackClick() {
      this.$tracer.trackInteraction('button-click', {
        component: 'MyComponent',
        action: 'cta-click'
      });
    }
  }
};
</script>
```

## Environment Configuration

### .env.local (Frontend)
```bash
NEXT_PUBLIC_TRACELENS_PROJECT_KEY=your-project-key
NEXT_PUBLIC_TRACELENS_ENDPOINT=http://localhost:3001/api/events
```

### .env (Backend)
```bash
TRACELENS_PROJECT_KEY=your-project-key
TRACELENS_ENDPOINT=http://localhost:3001/api/traces
```

## Production Configuration

### Sampling for Production
```javascript
const tracer = new TraceLensSDK({
  projectKey: process.env.TRACELENS_PROJECT_KEY,
  endpoint: process.env.TRACELENS_ENDPOINT,
  sampling: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enableWebVitals: true,
  bufferSize: 100,
  flushInterval: 5000
});
```

### Error Boundaries with Tracking
```javascript
class TrackedErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    tracer.trackError(error, {
      component: this.props.componentName,
      errorInfo,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Testing with TraceLens

### Jest Test Setup
```javascript
// setupTests.js
import { TraceLensSDK } from '@tracelens/browser-sdk';

// Mock TraceLens in tests
jest.mock('@tracelens/browser-sdk', () => ({
  TraceLensSDK: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    trackEvent: jest.fn(),
    trackPageLoad: jest.fn(),
    trackInteraction: jest.fn()
  }))
}));
```

---

**Ready to integrate TraceLens?** Check the [Quick Start Guide](../QUICKSTART.md) for more details.
