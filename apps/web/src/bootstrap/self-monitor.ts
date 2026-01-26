// Self-monitoring initialization for TraceLens dashboard
import { TraceLensSDK } from '@tracelens/browser-sdk';

export interface SystemProject {
  id: string;
  name: string;
  deletable: boolean;
  immutable: true;
  auto_instrument: boolean;
}

let selfMonitoringSDK: TraceLensSDK | null = null;

export async function initializeSelfMonitoring(): Promise<void> {
  // Only initialize if environment variable is set
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_TRACELENS_SELF_MONITOR) {
    return;
  }

  try {
    // Create __SYSTEM__ project if it doesn't exist
    await ensureSystemProject();

    // Initialize browser SDK for self-monitoring
    selfMonitoringSDK = new TraceLensSDK({
      projectKey: '__SYSTEM__',
      endpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/events`,
      sampling: 1.0, // Monitor everything for self-monitoring
      enableWebVitals: true,
      enableResourceTiming: true,
      enableLongTasks: true,
      enableErrorTracking: true,
      debug: process.env.NODE_ENV === 'development'
    });

    selfMonitoringSDK.start();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 TraceLens self-monitoring initialized');
    }
  } catch (error) {
    console.error('Failed to initialize self-monitoring:', error);
  }
}

async function ensureSystemProject(): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projects/__SYSTEM__`);
    
    if (response.status === 404) {
      // Create __SYSTEM__ project
      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '__SYSTEM__',
          name: 'TraceLens Dashboard (Self)',
          deletable: false,
          immutable: true,
          auto_instrument: true
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create __SYSTEM__ project');
      }
    }
  } catch (error) {
    // Silently fail if backend is not available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Could not ensure __SYSTEM__ project:', error);
    }
  }
}

export function getSelfMonitoringSDK(): TraceLensSDK | null {
  return selfMonitoringSDK;
}

export function stopSelfMonitoring(): void {
  if (selfMonitoringSDK) {
    selfMonitoringSDK.stop();
    selfMonitoringSDK = null;
  }
}
