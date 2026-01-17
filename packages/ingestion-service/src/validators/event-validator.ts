// Event schema validation
import { PerformanceEvent, PerformanceEventSchema } from '@tracelens/shared';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';

export class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class EventValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true,
      removeAdditional: true, // Remove additional properties
      useDefaults: true,      // Use default values
      coerceTypes: true       // Coerce types when possible
    });
    
    addFormats(this.ajv);
    
    // Add custom formats
    this.ajv.addFormat('timestamp', {
      type: 'number',
      validate: (timestamp: number) => {
        // Validate timestamp is reasonable (between 2020 and 2050)
        return timestamp >= 1577836800000 && timestamp <= 2524608000000;
      }
    });
  }

  public validateEvent(event: unknown): PerformanceEvent {
    if (!event || typeof event !== 'object') {
      throw new ValidationError('Event must be an object', []);
    }

    const eventObj = event as Record<string, unknown>;

    // Basic required fields validation
    if (!eventObj.id || typeof eventObj.id !== 'string') {
      throw new ValidationError('Event ID is required and must be a string', []);
    }

    if (!eventObj.timestamp || typeof eventObj.timestamp !== 'number') {
      throw new ValidationError('Event timestamp is required and must be a number', []);
    }

    if (!eventObj.type || typeof eventObj.type !== 'string') {
      throw new ValidationError('Event type is required and must be a string', []);
    }

    if (!eventObj.data) {
      throw new ValidationError('Event data is required', []);
    }

    if (!eventObj.url || typeof eventObj.url !== 'string') {
      throw new ValidationError('Event URL is required and must be a string', []);
    }

    if (!eventObj.userAgent || typeof eventObj.userAgent !== 'string') {
      throw new ValidationError('Event userAgent is required and must be a string', []);
    }

    // Validate event type
    const validTypes = ['web-vitals', 'resource-timing', 'navigation-timing', 'long-task', 'error'];
    if (!validTypes.includes(eventObj.type as string)) {
      throw new ValidationError(`Invalid event type. Must be one of: ${validTypes.join(', ')}`, []);
    }

    // Validate timestamp range
    const timestamp = eventObj.timestamp as number;
    if (timestamp < 1577836800000 || timestamp > 2524608000000) {
      throw new ValidationError('Timestamp must be between 2020-01-01 and 2050-01-01', []);
    }

    // Validate URL format
    try {
      new URL(eventObj.url as string);
    } catch {
      throw new ValidationError('Invalid URL format', []);
    }

    // Validate ID format (alphanumeric and hyphens, 1-100 chars)
    const idPattern = /^[a-zA-Z0-9_-]{1,100}$/;
    if (!idPattern.test(eventObj.id as string)) {
      throw new ValidationError('Event ID must be alphanumeric with hyphens/underscores, 1-100 characters', []);
    }

    // Type-specific data validation
    this.validateEventData(eventObj.type as string, eventObj.data);

    return eventObj as unknown as PerformanceEvent;
  }

  public validateEventBatch(events: unknown[]): PerformanceEvent[] {
    if (!Array.isArray(events)) {
      throw new ValidationError('Events must be an array', []);
    }

    if (events.length === 0) {
      throw new ValidationError('Events array cannot be empty', []);
    }

    if (events.length > 1000) {
      throw new ValidationError('Maximum 1000 events per batch', []);
    }

    const validatedEvents: PerformanceEvent[] = [];
    const errors: string[] = [];

    for (let i = 0; i < events.length; i++) {
      try {
        const validatedEvent = this.validateEvent(events[i]);
        validatedEvents.push(validatedEvent);
      } catch (error) {
        errors.push(`Event ${i}: ${error instanceof Error ? error.message : 'Validation failed'}`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(`Batch validation failed: ${errors.length} invalid events`, errors);
    }

    return validatedEvents;
  }

  private validateEventData(type: string, data: unknown): void {
    if (!data || typeof data !== 'object') {
      throw new ValidationError(`${type} event data must be an object`, []);
    }

    switch (type) {
      case 'web-vitals':
        this.validateWebVitalsData(data);
        break;
      case 'resource-timing':
        this.validateResourceTimingData(data);
        break;
      case 'navigation-timing':
        this.validateNavigationTimingData(data);
        break;
      case 'long-task':
        this.validateLongTaskData(data);
        break;
      case 'error':
        this.validateErrorData(data);
        break;
      default:
        throw new ValidationError(`Unknown event type: ${type}`, []);
    }
  }

  private validateWebVitalsData(data: unknown): void {
    const vitals = data as Record<string, unknown>;
    
    // At least one metric should be present
    const validMetrics = ['cls', 'fid', 'lcp', 'fcp', 'ttfb', 'inp'];
    const hasValidMetric = validMetrics.some(metric => vitals[metric]);
    
    if (!hasValidMetric) {
      throw new ValidationError('Web Vitals data must contain at least one valid metric', []);
    }

    // Validate each present metric
    for (const [metric, value] of Object.entries(vitals)) {
      if (validMetrics.includes(metric) && value) {
        this.validateMetric(metric, value);
      }
    }
  }

  private validateMetric(metricName: string, metric: unknown): void {
    if (!metric || typeof metric !== 'object') {
      throw new ValidationError(`${metricName} metric must be an object`, []);
    }

    const m = metric as Record<string, unknown>;
    
    if (m.name !== metricName.toUpperCase()) {
      throw new ValidationError(`Metric name must be ${metricName.toUpperCase()}`, []);
    }

    if (typeof m.value !== 'number' || m.value < 0) {
      throw new ValidationError(`${metricName} value must be a non-negative number`, []);
    }

    const validRatings = ['good', 'needs-improvement', 'poor'];
    if (!validRatings.includes(m.rating as string)) {
      throw new ValidationError(`${metricName} rating must be one of: ${validRatings.join(', ')}`, []);
    }
  }

  private validateResourceTimingData(data: unknown): void {
    const resource = data as Record<string, unknown>;
    
    if (!resource.name || typeof resource.name !== 'string') {
      throw new ValidationError('Resource timing must have a name', []);
    }

    if (resource.entryType !== 'resource') {
      throw new ValidationError('Resource timing entryType must be "resource"', []);
    }

    if (typeof resource.startTime !== 'number' || resource.startTime < 0) {
      throw new ValidationError('Resource startTime must be a non-negative number', []);
    }

    if (typeof resource.duration !== 'number' || resource.duration < 0) {
      throw new ValidationError('Resource duration must be a non-negative number', []);
    }
  }

  private validateNavigationTimingData(data: unknown): void {
    const navigation = data as Record<string, unknown>;
    
    const validTypes = ['navigate', 'reload', 'back-forward', 'prerender'];
    if (!validTypes.includes(navigation.type as string)) {
      throw new ValidationError(`Navigation type must be one of: ${validTypes.join(', ')}`, []);
    }

    // Validate timing values are non-negative numbers
    const timingFields = ['domComplete', 'domContentLoadedEventEnd', 'domInteractive', 'loadEventEnd'];
    for (const field of timingFields) {
      if (navigation[field] !== undefined) {
        if (typeof navigation[field] !== 'number' || (navigation[field] as number) < 0) {
          throw new ValidationError(`${field} must be a non-negative number`, []);
        }
      }
    }
  }

  private validateLongTaskData(data: unknown): void {
    const task = data as Record<string, unknown>;
    
    if (task.entryType !== 'longtask') {
      throw new ValidationError('Long task entryType must be "longtask"', []);
    }

    if (typeof task.duration !== 'number' || task.duration < 50) {
      throw new ValidationError('Long task duration must be at least 50ms', []);
    }

    if (typeof task.startTime !== 'number' || task.startTime < 0) {
      throw new ValidationError('Long task startTime must be a non-negative number', []);
    }
  }

  private validateErrorData(data: unknown): void {
    const error = data as Record<string, unknown>;
    
    if (!error.message || typeof error.message !== 'string') {
      throw new ValidationError('Error data must have a message', []);
    }

    if (!error.source || typeof error.source !== 'string') {
      throw new ValidationError('Error data must have a source', []);
    }

    const validSources = ['browser', 'server', 'network'];
    if (!validSources.includes(error.source as string)) {
      throw new ValidationError(`Error source must be one of: ${validSources.join(', ')}`, []);
    }

    if (error.severity) {
      const validSeverities = ['low', 'medium', 'high', 'critical'];
      if (!validSeverities.includes(error.severity as string)) {
        throw new ValidationError(`Error severity must be one of: ${validSeverities.join(', ')}`, []);
      }
    }
  }
}
