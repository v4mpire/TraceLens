'use client';

import { useState, useEffect } from 'react';
import { Activity, Eye } from 'lucide-react';
import Badge from '../ui/Badge';

interface SelfMonitoringBannerProps {
  className?: string;
}

export default function SelfMonitoringBanner({ className = '' }: SelfMonitoringBannerProps) {
  const [traceCount, setTraceCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if self-monitoring is enabled
    const isSelfMonitoring = process.env.NEXT_PUBLIC_TRACELENS_SELF_MONITOR === 'true';
    setIsVisible(isSelfMonitoring);

    if (!isSelfMonitoring) return;

    // Fetch initial trace count
    fetchTraceCount();

    // Update trace count every 5 seconds
    const interval = setInterval(fetchTraceCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTraceCount = async () => {
    try {
      const response = await fetch('/api/self-metrics');
      if (response.ok) {
        const data = await response.json();
        setTraceCount(data.traceCount || 0);
      }
    } catch (error) {
      // Silently fail - self-monitoring is optional
      console.debug('Could not fetch self-monitoring metrics:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" size="sm" className="animate-pulse">
        <Eye className="h-3 w-3 mr-1" />
        Monitoring Itself
      </Badge>
      <Badge variant="outline" size="sm">
        <Activity className="h-3 w-3 mr-1" />
        {traceCount} traces
      </Badge>
    </div>
  );
}
