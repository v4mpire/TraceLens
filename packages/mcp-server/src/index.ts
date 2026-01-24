#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TraceLensClient } from './client/tracelens-client.js';
import { program } from 'commander';

// Parse command line arguments
program
  .name('tracelens-mcp')
  .description('TraceLens MCP Server - Query observability data through AI tools')
  .option('--endpoint <url>', 'TraceLens API endpoint', 'http://localhost:3001')
  .option('--api-key <key>', 'TraceLens API key')
  .option('--project <id>', 'Project ID to query', 'default')
  .parse();

const options = program.opts();

class TraceLensMCPServer {
  private server: Server;
  private client: TraceLensClient;

  constructor() {
    this.server = new Server({
      name: 'tracelens-mcp-server',
      version: '1.0.0',
    });

    this.client = new TraceLensClient({
      endpoint: options.endpoint,
      apiKey: options.apiKey,
      projectId: options.project,
    });

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_performance_bottlenecks',
            description: 'Identify current performance bottlenecks and slow operations',
            inputSchema: {
              type: 'object',
              properties: {
                timeRange: {
                  type: 'string',
                  description: 'Time range to analyze (1h, 24h, 7d)',
                  default: '1h'
                },
                threshold: {
                  type: 'number',
                  description: 'Minimum duration threshold in milliseconds',
                  default: 100
                }
              }
            }
          },
          {
            name: 'analyze_dependency_graph',
            description: 'Get dependency graph analysis and critical path information',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: 'Specific operation to analyze (optional)'
                }
              }
            }
          },
          {
            name: 'get_security_insights',
            description: 'Get runtime security vulnerabilities and risk assessment',
            inputSchema: {
              type: 'object',
              properties: {
                severity: {
                  type: 'string',
                  enum: ['low', 'medium', 'high', 'critical'],
                  description: 'Minimum severity level to include'
                }
              }
            }
          },
          {
            name: 'query_traces',
            description: 'Search and filter execution traces',
            inputSchema: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: 'Operation name to filter by'
                },
                status: {
                  type: 'string',
                  enum: ['success', 'error'],
                  description: 'Trace status filter'
                },
                minDuration: {
                  type: 'number',
                  description: 'Minimum duration in milliseconds'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of traces to return',
                  default: 10
                }
              }
            }
          },
          {
            name: 'get_application_health',
            description: 'Get overall application health metrics and status',
            inputSchema: {
              type: 'object',
              properties: {
                includeMetrics: {
                  type: 'boolean',
                  description: 'Include detailed performance metrics',
                  default: true
                }
              }
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_performance_bottlenecks':
            return await this.getPerformanceBottlenecks(args);
          
          case 'analyze_dependency_graph':
            return await this.analyzeDependencyGraph(args);
          
          case 'get_security_insights':
            return await this.getSecurityInsights(args);
          
          case 'query_traces':
            return await this.queryTraces(args);
          
          case 'get_application_health':
            return await this.getApplicationHealth(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async getPerformanceBottlenecks(args: any) {
    const bottlenecks = await this.client.getBottlenecks({
      timeRange: args.timeRange || '1h',
      threshold: args.threshold || 100
    });

    return {
      content: [
        {
          type: 'text',
          text: `# Performance Bottlenecks (${args.timeRange || '1h'})

${bottlenecks.map((b: any) => `## ${b.operation}
- **Duration**: ${b.avgDuration}ms (${b.p95Duration}ms p95)
- **Impact**: ${b.impactPercentage}% of requests affected
- **Root Cause**: ${b.rootCause}
- **Recommendation**: ${b.recommendation}
`).join('\n')}

**Critical Path**: ${bottlenecks.find((b: any) => b.isCriticalPath)?.operation || 'None identified'}
**Total Bottlenecks**: ${bottlenecks.length}
`
        }
      ]
    };
  }

  private async analyzeDependencyGraph(args: any) {
    const analysis = await this.client.getDependencyAnalysis(args.operation);

    return {
      content: [
        {
          type: 'text',
          text: `# Dependency Graph Analysis

## Critical Path
${analysis.criticalPath.map((step: any, i: number) => `${i + 1}. ${step.component} (${step.duration}ms)`).join('\n')}

## Dependencies
${analysis.dependencies.map((dep: any) => `- **${dep.from}** → **${dep.to}** (${dep.type})`).join('\n')}

## Blocking Operations
${analysis.blockingOperations.map((op: any) => `- ${op.name}: ${op.duration}ms (blocks ${op.blockedCount} operations)`).join('\n')}

**Total Graph Nodes**: ${analysis.nodeCount}
**Total Edges**: ${analysis.edgeCount}
**Longest Path**: ${analysis.longestPathDuration}ms
`
        }
      ]
    };
  }

  private async getSecurityInsights(args: any) {
    const insights = await this.client.getSecurityInsights({
      severity: args.severity || 'medium'
    });

    return {
      content: [
        {
          type: 'text',
          text: `# Security Insights

## Runtime Vulnerabilities
${insights.vulnerabilities.map((vuln: any) => `### ${vuln.package}@${vuln.version}
- **CVE**: ${vuln.cve}
- **Severity**: ${vuln.severity}
- **Runtime Usage**: ${vuln.runtimeUsage}% of requests
- **Risk Level**: ${vuln.riskLevel}
- **Fix Available**: ${vuln.fixAvailable ? 'Yes' : 'No'}
`).join('\n')}

## Risk Summary
- **High Risk**: ${insights.summary.highRisk} vulnerabilities
- **Medium Risk**: ${insights.summary.mediumRisk} vulnerabilities
- **Low Risk**: ${insights.summary.lowRisk} vulnerabilities
- **Runtime Exposure**: ${insights.summary.runtimeExposure}%

**Recommendation**: Focus on ${insights.recommendations[0] || 'No immediate action required'}
`
        }
      ]
    };
  }

  private async queryTraces(args: any) {
    const traces = await this.client.queryTraces({
      operation: args.operation,
      status: args.status,
      minDuration: args.minDuration,
      limit: args.limit || 10
    });

    return {
      content: [
        {
          type: 'text',
          text: `# Execution Traces

${traces.map((trace: any) => `## ${trace.operation}
- **Trace ID**: ${trace.traceId}
- **Duration**: ${trace.duration}ms
- **Status**: ${trace.status}
- **Timestamp**: ${new Date(trace.timestamp).toISOString()}
- **Spans**: ${trace.spanCount}
${trace.error ? `- **Error**: ${trace.error}` : ''}
`).join('\n')}

**Total Traces Found**: ${traces.length}
**Average Duration**: ${traces.reduce((sum: number, t: any) => sum + t.duration, 0) / traces.length}ms
`
        }
      ]
    };
  }

  private async getApplicationHealth(args: any) {
    const health = await this.client.getApplicationHealth({
      includeMetrics: args.includeMetrics !== false
    });

    return {
      content: [
        {
          type: 'text',
          text: `# Application Health Status

## Overall Status: ${health.status}

## Performance Metrics
- **Average Response Time**: ${health.metrics.avgResponseTime}ms
- **95th Percentile**: ${health.metrics.p95ResponseTime}ms
- **Error Rate**: ${health.metrics.errorRate}%
- **Throughput**: ${health.metrics.requestsPerSecond} req/s

## System Health
- **Database**: ${health.systems.database}
- **Cache**: ${health.systems.cache}
- **External APIs**: ${health.systems.externalApis}

## Recent Issues
${health.recentIssues.map((issue: any) => `- ${issue.type}: ${issue.description} (${issue.timestamp})`).join('\n') || 'None detected'}

**Health Score**: ${health.healthScore}/100
**Last Updated**: ${new Date(health.lastUpdated).toISOString()}
`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TraceLens MCP server running on stdio');
  }
}

const server = new TraceLensMCPServer();
server.run().catch(console.error);
