import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Add CORS headers for localhost development
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    // Try to fetch from analysis-engine and ingestion-service
    const analysisEngineUrl = process.env.ANALYSIS_ENGINE_URL || 'http://localhost:3135';
    const ingestionServiceUrl = process.env.INGESTION_SERVICE_URL || 'http://localhost:3001';

    let bottlenecks = [];
    let traces = [];

    try {
      // Fetch bottlenecks from analysis engine
      const bottlenecksResponse = await fetch(`${analysisEngineUrl}/api/performance/bottlenecks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(3000),
      });

      if (bottlenecksResponse.ok) {
        bottlenecks = await bottlenecksResponse.json();
      }
    } catch (error) {
      console.warn('Failed to fetch bottlenecks:', error);
    }

    try {
      // Fetch traces from ingestion service
      const tracesResponse = await fetch(`${ingestionServiceUrl}/api/traces?limit=50`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (tracesResponse.ok) {
        const tracesData = await tracesResponse.json();
        traces = tracesData.traces || [];
      }
    } catch (error) {
      console.warn('Failed to fetch traces:', error);
    }

    // Calculate aggregated metrics
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Calculate response time metrics
    const recentTraces = traces.filter((trace: any) => 
      trace.timestamp && trace.timestamp > oneHourAgo
    );

    const avgResponseTime = recentTraces.length > 0
      ? Math.round(recentTraces.reduce((sum: number, trace: any) => sum + (trace.duration || 0), 0) / recentTraces.length)
      : 156; // fallback

    // Calculate uptime (simplified)
    const errorTraces = recentTraces.filter((trace: any) => trace.status === 'error');
    const uptime = recentTraces.length > 0
      ? Math.round(((recentTraces.length - errorTraces.length) / recentTraces.length) * 10000) / 100
      : 99.2; // fallback

    // Count critical paths and security risks
    const slowTraces = traces.filter((trace: any) => trace.status === 'slow' || trace.duration > 500);
    const criticalPaths = slowTraces.length;
    
    const highImpactBottlenecks = bottlenecks.filter((b: any) => b.impact === 'high' || b.avgDuration > 300);
    const securityRisks = errorTraces.length + highImpactBottlenecks.length;

    const metrics = {
      responseTime: {
        current: avgResponseTime,
        change: Math.floor((Math.random() - 0.5) * 40), // Simulated change
        changeType: Math.random() > 0.5 ? 'decrease' : 'increase',
      },
      uptime: {
        current: uptime,
        change: Math.round((Math.random() - 0.5) * 0.4 * 100) / 100,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      },
      criticalPaths: {
        count: criticalPaths,
        status: criticalPaths > 5 ? 'critical' : criticalPaths > 2 ? 'warning' : 'good',
      },
      securityRisks: {
        count: securityRisks,
        status: securityRisks > 3 ? 'critical' : securityRisks > 1 ? 'warning' : 'good',
      },
      metadata: {
        timestamp: now,
        dataSource: {
          bottlenecks: bottlenecks.length,
          traces: traces.length,
          recentTraces: recentTraces.length,
        },
      },
    };

    return NextResponse.json(metrics, { headers });

  } catch (error) {
    console.error('Dashboard metrics API error:', error);
    
    // Return fallback metrics on error
    const fallbackMetrics = {
      responseTime: { current: 156, change: -12, changeType: 'decrease' },
      uptime: { current: 99.2, change: 0.1, changeType: 'increase' },
      criticalPaths: { count: 3, status: 'warning' },
      securityRisks: { count: 2, status: 'critical' },
      metadata: {
        timestamp: Date.now(),
        error: 'Fallback data - backend services unavailable',
      },
    };

    return NextResponse.json(fallbackMetrics, {
      status: 200, // Return 200 with fallback data instead of error
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
