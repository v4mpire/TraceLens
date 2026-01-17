export class BeaconSender {
    constructor(config) {
        this.fallbackQueue = [];
        this.config = config;
    }
    async send(events) {
        if (events.length === 0)
            return;
        const payload = {
            projectKey: this.config.projectKey,
            events: events,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        const success = await this.sendWithBeacon(payload) ||
            await this.sendWithFetch(payload);
        if (!success) {
            // Queue for retry on next flush
            this.fallbackQueue.push(...events);
            throw new Error('Failed to send events');
        }
    }
    async sendWithBeacon(payload) {
        if (!('sendBeacon' in navigator)) {
            return false;
        }
        try {
            const data = JSON.stringify(payload);
            const blob = new Blob([data], { type: 'application/json' });
            return navigator.sendBeacon(this.config.endpoint, blob);
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: Beacon send failed:', error);
            }
            return false;
        }
    }
    async sendWithFetch(payload) {
        if (!('fetch' in window)) {
            return false;
        }
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                keepalive: true
            });
            return response.ok;
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('TraceLens: Fetch send failed:', error);
            }
            return false;
        }
    }
    getQueueSize() {
        return this.fallbackQueue.length;
    }
    clearQueue() {
        this.fallbackQueue = [];
    }
}
