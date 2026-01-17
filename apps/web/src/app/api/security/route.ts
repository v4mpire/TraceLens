import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  // Mock security risk data - in production, this would fetch from the security scanner
  const securityRisks = [
    {
      id: 'risk-1',
      projectId,
      cve: 'CVE-2023-1234',
      severity: 'HIGH',
      package: 'express',
      version: '4.17.1',
      riskLevel: 'ACTIVE',
      description: 'Prototype pollution vulnerability in Express.js middleware parsing',
      recommendation: 'Update to express@4.18.2 or later',
      detectedAt: Date.now() - 86400000,
      executionPath: ['app.js', 'middleware/auth.js', 'express/lib/router/index.js']
    },
    {
      id: 'risk-2',
      projectId,
      cve: 'CVE-2023-5678',
      severity: 'CRITICAL',
      package: 'lodash',
      version: '4.17.20',
      riskLevel: 'LIKELY',
      description: 'Command injection vulnerability in template processing',
      recommendation: 'Update to lodash@4.17.21 or use alternative library',
      detectedAt: Date.now() - 43200000,
      executionPath: ['utils/template.js', 'lodash/template.js']
    },
    {
      id: 'risk-3',
      projectId,
      cve: 'CVE-2023-9012',
      severity: 'MEDIUM',
      package: 'axios',
      version: '0.21.1',
      riskLevel: 'POSSIBLE',
      description: 'SSRF vulnerability in HTTP client request handling',
      recommendation: 'Update to axios@0.27.0 or later',
      detectedAt: Date.now() - 21600000,
      executionPath: ['services/api-client.js', 'axios/lib/core/Axios.js']
    },
    {
      id: 'risk-4',
      projectId,
      cve: 'CVE-2023-3456',
      severity: 'LOW',
      package: 'moment',
      version: '2.29.1',
      riskLevel: 'THEORETICAL',
      description: 'ReDoS vulnerability in date parsing regular expressions',
      recommendation: 'Consider migrating to date-fns or dayjs for better security',
      detectedAt: Date.now() - 10800000,
      executionPath: ['utils/date-helper.js', 'moment/src/lib/create/from-string.js']
    }
  ];

  return NextResponse.json(securityRisks);
}
