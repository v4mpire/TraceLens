import { BeaconSender } from '../transport/beacon-sender';
export class EventBuffer {
    constructor(config) {
        this.buffer = [];
        this.flushTimer = null;
        this.config = config;
        this.sender = new BeaconSender(config);
        this.startFlushTimer();
    }
    add(event) {
        // Apply sampling at buffer level
        if (Math.random() > this.config.sampling) {
            return;
        }
        this.buffer.push(event);
        // Flush if buffer is full
        if (this.buffer.length >= this.config.bufferSize) {
            this.flush();
        }
    }
    flush() {
        if (this.buffer.length === 0)
            return;
        const events = [...this.buffer];
        this.buffer = [];
        // Send events asynchronously
        this.sender.send(events).catch(error => {
            if (this.config.debug) {
                console.warn('TraceLens: Failed to send events:', error);
            }
            // Re-add events to buffer on failure (with limit to prevent memory leak)
            if (this.buffer.length < this.config.bufferSize) {
                this.buffer.unshift(...events.slice(0, this.config.bufferSize - this.buffer.length));
            }
        });
    }
    getBufferSize() {
        return this.buffer.length;
    }
    clear() {
        this.buffer = [];
    }
    destroy() {
        this.flush();
        this.stopFlushTimer();
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            if (this.buffer.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    }
    stopFlushTimer() {
        if (this.flushTimer !== null) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}
