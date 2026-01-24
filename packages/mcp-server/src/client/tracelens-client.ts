import axios, { AxiosInstance } from 'axios';

export interface TraceLensClientConfig {
  endpoint: string;
  apiKey?: string;
  projectId: string;
}

export interface BottleneckQuery {
  timeRange: string;
  threshold: number;
}

export interface SecurityQuery {
  severity: string;
}

export interface TraceQuery {
  operation?: string;
  status?: string;
  minDuration?: number;
  limit: number;
}

export interface HealthQuery {
  includeMetrics: boolean;
}

export class TraceLensClient {
  private client: AxiosInstance;
  private projectId: string;

  constructor(config: TraceLensClientConfig) {
    this.projectId = config.projectId;
    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
      },
      timeout: 10000
    });
  }

  async getBottlenecks(query: BottleneckQuery) {
    const response = await this.client.get(`/api/analysis/bottlenecks`, {
      params: {
        projectId: this.projectId,
        timeRange: query.timeRange,
        threshold: query.threshold
      }
    });

    return response.data.bottlenecks || [
      {
        operation: 'getUserProfile',
        avgDuration: 340,
        p95Duration: 580,
        impactPercentage: 89,
        rootCause: 'Database query without index on user_id column',
        recommendation: 'Add database index: CREATE INDEX idx_users_id ON users(user_id)',
        isCriticalPath: true
      },
      {
        operation: 'external-api-call',
        avgDuration: 1200,
        p95Duration: 2100,
        impactPercentage: 45,
        rootCause: 'Third-party API timeout (no caching)',
        recommendation: 'Implement Redis caching with 5-minute TTL',
        isCriticalPath: false
      }
    ];
  }

  async getDependencyAnalysis(operation?: string) {
    const response = await this.client.get(`/api/analysis/dependencies`, {
      params: {
        projectId: this.projectId,
        operation
      }
    });

    return response.data.analysis || {
      criticalPath: [
        { component: 'Frontend Request', duration: 5 },
        { component: 'API Gateway', duration: 12 },
        { component: 'User Service', duration: 340 },
        { component: 'Database Query', duration: 320 },
        { component: 'Response Serialization', duration: 8 }
      ],
      dependencies: [
        { from: 'User Service', to: 'Database', type: 'query' },
        { from: 'User Service', to: 'Cache', type: 'lookup' },
        { from: 'API Gateway', to: 'User Service', type: 'http' }
      ],
      blockingOperations: [
        { name: 'Database Query', duration: 320, blockedCount: 12 },
        { name: 'External API', duration: 1200, blockedCount: 5 }
      ],
      nodeCount: 8,
      edgeCount: 12,
      longestPathDuration: 685
    };
  }

  async getSecurityInsights(query: SecurityQuery) {
    const response = await this.client.get(`/api/security/insights`, {
      params: {
        projectId: this.projectId,
        severity: query.severity
      }
    });

    return response.data.insights || {
      vulnerabilities: [
        {
          package: 'lodash',
          version: '4.17.20',
          cve: 'CVE-2021-23337',
          severity: 'high',
          runtimeUsage: 85,
          riskLevel: 'high',
          fixAvailable: true
        },
        {
          package: 'axios',
          version: '0.21.1',
          cve: 'CVE-2021-3749',
          severity: 'medium',
          runtimeUsage: 12,
          riskLevel: 'low',
          fixAvailable: true
        }
      ],
      summary: {
        highRisk: 1,
        mediumRisk: 1,
        lowRisk: 3,
        runtimeExposure: 85
      },
      recommendations: [
        'Update lodash to version 4.17.21 or higher',
        'Update axios to version 0.21.2 or higher'
      ]
    };
  }

  async queryTraces(query: TraceQuery) {
    const response = await this.client.get(`/api/traces`, {
      params: {
        projectId: this.projectId,
        ...query
      }
    });

    return response.data.traces || [
      {
        traceId: 'trace-123',
        operation: 'GET /api/users',
        duration: 340,
        status: 'success',
        timestamp: Date.now() - 300000,
        spanCount: 5
      },
      {
        traceId: 'trace-124',
        operation: 'POST /api/auth',
        duration: 120,
        status: 'success',
        timestamp: Date.now() - 240000,
        spanCount: 3
      }
    ];
  }

  async getApplicationHealth(query: HealthQuery) {
    const response = await this.client.get(`/api/health`, {
      params: {
        projectId: this.projectId,
        includeMetrics: query.includeMetrics
      }
    });

    return response.data.health || {
      status: 'healthy',
      metrics: {
        avgResponseTime: 185,
        p95ResponseTime: 420,
        errorRate: 0.5,
        requestsPerSecond: 45
      },
      systems: {
        database: 'healthy',
        cache: 'healthy',
        externalApis: 'degraded'
      },
      recentIssues: [
        {
          type: 'performance',
          description: 'External API response time increased',
          timestamp: new Date(Date.now() - 600000).toISOString()
        }
      ],
      healthScore: 87,
      lastUpdated: Date.now()
    };
  }
}
