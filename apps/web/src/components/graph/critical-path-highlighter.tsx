import React from 'react';

interface CriticalPathNode {
  id: string;
  name: string;
  duration: number;
  cumulativeDuration: number;
  type: string;
}

interface CriticalPathHighlighterProps {
  criticalPath: CriticalPathNode[];
  totalDuration: number;
  onNodeHighlight?: (nodeId: string) => void;
  className?: string;
}

export const CriticalPathHighlighter: React.FC<CriticalPathHighlighterProps> = ({
  criticalPath,
  totalDuration,
  onNodeHighlight,
  className = ''
}) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-500';
      case 'database': return 'bg-green-500';
      case 'external': return 'bg-purple-500';
      case 'function': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPercentage = (duration: number) => {
    return ((duration / totalDuration) * 100).toFixed(1);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Critical Path Analysis</h3>
        <div className="text-sm text-gray-500">
          Total: {totalDuration}ms
        </div>
      </div>

      <div className="space-y-3">
        {criticalPath.map((node, index) => (
          <div
            key={node.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onNodeHighlight?.(node.id)}
          >
            {/* Step indicator */}
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>

            {/* Node type indicator */}
            <div className={`w-3 h-3 rounded-full ${getNodeColor(node.type)}`} />

            {/* Node details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {node.name}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{node.duration}ms</span>
                  <span className="text-xs">({getPercentage(node.duration)}%)</span>
                </div>
              </div>
              <div className="flex items-center mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getPercentage(node.duration)}%` }}
                  />
                </div>
                <span className="ml-2 text-xs text-gray-400">
                  Cumulative: {node.cumulativeDuration}ms
                </span>
              </div>
            </div>

            {/* Arrow indicator (except for last item) */}
            {index < criticalPath.length - 1 && (
              <div className="flex-shrink-0 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Critical Path Length:</span>
            <span className="ml-2 font-medium">{criticalPath.length} nodes</span>
          </div>
          <div>
            <span className="text-gray-500">Path Impact:</span>
            <span className="ml-2 font-medium text-red-600">
              {getPercentage(criticalPath[criticalPath.length - 1]?.cumulativeDuration || 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
