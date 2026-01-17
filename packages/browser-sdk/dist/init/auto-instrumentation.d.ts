import { TraceLensSDK } from '../core/tracer';
import { SDKConfig } from '../config/sdk-config';
export interface AutoInstrumentationOptions extends Partial<SDKConfig> {
    autoStart?: boolean;
}
export declare function autoInstrument(options?: AutoInstrumentationOptions): TraceLensSDK;
declare global {
    interface Window {
        TraceLens?: {
            init: (options: AutoInstrumentationOptions) => TraceLensSDK;
            version: string;
        };
    }
}
//# sourceMappingURL=auto-instrumentation.d.ts.map