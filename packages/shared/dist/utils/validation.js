export class ValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
        this.name = 'ValidationError';
    }
}
export function validateTraceSpan(span) {
    if (!span || typeof span !== 'object') {
        throw new ValidationError('Span must be an object', 'span', span);
    }
    const s = span;
    if (!s.traceId || typeof s.traceId !== 'string') {
        throw new ValidationError('traceId must be a string', 'traceId', s.traceId);
    }
    if (!s.spanId || typeof s.spanId !== 'string') {
        throw new ValidationError('spanId must be a string', 'spanId', s.spanId);
    }
    if (!s.operationName || typeof s.operationName !== 'string') {
        throw new ValidationError('operationName must be a string', 'operationName', s.operationName);
    }
    if (!s.startTime || typeof s.startTime !== 'number') {
        throw new ValidationError('startTime must be a number', 'startTime', s.startTime);
    }
    if (s.endTime !== undefined && typeof s.endTime !== 'number') {
        throw new ValidationError('endTime must be a number', 'endTime', s.endTime);
    }
    if (!s.tags || typeof s.tags !== 'object') {
        throw new ValidationError('tags must be an object', 'tags', s.tags);
    }
    return s;
}
export function validateTrace(trace) {
    if (!trace || typeof trace !== 'object') {
        throw new ValidationError('Trace must be an object', 'trace', trace);
    }
    const t = trace;
    if (!t.traceId || typeof t.traceId !== 'string') {
        throw new ValidationError('traceId must be a string', 'traceId', t.traceId);
    }
    if (!Array.isArray(t.spans)) {
        throw new ValidationError('spans must be an array', 'spans', t.spans);
    }
    // Validate each span
    t.spans.forEach((span, index) => {
        try {
            validateTraceSpan(span);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new ValidationError(`Invalid span at index ${index}: ${errorMessage}`, `spans[${index}]`, span);
        }
    });
    return t;
}
export function validatePerformanceEvent(event) {
    if (!event || typeof event !== 'object') {
        throw new ValidationError('Event must be an object', 'event', event);
    }
    const e = event;
    if (!e.id || typeof e.id !== 'string') {
        throw new ValidationError('id must be a string', 'id', e.id);
    }
    if (!e.timestamp || typeof e.timestamp !== 'number') {
        throw new ValidationError('timestamp must be a number', 'timestamp', e.timestamp);
    }
    const validTypes = ['web-vitals', 'resource-timing', 'navigation-timing', 'long-task'];
    if (!e.type || !validTypes.includes(e.type)) {
        throw new ValidationError(`type must be one of: ${validTypes.join(', ')}`, 'type', e.type);
    }
    if (!e.url || typeof e.url !== 'string') {
        throw new ValidationError('url must be a string', 'url', e.url);
    }
    return e;
}
export function validateDependencySnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') {
        throw new ValidationError('Snapshot must be an object', 'snapshot', snapshot);
    }
    const s = snapshot;
    if (!s.id || typeof s.id !== 'string') {
        throw new ValidationError('id must be a string', 'id', s.id);
    }
    if (!s.projectId || typeof s.projectId !== 'string') {
        throw new ValidationError('projectId must be a string', 'projectId', s.projectId);
    }
    if (!s.timestamp || typeof s.timestamp !== 'number') {
        throw new ValidationError('timestamp must be a number', 'timestamp', s.timestamp);
    }
    if (!Array.isArray(s.dependencies)) {
        throw new ValidationError('dependencies must be an array', 'dependencies', s.dependencies);
    }
    return s;
}
export function validateCVERecord(cve) {
    if (!cve || typeof cve !== 'object') {
        throw new ValidationError('CVE must be an object', 'cve', cve);
    }
    const c = cve;
    if (!c.id || typeof c.id !== 'string') {
        throw new ValidationError('id must be a string', 'id', c.id);
    }
    // Validate CVE ID format
    const cveIdPattern = /^CVE-\d{4}-\d{4,}$/;
    if (!cveIdPattern.test(c.id)) {
        throw new ValidationError('id must be in CVE-YYYY-NNNN format', 'id', c.id);
    }
    if (!c.published || typeof c.published !== 'string') {
        throw new ValidationError('published must be a string', 'published', c.published);
    }
    return c;
}
export function sanitizeInput(input) {
    // Remove potentially dangerous characters
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}
export function validateProjectId(projectId) {
    // Project ID should be alphanumeric with hyphens and underscores
    const projectIdPattern = /^[a-zA-Z0-9_-]+$/;
    return projectIdPattern.test(projectId) && projectId.length >= 3 && projectId.length <= 50;
}
export function validateTimestamp(timestamp) {
    // Timestamp should be a reasonable Unix timestamp (after 2020, before 2050)
    const minTimestamp = 1577836800000; // 2020-01-01
    const maxTimestamp = 2524608000000; // 2050-01-01
    return timestamp >= minTimestamp && timestamp <= maxTimestamp;
}
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
export function validateVersion(version) {
    // Validate semantic version format
    const semverPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?(?:\+[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*)?$/;
    return semverPattern.test(version);
}
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
