'use client';

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Zap, Shield } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Heading, Text } from '../ui/Typography';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'success' | 'warning' | 'error';
    description: string;
  };
  status?: {
    text: string;
    type: 'success' | 'warning' | 'error';
  };
}

function MetricCard({ icon, title, value, change, status }: MetricCardProps) {
  return (
    <Card variant="elevated" className="hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <Text variant="small" className="text-muted-foreground">{title}</Text>
            <Heading level={4} className="text-2xl">{value}</Heading>
          </div>
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center">
          <Badge variant={change.type} size="sm">{change.value}</Badge>
          <Text variant="small" className="ml-2">{change.description}</Text>
        </div>
      )}
      {status && (
        <div className="mt-3">
          <Badge variant={status.type} size="sm">{status.text}</Badge>
        </div>
      )}
    </Card>
  );
}

interface MetricsGridProps {
  className?: string;
}

export default function MetricsGrid({ className }: MetricsGridProps) {
  const [metrics, setMetrics] = useState([
    {
      icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      title: "Response Time",
      value: "156ms",
      change: {
        value: "↓ 12ms",
        type: "success" as const,
        description: "from last hour"
      }
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />,
      title: "Uptime",
      value: "99.2%",
      change: {
        value: "↑ 0.1%",
        type: "success" as const,
        description: "from yesterday"
      }
    },
    {
      icon: <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      title: "Critical Paths",
      value: "3",
      status: {
        text: "Requires optimization",
        type: "warning" as const
      }
    },
    {
      icon: <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />,
      title: "Security Risks",
      value: "2",
      status: {
        text: "High priority alerts",
        type: "error" as const
      }
    }
  ]);

  useEffect(() => {
    // Only fetch data after component mounts to avoid hydration issues
    const fetchMetrics = async () => {
      try {
        const [bottlenecksRes, tracesRes] = await Promise.all([
          fetch('http://localhost:3135/api/performance/bottlenecks').catch(() => null),
          fetch('http://localhost:3135/api/traces').catch(() => null)
        ]);
        
        if (bottlenecksRes?.ok && tracesRes?.ok) {
          const bottlenecks = await bottlenecksRes.json();
          const traces = await tracesRes.json();
          
          const avgResponseTime = bottlenecks.length > 0 ? bottlenecks[0].avgDuration : 156;
          const criticalPaths = traces.filter((t: any) => t.status === 'slow').length;
          
          setMetrics([
            {
              icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
              title: "Response Time",
              value: `${avgResponseTime}ms`,
              change: {
                value: "↓ 12ms",
                type: "success" as const,
                description: "from last hour"
              }
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />,
              title: "Uptime",
              value: "99.2%",
              change: {
                value: "↑ 0.1%",
                type: "success" as const,
                description: "from yesterday"
              }
            },
            {
              icon: <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
              title: "Critical Paths",
              value: criticalPaths.toString(),
              status: {
                text: "Requires optimization",
                type: "warning" as const
              }
            },
            {
              icon: <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />,
              title: "Security Risks",
              value: "2",
              status: {
                text: "High priority alerts",
                type: "error" as const
              }
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Keep default values on error
      }
    };

    // Delay fetch to avoid hydration issues
    const timer = setTimeout(fetchMetrics, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className || ''}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
