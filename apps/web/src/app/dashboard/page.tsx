'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Users, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CardSkeleton } from '../../components/ui/LoadingSpinner';
import { Heading, Text } from '../../components/ui/Typography';
import Badge from '../../components/ui/Badge';
import DependencyGraph from '../../components/graphs/DependencyGraph';
import PerformanceChart from '../../components/graphs/PerformanceChart';
import MetricsGrid from '../../components/dashboard/MetricsGrid';
import DashboardCard from '../../components/dashboard/DashboardCard';

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
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Heading level={1} className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            Dashboard
          </Heading>
          <Text className="mt-2 text-muted-foreground">
            Real-time performance monitoring and dependency analysis
          </Text>
        </div>

        {/* Key Metrics Grid */}
        <MetricsGrid />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Performance Trend">
            <PerformanceChart 
              data={samplePerformanceData}
              metric="Response Time (ms)"
              width={500}
              height={250}
            />
          </DashboardCard>

          <DashboardCard title="Dependency Graph">
            <DependencyGraph 
              nodes={sampleNodes}
              links={sampleLinks}
              width={500}
              height={250}
            />
          </DashboardCard>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardCard title="Recent Activity" className="lg:col-span-2">
            <div className="space-y-4">
              {[
                { icon: <AlertTriangle className="h-4 w-4" />, text: "High response time detected in User Service", time: "2 minutes ago", type: "warning" },
                { icon: <Users className="h-4 w-4" />, text: "New user registration spike (+15%)", time: "5 minutes ago", type: "success" },
                { icon: <Database className="h-4 w-4" />, text: "Database query optimization completed", time: "10 minutes ago", type: "success" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <Text className="font-medium">{activity.text}</Text>
                    <Text variant="small" className="text-muted-foreground">{activity.time}</Text>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="System Health">
            <div className="space-y-4">
              {[
                { name: "API Gateway", status: "healthy", uptime: "99.9%" },
                { name: "Database", status: "healthy", uptime: "99.8%" },
                { name: "Cache Layer", status: "warning", uptime: "98.5%" },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium">{service.name}</Text>
                    <Text variant="small" className="text-muted-foreground">{service.uptime} uptime</Text>
                  </div>
                  <Badge variant={service.status === 'healthy' ? 'success' : 'warning'} size="sm">
                    {service.status}
                  </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
