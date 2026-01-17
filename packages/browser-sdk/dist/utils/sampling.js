// Performance sampling logic to maintain <1ms overhead
export class SamplingManager {
    constructor(samplingRate = 1.0, adaptiveSampling = true, performanceThreshold = 1.0 // 1ms threshold
    ) {
        this.currentOverhead = 0;
        this.measurementCount = 0;
        this.samplingRate = Math.max(0, Math.min(1, samplingRate));
        this.adaptiveSampling = adaptiveSampling;
        this.performanceThreshold = performanceThreshold;
    }
    shouldSample() {
        return Math.random() < this.getCurrentSamplingRate();
    }
    measureOverhead(operation) {
        const startTime = performance.now();
        const result = operation();
        const overhead = performance.now() - startTime;
        this.updateOverheadMeasurement(overhead);
        return result;
    }
    getCurrentSamplingRate() {
        if (!this.adaptiveSampling) {
            return this.samplingRate;
        }
        // Reduce sampling if overhead is too high
        if (this.currentOverhead > this.performanceThreshold) {
            const reductionFactor = Math.min(0.5, this.performanceThreshold / this.currentOverhead);
            return this.samplingRate * reductionFactor;
        }
        return this.samplingRate;
    }
    getAverageOverhead() {
        return this.currentOverhead;
    }
    setSamplingRate(rate) {
        this.samplingRate = Math.max(0, Math.min(1, rate));
    }
    enableAdaptiveSampling(enabled) {
        this.adaptiveSampling = enabled;
    }
    updateOverheadMeasurement(overhead) {
        // Use exponential moving average for smooth adaptation
        const alpha = 0.1; // Smoothing factor
        if (this.measurementCount === 0) {
            this.currentOverhead = overhead;
        }
        else {
            this.currentOverhead = alpha * overhead + (1 - alpha) * this.currentOverhead;
        }
        this.measurementCount++;
    }
}
// Utility functions for sampling decisions
export function createTimeBudgetSampler(budgetMs) {
    let usedBudget = 0;
    let lastReset = Date.now();
    const resetInterval = 1000; // Reset budget every second
    return () => {
        const now = Date.now();
        // Reset budget if interval has passed
        if (now - lastReset > resetInterval) {
            usedBudget = 0;
            lastReset = now;
        }
        // Check if we have budget remaining
        if (usedBudget < budgetMs) {
            usedBudget += 0.1; // Assume 0.1ms per operation
            return true;
        }
        return false;
    };
}
export function createUserInteractionSampler() {
    let lastInteraction = 0;
    let interactionCount = 0;
    // Track user interactions
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            lastInteraction = Date.now();
            interactionCount++;
        }, { passive: true });
    });
    return () => {
        const timeSinceInteraction = Date.now() - lastInteraction;
        // Sample more during active user sessions
        if (timeSinceInteraction < 5000) { // 5 seconds
            return Math.random() < 0.8; // 80% sampling during active use
        }
        else if (timeSinceInteraction < 30000) { // 30 seconds
            return Math.random() < 0.3; // 30% sampling during idle
        }
        else {
            return Math.random() < 0.1; // 10% sampling when inactive
        }
    };
}
