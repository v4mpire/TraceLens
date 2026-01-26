'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardClient, DashboardMetrics } from '../lib/api/dashboard-client';

export interface UseRealTimeMetricsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

export interface UseRealTimeMetricsReturn {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useRealTimeMetrics(options: UseRealTimeMetricsOptions = {}): UseRealTimeMetricsReturn {
  const { refreshInterval = 30000, enabled = true } = options;
  
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const newMetrics = await dashboardClient.getMetrics();
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchMetrics();

    // Set up polling interval
    const interval = setInterval(fetchMetrics, refreshInterval);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [fetchMetrics, refreshInterval, enabled]);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        fetchMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMetrics, enabled]);

  return {
    metrics,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
