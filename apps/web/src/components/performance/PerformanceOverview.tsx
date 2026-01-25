'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import DashboardCard from '../dashboard/DashboardCard';
import PerformanceChart from '../graphs/PerformanceChart';
import { Heading, Text } from '../ui/Typography';
import Badge from '../ui/Badge';

interface PerformanceMetric {
  timestamp: number;
  metric: string;
  value: number;
  threshold?: number;
}

interface BottleneckItem {
  operation: string;
  avgDuration: number;
  impactPercentage: number;
  rootCause: string;
  recommendation: string;
}

export default function PerformanceOverview() {
  const [responseTimeData, setResponseTimeData] = useState<PerformanceMetric[]>([]);
  const [bottlenecks, setBottlenecks] = useState<BottleneckItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bottlenecks
        const bottlenecksRes = await fetch('http://localhost:3135/api/performance/bottlenecks');
        const bottlenecksData = await bottlenecksRes.json();
        setBottlenecks(bottlenecksData);

        // Generate recent performance data (last 5 data points)
        const now = Date.now();
        const mockData: PerformanceMetric[] = [];
        for (let i = 4; i >= 0; i--) {
          mockData.push({
            timestamp: now - (i * 60000), // 1 minute intervals
            metric: 'Response Time',
            value: Math.floor(Math.random() * 100) + 120, // 120-220ms
            threshold: 200
          });
        }
        setResponseTimeData(mockData);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
        // Fallback to mock data if API fails
        setBottlenecks([
          { operation: 'Database Query - User Profile', avgDuration: 340, impactPercentage: 85, rootCause: 'Missing index', recommendation: 'Add index on user_id' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return 'error';
    if (impact >= 50) return 'warning';
    return 'success';
  };

  if (loading) {
    return <div className="p-8">Loading performance data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Heading level={1} className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-blue-600" />
          Performance Overview
        </Heading>
        <Text className="mt-2 text-muted-foreground">
          Monitor application performance metrics and identify bottlenecks
        </Text>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Average Response Time">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-3xl font-bold">
                {bottlenecks.length > 0 ? `${bottlenecks[0]?.avgDuration || 156}ms` : '156ms'}
              </div>
              <div className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                12ms faster than last hour
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Performance Score">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-green-600">87</span>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Out of 100</div>
              <Badge variant="success" size="sm">Good Performance</Badge>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Critical Issues">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <div className="text-3xl font-bold">{bottlenecks.length}</div>
              <div className="text-sm text-orange-600">
                Require immediate attention
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Performance Chart */}
      <DashboardCard title="Response Time Trend">
        <PerformanceChart 
          data={responseTimeData}
          metric="Response Time (ms)"
          width={800}
          height={300}
        />
      </DashboardCard>

      {/* Bottlenecks List */}
      <DashboardCard title="Performance Bottlenecks">
        <div className="space-y-4">
          {bottlenecks.map((bottleneck, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔗</span>
                <div>
                  <div className="font-medium">{bottleneck.operation}</div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {bottleneck.avgDuration}ms | {bottleneck.rootCause}
                  </div>
                  <div className="text-sm text-blue-600">
                    💡 {bottleneck.recommendation}
                  </div>
                </div>
              </div>
              <Badge variant={getImpactColor(bottleneck.impactPercentage)} size="sm">
                {bottleneck.impactPercentage}% IMPACT
              </Badge>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
