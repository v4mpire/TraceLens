'use client';

import { useState } from 'react';

interface SecurityRisk {
  id: string;
  cve: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  package: string;
  version: string;
  riskLevel: 'THEORETICAL' | 'POSSIBLE' | 'LIKELY' | 'ACTIVE';
  description: string;
  recommendation?: string;
}

interface SecurityRiskViewProps {
  risks: SecurityRisk[];
}

const severityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
};

const riskLevelColors = {
  THEORETICAL: 'bg-gray-100 text-gray-800',
  POSSIBLE: 'bg-blue-100 text-blue-800',
  LIKELY: 'bg-orange-100 text-orange-800',
  ACTIVE: 'bg-red-100 text-red-800'
};

export default function SecurityRiskView({ risks }: SecurityRiskViewProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<SecurityRisk | null>(null);

  const filteredRisks = risks.filter(risk => 
    filter === 'ALL' || risk.riskLevel === filter
  );

  const riskCounts = risks.reduce((acc, risk) => {
    acc[risk.riskLevel] = (acc[risk.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Risk Level Summary */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(riskCounts).map(([level, count]) => (
          <div
            key={level}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              filter === level ? 'ring-2 ring-blue-500' : ''
            } ${riskLevelColors[level as keyof typeof riskLevelColors]}`}
            onClick={() => setFilter(filter === level ? 'ALL' : level)}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm font-medium">{level}</div>
          </div>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1 rounded text-sm ${
            filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          All ({risks.length})
        </button>
        {Object.keys(riskLevelColors).map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            className={`px-3 py-1 rounded text-sm ${
              filter === level ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {level} ({riskCounts[level] || 0})
          </button>
        ))}
      </div>

      {/* Risk List */}
      <div className="space-y-3">
        {filteredRisks.map(risk => (
          <div
            key={risk.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedRisk(risk)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-mono text-sm font-medium">{risk.cve}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[risk.severity]}`}>
                    {risk.severity}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${riskLevelColors[risk.riskLevel]}`}>
                    {risk.riskLevel}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {risk.package}@{risk.version}
                </div>
                <div className="text-sm text-gray-800">
                  {risk.description}
                </div>
              </div>
              <div className="text-gray-400">
                →
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{selectedRisk.cve}</h3>
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${severityColors[selectedRisk.severity]}`}>
                  {selectedRisk.severity}
                </span>
                <span className={`px-3 py-1 rounded text-sm font-medium ${riskLevelColors[selectedRisk.riskLevel]}`}>
                  {selectedRisk.riskLevel}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Affected Package</h4>
                <p className="text-sm text-gray-600">{selectedRisk.package}@{selectedRisk.version}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-600">{selectedRisk.description}</p>
              </div>
              
              {selectedRisk.recommendation && (
                <div>
                  <h4 className="font-medium mb-1">Recommendation</h4>
                  <p className="text-sm text-gray-600">{selectedRisk.recommendation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
