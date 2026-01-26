// Self-monitoring configuration for TraceLens browser SDK
import { TraceLensSDK } from './core/tracer';

export interface SelfMonitorConfig {
  enabled: boolean;
  projectKey: string;
  endpoint: string;
  sampling: number;
}

export function createSelfMonitoringSDK(config: Partial<SelfMonitorConfig> = {}): TraceLensSDK | null {
  // Only enable when TRACELENS_SELF_MONITOR environment variable is true
  if (!process.env.TRACELENS_SELF_MONITOR || process.env.TRACELENS_SELF_MONITOR !== 'true') {
    return null;
  }

  const selfMonitorConfig: SelfMonitorConfig = {
    enabled: true,
    projectKey: '__SYSTEM__',
    endpoint: config.endpoint || 'http://localhost:3001/api/events',
    sampling: 1.0, // Monitor everything for self-monitoring
    ...config
  };

  return new TraceLensSDK({
    projectKey: selfMonitorConfig.projectKey,
    endpoint: selfMonitorConfig.endpoint,
    sampling: selfMonitorConfig.sampling,
    enableWebVitals: true,
    enableResourceTiming: true,
    enableLongTasks: true,
    enableErrorTracking: true,
    debug: process.env.NODE_ENV === 'development'
  });
}

export function isSelfMonitoringEnabled(): boolean {
  return process.env.TRACELENS_SELF_MONITOR === 'true';
}
