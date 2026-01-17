'use client';

import { useState, useEffect } from 'react';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Runtime performance and dependency analysis</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="text-2xl font-bold text-blue-600">156ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-green-600">99.2%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Critical Path Nodes</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-gray-600">Active Security Risks</div>
          </Card>
        </div>

        {/* Dependency Graph */}
        <Card title="Dependency Graph">
          <DependencyGraph 
            nodes={sampleNodes} 
            links={sampleLinks}
            width={800}
            height={400}
          />
        </Card>

        {/* Performance Chart */}
        <Card title="Performance Metrics">
          <PerformanceChart 
            data={samplePerformanceData}
            metric="Response Time (ms)"
            width={800}
            height={300}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
