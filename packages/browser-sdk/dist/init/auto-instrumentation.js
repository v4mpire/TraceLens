// Automatic SDK setup with minimal overhead
import { TraceLensSDK } from '../core/tracer';
import { validateConfig } from '../config/sdk-config';
export function autoInstrument(options = {}) {
    const startTime = performance.now();
    // Validate configuration
    const configErrors = validateConfig(options);
    if (configErrors.length > 0) {
        throw new Error(`TraceLens configuration errors: ${configErrors.join(', ')}`);
    }
    // Create SDK instance
    const sdk = new TraceLensSDK(options);
    // Auto-start if requested (default: true)
    if (options.autoStart !== false) {
        // Use requestIdleCallback for non-blocking startup
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => sdk.start());
        }
        else {
            setTimeout(() => sdk.start(), 0);
        }
    }
    // Setup page visibility handling for efficient resource usage
    setupVisibilityHandling(sdk);
    // Setup beforeunload handling for final data flush
    setupUnloadHandling(sdk);
    const setupTime = performance.now() - startTime;
    if (options.debug && setupTime > 1) {
        console.warn(`TraceLens auto-instrumentation took ${setupTime.toFixed(2)}ms (target: <1ms)`);
    }
    return sdk;
}
function setupVisibilityHandling(sdk) {
    if (!('visibilityState' in document))
        return;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Page is hidden, reduce activity
            // SDK will automatically handle this through sampling and batching
        }
        else if (document.visibilityState === 'visible') {
            // Page is visible again, resume normal operation
            // SDK continues normal operation
        }
    });
}
function setupUnloadHandling(sdk) {
    // Use pagehide for better mobile support
    window.addEventListener('pagehide', () => {
        // Flush any remaining data before page unload
        try {
            sdk.stop(); // This will flush the buffer
        }
        catch (error) {
            // Silently handle errors during unload
        }
    });
    // Fallback for older browsers
    window.addEventListener('beforeunload', () => {
        try {
            sdk.stop();
        }
        catch (error) {
            // Silently handle errors during unload
        }
    });
}
// Auto-initialize if configuration is found in global scope
if (typeof window !== 'undefined') {
    window.TraceLens = {
        init: autoInstrument,
        version: '0.1.0'
    };
    // Check for global configuration
    const globalConfig = window.TRACELENS_CONFIG;
    if (globalConfig && globalConfig.projectKey) {
        autoInstrument(globalConfig);
    }
}
