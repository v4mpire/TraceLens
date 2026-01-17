// TraceLens Browser SDK
export { TraceLensSDK } from './core/tracer';
export { autoInstrument } from './init/auto-instrumentation';
export { DEFAULT_CONFIG, validateConfig } from './config/sdk-config';
export { WebVitalsCollector } from './collectors/web-vitals';
export { NavigationTimingCollector } from './collectors/navigation-timing';
export { SamplingManager, createTimeBudgetSampler, createUserInteractionSampler } from './utils/sampling';
