import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
  }

  // Mock trace data - in production, this would fetch from the ingestion service
  const traces = [
    {
      id: 'trace-1',
      projectId,
      name: 'User Login Flow',
      duration: 340,
      timestamp: Date.now() - 120000,
      status: 'completed',
      spans: [
        { id: 'span-1', name: 'Login Request', duration: 45, parentId: null },
        { id: 'span-2', name: 'Auth Service', duration: 120, parentId: 'span-1' },
        { id: 'span-3', name: 'User DB Query', duration: 180, parentId: 'span-2' },
        { id: 'span-4', name: 'Session Store', duration: 25, parentId: 'span-2' },
      ]
    },
    {
      id: 'trace-2',
      projectId,
      name: 'Product Search',
      duration: 156,
      timestamp: Date.now() - 60000,
      status: 'completed',
      spans: [
        { id: 'span-1', name: 'Search Request', duration: 12, parentId: null },
        { id: 'span-2', name: 'Search Service', duration: 89, parentId: 'span-1' },
        { id: 'span-3', name: 'Elasticsearch Query', duration: 67, parentId: 'span-2' },
        { id: 'span-4', name: 'Cache Lookup', duration: 8, parentId: 'span-2' },
      ]
    }
  ];

  return NextResponse.json(traces);
}
