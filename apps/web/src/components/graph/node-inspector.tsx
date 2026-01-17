import React from 'react';

interface NodeDetails {
  id: string;
  name: string;
  type: 'service' | 'database' | 'external' | 'function';
  duration: number;
  startTime: number;
  endTime: number;
  isBottleneck: boolean;
  isCriticalPath: boolean;
  dependencies: string[];
  dependents: string[];
  metadata: {
    [key: string]: any;
  };
  performance: {
    cpuTime?: number;
    memoryUsage?: number;
    networkTime?: number;
    ioTime?: number;
  };
  errors?: Array<{
    message: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

interface NodeInspectorProps {
  node: NodeDetails | null;
  onClose: () => void;
  className?: string;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  className = ''
}) => {
  if (!node) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
        );
      case 'database':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      case 'external':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      case 'function':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceBreakdown = () => {
    const { performance } = node;
    const total = node.duration;
    const breakdown = [];

    if (performance.cpuTime) {
      breakdown.push({ label: 'CPU', value: performance.cpuTime, color: 'bg-blue-500' });
    }
    if (performance.networkTime) {
      breakdown.push({ label: 'Network', value: performance.networkTime, color: 'bg-green-500' });
    }
    if (performance.ioTime) {
      breakdown.push({ label: 'I/O', value: performance.ioTime, color: 'bg-yellow-500' });
    }

    const accounted = breakdown.reduce((sum, item) => sum + item.value, 0);
    if (accounted < total) {
      breakdown.push({ label: 'Other', value: total - accounted, color: 'bg-gray-400' });
    }

    return breakdown;
  };

  return (
    <div className={`bg-white rounded-lg shadow-xl border max-w-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">
            {getTypeIcon(node.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{node.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{node.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          {node.isBottleneck && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Bottleneck
            </span>
          )}
          {node.isCriticalPath && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Critical Path
            </span>
          )}
        </div>

        {/* Timing information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="ml-2 font-medium">{formatDuration(node.duration)}</span>
          </div>
          <div>
            <span className="text-gray-500">Start:</span>
            <span className="ml-2 font-medium">{formatDuration(node.startTime)}</span>
          </div>
        </div>

        {/* Performance breakdown */}
        {Object.keys(node.performance).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Breakdown</h4>
            <div className="space-y-2">
              {getPerformanceBreakdown().map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium">{formatDuration(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {node.dependencies.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Dependencies</h4>
            <div className="space-y-1">
              {node.dependencies.map((dep, index) => (
                <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dependents */}
        {node.dependents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Dependents</h4>
            <div className="space-y-1">
              {node.dependents.map((dep, index) => (
                <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  {dep}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {node.errors && node.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Errors</h4>
            <div className="space-y-2">
              {node.errors.map((error, index) => (
                <div key={index} className={`p-2 rounded text-sm ${
                  error.severity === 'high' ? 'bg-red-50 text-red-800' :
                  error.severity === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                  'bg-gray-50 text-gray-800'
                }`}>
                  <div className="font-medium">{error.message}</div>
                  <div className="text-xs opacity-75">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(node.metadata).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
            <div className="space-y-1">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-500">{key}:</span>
                  <span className="font-medium truncate ml-2">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
