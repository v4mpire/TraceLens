// Shared type definitions
export * from './trace.types';
export * from './performance.types';
export * from './dependency.types';
export * from './security.types';

export interface BaseEvent {
  id: string;
  timestamp: number;
  projectId: string;
}
