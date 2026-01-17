// Shared utilities
export * from './validation';
export function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
