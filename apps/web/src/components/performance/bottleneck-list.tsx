import React, { useState } from 'react';

interface Bottleneck {
  id: string;
  name: string;
  type: 'service' | 'database' | 'external' | 'function';
  duration: number;
  impact: number; // Percentage of total time
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'cpu' | 'io' | 'network' | 'database' | 'external';
  recommendations: string[];
  occurrences: number;
  averageDuration: number;
  metadata: {
    [key: string]: any;
  };
}

interface BottleneckListProps {
  bottlenecks: Bottleneck[];
  onBottleneckSelect?: (bottleneck: Bottleneck) => void;
  className?: string;
}

export const BottleneckList: React.FC<BottleneckListProps> = ({
  bottlenecks,
  onBottleneckSelect,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<'impact' | 'duration' | 'occurrences'>('impact');
  const [filterBy, setFilterBy] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedBottleneck, setSelectedBottleneck] = useState<Bottleneck | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cpu':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case 'database':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      case 'network':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case 'io':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'external':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        );
      default:
        return null;
    }
  };

  const filteredBottlenecks = bottlenecks
    .filter(b => filterBy === 'all' || b.severity === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case 'impact': return b.impact - a.impact;
        case 'duration': return b.duration - a.duration;
        case 'occurrences': return b.occurrences - a.occurrences;
        default: return 0;
      }
    });

  const handleBottleneckClick = (bottleneck: Bottleneck) => {
    setSelectedBottleneck(bottleneck);
    onBottleneckSelect?.(bottleneck);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Bottlenecks</h3>
          <span className="text-sm text-gray-500">{filteredBottlenecks.length} issues found</span>
        </div>

        {/* Filters and sorting */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="impact">Impact</option>
              <option value="duration">Duration</option>
              <option value="occurrences">Occurrences</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottleneck list */}
      <div className="max-h-96 overflow-y-auto">
        {filteredBottlenecks.map((bottleneck) => (
          <div
            key={bottleneck.id}
            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedBottleneck?.id === bottleneck.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleBottleneckClick(bottleneck)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-gray-500">
                    {getCategoryIcon(bottleneck.category)}
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {bottleneck.name}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(bottleneck.severity)}`}>
                    {bottleneck.severity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                  <div>
                    <span className="font-medium">Impact:</span> {bottleneck.impact.toFixed(1)}%
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {bottleneck.duration}ms
                  </div>
                  <div>
                    <span className="font-medium">Occurrences:</span> {bottleneck.occurrences}
                  </div>
                </div>

                {/* Impact bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      bottleneck.severity === 'critical' ? 'bg-red-500' :
                      bottleneck.severity === 'high' ? 'bg-orange-500' :
                      bottleneck.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(bottleneck.impact, 100)}%` }}
                  />
                </div>

                {/* Top recommendation */}
                {bottleneck.recommendations.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Recommendation:</span> {bottleneck.recommendations[0]}
                  </div>
                )}
              </div>

              <div className="ml-4 text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {bottleneck.duration}ms
                </div>
                <div className="text-sm text-gray-500">
                  avg: {bottleneck.averageDuration}ms
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {selectedBottleneck?.id === bottleneck.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  {/* All recommendations */}
                  {bottleneck.recommendations.length > 1 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">All Recommendations:</h5>
                      <ul className="space-y-1">
                        {bottleneck.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata */}
                  {Object.keys(bottleneck.metadata).length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Additional Details:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(bottleneck.metadata).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-500">{key}:</span>
                            <span className="ml-1 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBottlenecks.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p>No bottlenecks found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};
