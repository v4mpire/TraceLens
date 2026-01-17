'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DependencyGraph from '../../components/graphs/DependencyGraph';

// Sample trace data
const sampleTraces = [
  {
    id: 'trace-1',
    name: 'User Login Flow',
    duration: 340,
    timestamp: Date.now() - 120000,
    status: 'completed',
    nodes: [
      { id: '1', name: 'Login Request', type: 'service' as const, duration: 45 },
      { id: '2', name: 'Auth Service', type: 'service' as const, duration: 120, critical: true },
      { id: '3', name: 'User DB', type: 'database' as const, duration: 180, critical: true },
      { id: '4', name: 'Session Store', type: 'database' as const, duration: 25 },
    ],
    links: [
      { source: '1', target: '2', duration: 120 },
      { source: '2', target: '3', duration: 180 },
      { source: '2', target: '4', duration: 25 },
    ]
  },
  {
    id: 'trace-2',
    name: 'Product Search',
    duration: 156,
    timestamp: Date.now() - 60000,
    status: 'completed',
    nodes: [
      { id: '1', name: 'Search Request', type: 'service' as const, duration: 12 },
      { id: '2', name: 'Search Service', type: 'service' as const, duration: 89 },
      { id: '3', name: 'Elasticsearch', type: 'database' as const, duration: 67 },
      { id: '4', name: 'Cache', type: 'database' as const, duration: 8 },
    ],
    links: [
      { source: '1', target: '2', duration: 89 },
      { source: '2', target: '3', duration: 67 },
      { source: '2', target: '4', duration: 8 },
    ]
  }
];

export default function TracesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState(sampleTraces[0]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
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
          <h1 className="text-3xl font-bold text-gray-900">Traces</h1>
          <p className="text-gray-600 mt-2">Analyze execution traces and dependency flows</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trace List */}
          <div className="lg:col-span-1">
            <Card title="Recent Traces">
              <div className="space-y-3">
                {sampleTraces.map(trace => (
                  <div
                    key={trace.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTrace?.id === trace.id
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTrace(trace)}
                  >
                    <div className="font-medium text-sm">{trace.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {trace.duration}ms • {new Date(trace.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center mt-2">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        trace.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs text-gray-600">{trace.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Trace Details */}
          <div className="lg:col-span-2">
            <Card title={selectedTrace ? `Trace: ${selectedTrace.name}` : 'Select a trace'}>
              {selectedTrace && (
                <div className="space-y-6">
                  {/* Trace Metadata */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <div className="font-medium">{selectedTrace.duration}ms</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Timestamp:</span>
                      <div className="font-medium">
                        {new Date(selectedTrace.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="font-medium capitalize">{selectedTrace.status}</div>
                    </div>
                  </div>

                  {/* Dependency Graph */}
                  <div>
                    <h4 className="font-medium mb-4">Execution Flow</h4>
                    <DependencyGraph
                      nodes={selectedTrace.nodes}
                      links={selectedTrace.links}
                      width={600}
                      height={300}
                    />
                  </div>

                  {/* Critical Path Analysis */}
                  <div>
                    <h4 className="font-medium mb-3">Critical Path Analysis</h4>
                    <div className="space-y-2">
                      {selectedTrace.nodes
                        .filter(node => node.critical)
                        .map(node => (
                          <div key={node.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span className="text-sm font-medium">{node.name}</span>
                            <span className="text-sm text-red-600">{node.duration}ms</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
