"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceLensServerSDK = void 0;
// OpenTelemetry integration wrapper for TraceLens
const sdk_node_1 = require("@opentelemetry/sdk-node");
const resources_1 = require("@opentelemetry/resources");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const exporter_trace_otlp_http_1 = require("@opentelemetry/exporter-trace-otlp-http");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const dependency_scanner_1 = require("./dependency-scanner");
const execution_tracker_1 = require("./execution-tracker");
class TraceLensServerSDK {
    constructor(config) {
        this.nodeSDK = null;
        this.initialized = false;
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
        this.dependencyScanner = new dependency_scanner_1.DependencyScanner(this.config);
        this.executionTracker = new execution_tracker_1.ExecutionTracker(this.config);
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Create OpenTelemetry SDK
            this.nodeSDK = new sdk_node_1.NodeSDK({
                resource: new resources_1.Resource({
                    [semantic_conventions_1.SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
                    [semantic_conventions_1.SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
                    [semantic_conventions_1.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
                }),
                traceExporter: this.createTraceExporter(),
                instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)({
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
        }
        catch (error) {
            console.error('Failed to initialize TraceLens Server SDK:', error);
            throw error;
        }
    }
    async shutdown() {
        if (!this.initialized)
            return;
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
        }
        catch (error) {
            console.error('Error during TraceLens Server SDK shutdown:', error);
        }
    }
    getDependencySnapshot() {
        return this.dependencyScanner.getSnapshot();
    }
    getExecutionMetrics() {
        return this.executionTracker.getMetrics();
    }
    isInitialized() {
        return this.initialized;
    }
    createTraceExporter() {
        if (this.config.otlpEndpoint) {
            return new exporter_trace_otlp_http_1.OTLPTraceExporter({
                url: this.config.otlpEndpoint,
            });
        }
        // Custom exporter for TraceLens endpoint
        return new exporter_trace_otlp_http_1.OTLPTraceExporter({
            url: this.config.endpoint || 'http://localhost:3001/api/traces',
        });
    }
}
exports.TraceLensServerSDK = TraceLensServerSDK;
