'use client';

import React from 'react';
import { Clock, TrendingUp, Zap, Shield, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'success' | 'warning' | 'error';
    description: string;
  } | undefined;
  status?: {
    text: string;
    type: 'success' | 'warning' | 'error';
  } | undefined;
  loading?: boolean;
}

function MetricCard({ icon, title, value, change, status, loading }: MetricCardProps) {
  return (
    <Card variant="elevated" className="hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {loading ? (
              <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              icon
            )}
          </div>
          <div>
            <Text variant="small" className="text-muted-foreground">{title}</Text>
            <Heading level={4} className="text-2xl">
              {loading ? '...' : value}
            </Heading>
          </div>
        </div>
      </div>
      {change && !loading && (
        <div className="mt-3 flex items-center">
          <Badge variant={change.type} size="sm">{change.value}</Badge>
          <Text variant="small" className="ml-2">{change.description}</Text>
        </div>
      )}
      {status && !loading && (
        <div className="mt-3">
          <Badge variant={status.type} size="sm">{status.text}</Badge>
        </div>
      )}
      {loading && (
        <div className="mt-3">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      )}
    </Card>
  );
}

interface MetricsGridProps {
  className?: string;
}

export default function MetricsGrid({ className }: MetricsGridProps) {
  const { metrics, loading, error, lastUpdated, refresh } = useRealTimeMetrics({
    refreshInterval: 30000, // 30 seconds
    enabled: true,
  });

  // Show loading state initially
  if (loading && !metrics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCard
            key={i}
            icon={<div className="h-5 w-5" />}
            title="Loading..."
            value="..."
            loading={true}
          />
        ))}
      </div>
    );
  }

  // Use real metrics or fallback
  const currentMetrics = metrics || {
    responseTime: { current: 156, change: -12, changeType: 'decrease' as const },
    uptime: { current: 99.2, change: 0.1, changeType: 'increase' as const },
    criticalPaths: { count: 3, status: 'warning' as const },
    securityRisks: { count: 2, status: 'critical' as const },
  };

  const metricsData = [
    {
      icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Response Time",
      value: `${currentMetrics.responseTime.current}ms`,
      change: {
        value: `${currentMetrics.responseTime.changeType === 'decrease' ? '↓' : '↑'} ${Math.abs(currentMetrics.responseTime.change)}ms`,
        type: (currentMetrics.responseTime.changeType === 'decrease' ? 'success' : 'warning') as 'success' | 'warning' | 'error',
        description: "from last hour"
      }
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />,
      title: "Uptime",
      value: `${currentMetrics.uptime.current.toFixed(1)}%`,
      change: {
        value: `${currentMetrics.uptime.changeType === 'increase' ? '↑' : '↓'} ${Math.abs(currentMetrics.uptime.change).toFixed(1)}%`,
        type: (currentMetrics.uptime.changeType === 'increase' ? 'success' : 'warning') as 'success' | 'warning' | 'error',
        description: "from yesterday"
      }
    },
    {
      icon: <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      title: "Critical Paths",
      value: currentMetrics.criticalPaths.count.toString(),
      status: {
        text: currentMetrics.criticalPaths.status === 'good' ? 'All optimized' : 
              currentMetrics.criticalPaths.status === 'warning' ? 'Requires optimization' : 'Needs immediate attention',
        type: (currentMetrics.criticalPaths.status === 'good' ? 'success' : 
              currentMetrics.criticalPaths.status === 'warning' ? 'warning' : 'error') as 'success' | 'warning' | 'error'
      }
    },
    {
      icon: <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />,
      title: "Security Risks",
      value: currentMetrics.securityRisks.count.toString(),
      status: {
        text: currentMetrics.securityRisks.status === 'good' ? 'No issues detected' :
              currentMetrics.securityRisks.status === 'warning' ? 'Medium priority alerts' : 'High priority alerts',
        type: (currentMetrics.securityRisks.status === 'good' ? 'success' :
              currentMetrics.securityRisks.status === 'warning' ? 'warning' : 'error') as 'success' | 'warning' | 'error'
      }
    }
  ];

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="small" className="text-muted-foreground">
            {error ? 'Using fallback data - backend unavailable' : 
             lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 
             'Real-time metrics'}
          </Text>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsData.map((metric, index) => (
          <MetricCard
            key={index}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            change={metric.change || undefined}
            status={metric.status || undefined}
            loading={loading && !!metrics} // Only show loading on refresh, not initial load
          />
        ))}
      </div>
    </div>
  );
}
