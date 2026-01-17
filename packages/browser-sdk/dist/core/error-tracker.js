export class ErrorTracker {
    constructor(config, eventBuffer) {
        this.originalErrorHandler = null;
        this.originalUnhandledRejectionHandler = null;
        this.config = config;
        this.eventBuffer = eventBuffer;
    }
    start() {
        // Capture JavaScript errors
        this.originalErrorHandler = window.onerror;
        window.onerror = (message, filename, lineno, colno, error) => {
            // Process error asynchronously to avoid blocking
            setTimeout(() => {
                this.handleError({
                    type: 'javascript-error',
                    message: String(message),
                    filename: filename || '',
                    lineno: lineno || 0,
                    colno: colno || 0,
                    stack: error?.stack || '',
                    error: error
                });
            }, 0);
            // Call original handler if it exists
            if (this.originalErrorHandler) {
                return this.originalErrorHandler(message, filename, lineno, colno, error);
            }
            return false;
        };
        // Capture unhandled promise rejections
        this.originalUnhandledRejectionHandler = window.onunhandledrejection;
        window.onunhandledrejection = (event) => {
            // Process rejection asynchronously
            setTimeout(() => {
                this.handleError({
                    type: 'unhandled-promise-rejection',
                    message: String(event.reason),
                    filename: '',
                    lineno: 0,
                    colno: 0,
                    stack: event.reason?.stack || '',
                    error: event.reason
                });
            }, 0);
            // Call original handler if it exists
            if (this.originalUnhandledRejectionHandler) {
                this.originalUnhandledRejectionHandler(event);
            }
        };
    }
    stop() {
        // Restore original handlers
        if (this.originalErrorHandler) {
            window.onerror = this.originalErrorHandler;
            this.originalErrorHandler = null;
        }
        else {
            window.onerror = null;
        }
        if (this.originalUnhandledRejectionHandler) {
            window.onunhandledrejection = this.originalUnhandledRejectionHandler;
            this.originalUnhandledRejectionHandler = null;
        }
        else {
            window.onunhandledrejection = null;
        }
    }
    handleError(errorData) {
        if (Math.random() > this.config.sampling)
            return;
        try {
            const errorEvent = {
                id: this.generateId(),
                timestamp: Date.now(),
                type: errorData.type,
                message: errorData.message,
                source: 'browser',
                projectId: this.config.projectKey,
                stack: errorData.stack,
                filename: errorData.filename,
                lineno: errorData.lineno,
                colno: errorData.colno,
                url: window.location.href,
                userAgent: navigator.userAgent,
                severity: this.determineSeverity(errorData),
                tags: {
                    errorType: errorData.type,
                    hasStack: Boolean(errorData.stack)
                },
                context: {
                    environment: 'production',
                    version: '0.1.0'
                }
            };
            this.eventBuffer.add({
                id: errorEvent.id,
                timestamp: errorEvent.timestamp,
                type: 'error', // Cast to any to allow error type
                data: errorEvent,
                url: errorEvent.url,
                userAgent: errorEvent.userAgent
            });
        }
        catch (error) {
            // Silently fail to avoid infinite error loops
            if (this.config.debug) {
                console.warn('TraceLens: Error while tracking error:', error);
            }
        }
    }
    determineSeverity(errorData) {
        const message = errorData.message.toLowerCase();
        // Critical errors
        if (message.includes('script error') ||
            message.includes('network error') ||
            message.includes('out of memory')) {
            return 'critical';
        }
        // High severity errors
        if (message.includes('reference error') ||
            message.includes('type error') ||
            message.includes('syntax error')) {
            return 'high';
        }
        // Medium severity errors
        if (errorData.stack && errorData.stack.length > 0) {
            return 'medium';
        }
        // Low severity by default
        return 'low';
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
}
