'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SecurityRiskView from '../../components/graphs/SecurityRiskView';

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

// Sample security risk data
const sampleRisks = [
  {
    id: 'risk-1',
    cve: 'CVE-2023-1234',
    severity: 'HIGH',
    package: 'express',
    version: '4.17.1',
    riskLevel: 'ACTIVE',
    description: 'Prototype pollution vulnerability in Express.js middleware parsing',
    recommendation: 'Update to express@4.18.2 or later'
  },
  {
    id: 'risk-2',
    cve: 'CVE-2023-5678',
    severity: 'CRITICAL',
    package: 'lodash',
    version: '4.17.20',
    riskLevel: 'LIKELY',
    description: 'Command injection vulnerability in template processing',
    recommendation: 'Update to lodash@4.17.21 or use alternative library'
  },
  {
    id: 'risk-3',
    cve: 'CVE-2023-9012',
    severity: 'MEDIUM',
    package: 'axios',
    version: '0.21.1',
    riskLevel: 'POSSIBLE',
    description: 'SSRF vulnerability in HTTP client request handling',
    recommendation: 'Update to axios@0.27.0 or later'
  },
  {
    id: 'risk-4',
    cve: 'CVE-2023-3456',
    severity: 'LOW',
    package: 'moment',
    version: '2.29.1',
    riskLevel: 'THEORETICAL',
    description: 'ReDoS vulnerability in date parsing regular expressions',
    recommendation: 'Consider migrating to date-fns or dayjs for better security'
  },
  {
    id: 'risk-5',
    cve: 'CVE-2023-7890',
    severity: 'HIGH',
    package: 'jsonwebtoken',
    version: '8.5.1',
    riskLevel: 'ACTIVE',
    description: 'Algorithm confusion vulnerability in JWT verification',
    recommendation: 'Update to jsonwebtoken@9.0.0 or later immediately'
  }
] as SecurityRisk[];

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
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

  // Calculate security metrics
  const criticalRisks = sampleRisks.filter(r => r.riskLevel === 'ACTIVE' && r.severity === 'CRITICAL');
  const highRisks = sampleRisks.filter(r => r.riskLevel === 'ACTIVE' && r.severity === 'HIGH');
  const activeRisks = sampleRisks.filter(r => r.riskLevel === 'ACTIVE');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security</h1>
          <p className="text-gray-600 mt-2">Runtime-relevant vulnerability assessment and risk analysis</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-2xl font-bold text-red-600">{criticalRisks.length}</div>
            <div className="text-sm text-gray-600">Active Critical Risks</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-orange-600">{highRisks.length}</div>
            <div className="text-sm text-gray-600">Active High Risks</div>
          </Card>
          <Card>
            <div className="text-2xl font-bold text-blue-600">{activeRisks.length}</div>
            <div className="text-sm text-gray-600">Total Active Risks</div>
          </Card>
        </div>

        {/* Risk Analysis */}
        <Card title="Security Risk Analysis">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Risk Level Explanation</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>ACTIVE:</strong> Vulnerability is in execution path and actively used</div>
              <div><strong>LIKELY:</strong> Vulnerability is in loaded dependencies with high usage probability</div>
              <div><strong>POSSIBLE:</strong> Vulnerability exists in dependencies but usage is uncertain</div>
              <div><strong>THEORETICAL:</strong> Vulnerability exists but is unlikely to be exploitable in current context</div>
            </div>
          </div>
          
          <SecurityRiskView risks={sampleRisks} />
        </Card>

        {/* Recommendations */}
        <Card title="Priority Actions">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">🚨 Immediate Action Required</h4>
              <div className="text-sm text-red-800">
                <p>{activeRisks.length} ACTIVE vulnerabilities detected in runtime execution paths.</p>
                <p>Update express and jsonwebtoken packages immediately.</p>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">⚠️ Review Required</h4>
              <div className="text-sm text-orange-800">
                <p>1 LIKELY vulnerability in lodash requires assessment.</p>
                <p>Consider impact on template processing functionality.</p>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Monitor</h4>
              <div className="text-sm text-blue-800">
                <p>2 lower-priority vulnerabilities identified.</p>
                <p>Schedule updates during next maintenance window.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
