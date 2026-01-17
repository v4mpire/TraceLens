// Efficient event batching with minimal memory overhead
import { PerformanceEvent } from '@tracelens/shared';
import { SDKConfig } from '../config/sdk-config';
import { BeaconSender } from '../transport/beacon-sender';

export class EventBuffer {
  private config: SDKConfig;
  private buffer: PerformanceEvent[] = [];
  private sender: BeaconSender;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: SDKConfig) {
    this.config = config;
    this.sender = new BeaconSender(config);
    this.startFlushTimer();
  }

  public add(event: PerformanceEvent): void {
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

  public flush(): void {
    if (this.buffer.length === 0) return;

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

  public getBufferSize(): number {
    return this.buffer.length;
  }

  public clear(): void {
    this.buffer = [];
  }

  public destroy(): void {
    this.flush();
    this.stopFlushTimer();
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer !== null) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
