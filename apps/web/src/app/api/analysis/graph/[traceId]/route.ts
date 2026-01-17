import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { traceId: string } }
) {
  const traceId = params.traceId;

  if (!traceId) {
    return NextResponse.json({ error: 'Trace ID required' }, { status: 400 });
  }

  // Mock dependency graph data - in production, this would use the analysis engine
  const dependencyGraph = {
    traceId,
    nodes: [
      {
        id: 'node-1',
        name: 'Frontend Request',
        type: 'service',
        duration: 45,
        critical: false,
        metadata: {
          service: 'web-frontend',
          operation: 'page-load',
          tags: { component: 'login-form' }
        }
      },
      {
        id: 'node-2',
        name: 'API Gateway',
        type: 'service',
        duration: 12,
        critical: false,
        metadata: {
          service: 'api-gateway',
          operation: 'route-request',
          tags: { endpoint: '/auth/login' }
        }
      },
      {
        id: 'node-3',
        name: 'Auth Service',
        type: 'service',
        duration: 120,
        critical: true,
        metadata: {
          service: 'auth-service',
          operation: 'validate-credentials',
          tags: { method: 'bcrypt-compare' }
        }
      },
      {
        id: 'node-4',
        name: 'User Database',
        type: 'database',
        duration: 180,
        critical: true,
        metadata: {
          service: 'postgresql',
          operation: 'SELECT',
          tags: { table: 'users', query_type: 'lookup' }
        }
      },
      {
        id: 'node-5',
        name: 'Session Store',
        type: 'database',
        duration: 25,
        critical: false,
        metadata: {
          service: 'redis',
          operation: 'SET',
          tags: { key_type: 'session' }
        }
      }
    ],
    links: [
      { source: 'node-1', target: 'node-2', duration: 12, type: 'http' },
      { source: 'node-2', target: 'node-3', duration: 120, type: 'grpc' },
      { source: 'node-3', target: 'node-4', duration: 180, type: 'sql' },
      { source: 'node-3', target: 'node-5', duration: 25, type: 'redis' }
    ],
    criticalPath: ['node-1', 'node-2', 'node-3', 'node-4'],
    analysis: {
      totalDuration: 357,
      criticalPathDuration: 357,
      parallelizableOperations: ['node-4', 'node-5'],
      bottlenecks: [
        {
          nodeId: 'node-4',
          type: 'database',
          impact: 'HIGH',
          recommendation: 'Add database index on email column for faster user lookup'
        },
        {
          nodeId: 'node-3',
          type: 'cpu',
          impact: 'MEDIUM',
          recommendation: 'Consider caching bcrypt results for recently validated passwords'
        }
      ]
    },
    generatedAt: Date.now()
  };

  return NextResponse.json(dependencyGraph);
}
