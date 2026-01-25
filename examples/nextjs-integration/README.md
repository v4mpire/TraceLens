# Next.js TraceLens Integration Example

This example shows how to integrate TraceLens into a Next.js application.

## Installation

```bash
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

## Frontend Integration

### App Router (app/layout.tsx)

```typescript
'use client';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize TraceLens in browser environment
    if (typeof window !== 'undefined') {
      import('@tracelens/browser-sdk').then(({ TraceLensSDK }) => {
        const tracer = new TraceLensSDK({
          projectKey: process.env.NEXT_PUBLIC_PROJECT_NAME || 'nextjs-app',
          endpoint: process.env.NEXT_PUBLIC_TRACELENS_ENDPOINT || 'http://localhost:3001/api/events',
          environment: process.env.NODE_ENV
        });
        tracer.start();
      }).catch(error => {
        console.warn('TraceLens failed to initialize:', error);
      });
    }
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Pages Router (_app.tsx)

```typescript
import { AppProps } from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize TraceLens
    if (typeof window !== 'undefined') {
      import('@tracelens/browser-sdk').then(({ TraceLensSDK }) => {
        const tracer = new TraceLensSDK({
          projectKey: process.env.NEXT_PUBLIC_PROJECT_NAME || 'nextjs-app',
          endpoint: process.env.NEXT_PUBLIC_TRACELENS_ENDPOINT || 'http://localhost:3001/api/events'
        });
        tracer.start();
      }).catch(console.warn);
    }
  }, []);

  return <Component {...pageProps} />;
}
```

## Backend Integration

### API Routes (pages/api or app/api)

```typescript
// middleware.ts (App Router) or pages/api/_middleware.ts (Pages Router)
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import { NextRequest, NextResponse } from 'next/server';

const traceLensMiddleware = createTraceLensMiddleware({
  projectKey: process.env.PROJECT_NAME || 'nextjs-app',
  endpoint: process.env.TRACELENS_ENDPOINT || 'http://localhost:3001/api/traces',
  environment: process.env.NODE_ENV
});

export function middleware(request: NextRequest) {
  // Apply TraceLens middleware to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Note: Next.js middleware is different from Express middleware
    // For full tracing, use the API route wrapper below
  }
  
  return NextResponse.next();
}
```

### Individual API Route Wrapper

```typescript
// lib/tracelens-wrapper.ts
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

const traceLensMiddleware = createTraceLensMiddleware({
  projectKey: process.env.PROJECT_NAME || 'nextjs-app',
  endpoint: process.env.TRACELENS_ENDPOINT || 'http://localhost:3001/api/traces'
});

export function withTraceLens(handler: any) {
  return async (req: any, res: any) => {
    // Apply TraceLens middleware
    return new Promise((resolve) => {
      traceLensMiddleware(req, res, () => {
        resolve(handler(req, res));
      });
    });
  };
}
```

```typescript
// pages/api/users.ts or app/api/users/route.ts
import { withTraceLens } from '../../lib/tracelens-wrapper';

async function handler(req: any, res: any) {
  // Your API logic here
  const users = await getUsers();
  res.json(users);
}

export default withTraceLens(handler);
```

## Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_PROJECT_NAME=my-nextjs-app
NEXT_PUBLIC_TRACELENS_ENDPOINT=http://localhost:3001/api/events
TRACELENS_ENDPOINT=http://localhost:3001/api/traces

# .env.production
NEXT_PUBLIC_PROJECT_NAME=my-nextjs-app
NEXT_PUBLIC_TRACELENS_ENDPOINT=https://your-tracelens.com/api/events
TRACELENS_ENDPOINT=https://your-tracelens.com/api/traces
```

## Docker Integration

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
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## Verification

1. Start TraceLens:
```bash
python3 install.py --dashboard-port 3002
```

2. Start your Next.js app:
```bash
npm run dev  # Runs on localhost:3000
```

3. Visit your app and generate some traffic

4. Check TraceLens dashboard at http://localhost:3002

5. Query with AI:
```bash
kiro-cli "What are the performance bottlenecks in my Next.js app?"
```

## Troubleshooting

- **Import errors**: Use dynamic imports with error handling
- **SSR issues**: Ensure TraceLens only runs in browser environment
- **Port conflicts**: Use different ports for TraceLens and your app
- **Docker builds**: Use multi-stage builds and proper dependency management
