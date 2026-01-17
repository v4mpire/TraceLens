// SDK configuration interface
export interface SDKConfig {
  projectKey: string;
  endpoint: string;
  sampling: number;
  bufferSize: number;
  flushInterval: number;
  enableWebVitals: boolean;
  enableResourceTiming: boolean;
  enableLongTasks: boolean;
  enableErrorTracking: boolean;
  debug: boolean;
}

export const DEFAULT_CONFIG: SDKConfig = {
  projectKey: '',
  endpoint: 'https://api.tracelens.dev/events',
  sampling: 1.0,
  bufferSize: 100,
  flushInterval: 5000,
  enableWebVitals: true,
  enableResourceTiming: true,
  enableLongTasks: true,
  enableErrorTracking: true,
  debug: false
};

export function validateConfig(config: Partial<SDKConfig>): string[] {
  const errors: string[] = [];

  if (!config.projectKey || config.projectKey.trim() === '') {
    errors.push('projectKey is required');
  }

  if (config.sampling !== undefined && (config.sampling < 0 || config.sampling > 1)) {
    errors.push('sampling must be between 0 and 1');
  }

  if (config.bufferSize !== undefined && config.bufferSize < 1) {
    errors.push('bufferSize must be greater than 0');
  }

  if (config.flushInterval !== undefined && config.flushInterval < 1000) {
    errors.push('flushInterval must be at least 1000ms');
  }

  if (config.endpoint && !isValidUrl(config.endpoint)) {
    errors.push('endpoint must be a valid URL');
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
