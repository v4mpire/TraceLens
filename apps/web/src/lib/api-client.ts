import { Trace, PerformanceEvent, VulnerabilityAssessment } from '@tracelens/shared';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class TraceLensApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      
      if (!response.ok) {
        return { data: null as T, success: false, error: data.error || 'Request failed' };
      }
      
      return { data, success: true };
    } catch (error) {
      return { 
        data: null as T, 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  async getTraces(projectId: string): Promise<ApiResponse<Trace[]>> {
    return this.request<Trace[]>(`/traces?projectId=${projectId}`);
  }

  async getPerformanceMetrics(projectId: string): Promise<ApiResponse<PerformanceEvent[]>> {
    return this.request<PerformanceEvent[]>(`/performance?projectId=${projectId}`);
  }

  async getSecurityRisks(projectId: string): Promise<ApiResponse<VulnerabilityAssessment[]>> {
    return this.request<VulnerabilityAssessment[]>(`/security?projectId=${projectId}`);
  }

  async getDependencyGraph(traceId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/analysis/graph/${traceId}`);
  }
}

export const apiClient = new TraceLensApiClient();
