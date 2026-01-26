// OpenTelemetry integration wrapper for TraceLens
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { DependencyScanner } from './dependency-scanner';
import { ExecutionTracker } from './execution-tracker';
import { TraceContext, TracingConfig } from '@tracelens/shared';

export interface ServerSDKConfig extends TracingConfig {
  enableDependencyScanning: boolean;
  enableExecutionTracking: boolean;
  otlpEndpoint?: string;
  debug: boolean;
}

export class TraceLensServerSDK {
  private config: ServerSDKConfig;
  private nodeSDK: NodeSDK | null = null;
  private dependencyScanner: DependencyScanner;
  private executionTracker: ExecutionTracker;
  private initialized = false;

  constructor(config: Partial<ServerSDKConfig>) {
    this.config = {
      serviceName: config.serviceName || 'unknown-service',
      serviceVersion: config.serviceVersion || '1.0.0',
      environment: config.environment || 'development',
      samplingRate: config.samplingRate || 1.0,
      endpoint: config.endpoint || 'http://localhost:3001/api/traces',
      enableDependencyScanning: config.enableDependencyScanning !== false,
      enableExecutionTracking: config.enableExecutionTracking !== false,
      otlpEndpoint: config.otlpEndpoint || undefined,
      debug: config.debug || false
    };

    this.dependencyScanner = new DependencyScanner(this.config);
    this.executionTracker = new ExecutionTracker(this.config);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create OpenTelemetry SDK
      this.nodeSDK = new NodeSDK({
        resource: resourceFromAttributes({
          [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
          [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
          [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
        }),
        traceExporter: this.createTraceExporter(),
        instrumentations: [getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable to reduce noise
          },
        })],
      });

      // Start OpenTelemetry SDK
      this.nodeSDK.start();

      // Initialize TraceLens components
      if (this.config.enableDependencyScanning) {
        await this.dependencyScanner.initialize();
      }

      if (this.config.enableExecutionTracking) {
        this.executionTracker.initialize();
      }

      this.initialized = true;

      if (this.config.debug) {
        console.log('TraceLens Server SDK initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize TraceLens Server SDK:', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;

    try {
      if (this.nodeSDK) {
        await this.nodeSDK.shutdown();
      }

      this.dependencyScanner.shutdown();
      this.executionTracker.shutdown();

      this.initialized = false;

      if (this.config.debug) {
        console.log('TraceLens Server SDK shutdown successfully');
      }
    } catch (error) {
      console.error('Error during TraceLens Server SDK shutdown:', error);
    }
  }

  public getDependencySnapshot() {
    return this.dependencyScanner.getSnapshot();
  }

  public getExecutionMetrics() {
    return this.executionTracker.getMetrics();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private createTraceExporter() {
    if (this.config.otlpEndpoint) {
      return new OTLPTraceExporter({
        url: this.config.otlpEndpoint,
      });
    }

    // Custom exporter for TraceLens endpoint
    return new OTLPTraceExporter({
      url: this.config.endpoint || 'http://localhost:3001/api/traces',
    });
  }
}
