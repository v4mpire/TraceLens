import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  // Mock performance data - in production, this would fetch from the ingestion service
  const performanceMetrics = [
    {
      id: 'perf-1',
      projectId,
      timestamp: Date.now() - 300000,
      metric: 'LCP',
      value: 1200,
      threshold: 2500,
      url: '/dashboard'
    },
    {
      id: 'perf-2',
      projectId,
      timestamp: Date.now() - 240000,
      metric: 'FID',
      value: 45,
      threshold: 100,
      url: '/dashboard'
    },
    {
      id: 'perf-3',
      projectId,
      timestamp: Date.now() - 180000,
      metric: 'CLS',
      value: 0.08,
      threshold: 0.1,
      url: '/dashboard'
    },
    {
      id: 'perf-4',
      projectId,
      timestamp: Date.now() - 120000,
      metric: 'TTFB',
      value: 167,
      threshold: 200,
      url: '/api/data'
    },
    {
      id: 'perf-5',
      projectId,
      timestamp: Date.now() - 60000,
      metric: 'Response Time',
      value: 134,
      threshold: 200,
      url: '/api/search'
    },
    {
      id: 'perf-6',
      projectId,
      timestamp: Date.now(),
      metric: 'Response Time',
      value: 156,
      threshold: 200,
      url: '/api/users'
    }
  ];

  return NextResponse.json(performanceMetrics);
}
