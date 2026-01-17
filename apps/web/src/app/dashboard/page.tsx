'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DependencyGraph from '../../components/graphs/DependencyGraph';
import PerformanceChart from '../../components/graphs/PerformanceChart';

// Sample data for demonstration
const sampleNodes = [
  { id: '1', name: 'Frontend', type: 'service' as const, duration: 120, critical: true },
  { id: '2', name: 'API Gateway', type: 'service' as const, duration: 45 },
  { id: '3', name: 'User Service', type: 'service' as const, duration: 230, critical: true },
  { id: '4', name: 'Database', type: 'database' as const, duration: 180 },
  { id: '5', name: 'Cache', type: 'database' as const, duration: 15 },
  { id: '6', name: 'External API', type: 'external' as const, duration: 340, critical: true },
];

const sampleLinks = [
  { source: '1', target: '2', duration: 45 },
  { source: '2', target: '3', duration: 230 },
  { source: '3', target: '4', duration: 180 },
  { source: '3', target: '5', duration: 15 },
  { source: '3', target: '6', duration: 340 },
];

const samplePerformanceData = [
  { timestamp: Date.now() - 300000, metric: 'Response Time', value: 120, threshold: 200 },
  { timestamp: Date.now() - 240000, metric: 'Response Time', value: 145, threshold: 200 },
  { timestamp: Date.now() - 180000, metric: 'Response Time', value: 98, threshold: 200 },
  { timestamp: Date.now() - 120000, metric: 'Response Time', value: 167, threshold: 200 },
  { timestamp: Date.now() - 60000, metric: 'Response Time', value: 134, threshold: 200 },
  { timestamp: Date.now(), metric: 'Response Time', value: 156, threshold: 200 },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Runtime performance and dependency analysis overview
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-sm font-medium text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-2xl font-bold mt-2">156ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">↓ 12ms</span> from last hour
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">Uptime</div>
            </div>
            <div className="text-2xl font-bold mt-2">99.2%</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">↑ 0.1%</span> from yesterday
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="text-sm font-medium text-muted-foreground">Critical Path Nodes</div>
            </div>
            <div className="text-2xl font-bold mt-2">3</div>
            <div className="text-xs text-muted-foreground mt-1">
              Requires optimization
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div className="text-sm font-medium text-muted-foreground">Security Risks</div>
            </div>
            <div className="text-2xl font-bold mt-2">2</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">High priority</span> vulnerabilities
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dependency Graph */}
          <Card 
            title="Dependency Graph" 
            description="Real-time visualization of service dependencies and critical paths"
            className="lg:col-span-2"
          >
            <DependencyGraph 
              nodes={sampleNodes} 
              links={sampleLinks}
              width={800}
              height={400}
            />
          </Card>

          {/* Performance Chart */}
          <Card 
            title="Performance Metrics" 
            description="Response time trends and threshold monitoring"
            className="lg:col-span-2"
          >
            <PerformanceChart 
              data={samplePerformanceData}
              metric="Response Time (ms)"
              width={800}
              height={300}
            />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
