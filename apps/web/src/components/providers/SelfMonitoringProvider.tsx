'use client';

import { useEffect } from 'react';
import { initializeSelfMonitoring } from '../../bootstrap/self-monitor';

interface SelfMonitoringProviderProps {
  children: React.ReactNode;
}

export function SelfMonitoringProvider({ children }: SelfMonitoringProviderProps) {
  useEffect(() => {
    // Initialize self-monitoring on client side
    initializeSelfMonitoring().catch(console.error);
  }, []);

  return <>{children}</>;
}
