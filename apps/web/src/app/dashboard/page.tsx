'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Shield, AlertTriangle, Activity, Zap, Users, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import { CardSkeleton } from '../../components/ui/LoadingSpinner';
import { Heading, Text } from '../../components/ui/Typography';
import Badge from '../../components/ui/Badge';
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
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <Heading level={1}>Dashboard</Heading>
          </div>
          <Text variant="lead">
            Real-time performance monitoring and dependency analysis
          </Text>
        </div>

        {/* Status Banner */}
        <Card variant="outlined" className="border-success/20 bg-success/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <Text className="text-success-foreground font-medium">
              System Status: All services operational
            </Text>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="elevated" className="hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Text variant="small" className="text-muted-foreground">Response Time</Text>
                  <Heading level={4} className="text-2xl">156ms</Heading>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <Badge variant="success" size="sm">↓ 12ms</Badge>
              <Text variant="small" className="ml-2">from last hour</Text>
            </div>
          </Card>

          <Card variant="elevated" className="hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Text variant="small" className="text-muted-foreground">Uptime</Text>
                  <Heading level={4} className="text-2xl">99.2%</Heading>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <Badge variant="success" size="sm">↑ 0.1%</Badge>
              <Text variant="small" className="ml-2">from yesterday</Text>
            </div>
          </Card>

          <Card variant="elevated" className="hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <Text variant="small" className="text-muted-foreground">Critical Paths</Text>
                  <Heading level={4} className="text-2xl">3</Heading>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant="warning" size="sm">Requires optimization</Badge>
            </div>
          </Card>

          <Card variant="elevated" className="hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <Text variant="small" className="text-muted-foreground">Security Risks</Text>
                  <Heading level={4} className="text-2xl">2</Heading>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant="error" size="sm">High priority alerts</Badge>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border rounded-lg hover:bg-accent transition-colors group">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-medium">Active Sessions</div>
                <div className="text-sm text-muted-foreground">1,247 users online</div>
              </div>
            </div>
          </button>
          
          <button className="p-4 text-left border rounded-lg hover:bg-accent transition-colors group">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-medium">Database Health</div>
                <div className="text-sm text-muted-foreground">98.5% query efficiency</div>
              </div>
            </div>
          </button>
          
          <button className="p-4 text-left border rounded-lg hover:bg-accent transition-colors group">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-medium">Recent Alerts</div>
                <div className="text-sm text-muted-foreground">5 new notifications</div>
              </div>
            </div>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dependency Graph */}
          <Card 
            title="Dependency Graph" 
            description="Real-time visualization of service dependencies and critical paths"
            className="lg:col-span-2 hover-lift"
          >
            <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-4">
              <DependencyGraph 
                nodes={sampleNodes} 
                links={sampleLinks}
                width={800}
                height={400}
              />
            </div>
          </Card>

          {/* Performance Chart */}
          <Card 
            title="Performance Metrics" 
            description="Response time trends and threshold monitoring"
            className="lg:col-span-2 hover-lift"
          >
            <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg p-4">
              <PerformanceChart 
                data={samplePerformanceData}
                metric="Response Time (ms)"
                width={800}
                height={300}
              />
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card title="Recent Activity" description="Latest system events and performance insights" className="hover-lift">
          <div className="space-y-4">
            {[
              { time: '2 minutes ago', event: 'Critical path optimization completed', type: 'success' },
              { time: '15 minutes ago', event: 'High response time detected in User Service', type: 'warning' },
              { time: '1 hour ago', event: 'Security scan completed - 2 vulnerabilities found', type: 'error' },
              { time: '2 hours ago', event: 'Database connection pool optimized', type: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-orange-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.event}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
