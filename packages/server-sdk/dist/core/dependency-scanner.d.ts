import { DependencySnapshot } from '@tracelens/shared';
import { ServerSDKConfig } from './tracer';
export declare class DependencyScanner {
    private config;
    private packageJsonPath;
    private lockfilePath;
    private runtimeDependencies;
    private packageInfo;
    private scanInterval;
    constructor(config: ServerSDKConfig);
    initialize(): Promise<void>;
    shutdown(): void;
    getSnapshot(): DependencySnapshot;
    private findPackageJson;
    private findLockfile;
    private loadPackageInfo;
    private hookRequire;
    private trackRuntimeDependency;
    private extractPackageName;
    private getPackageVersion;
    private extractDependencies;
    private detectPackageManager;
    private calculateTotalSize;
    private scanRuntimeDependencies;
    private generateId;
}
//# sourceMappingURL=dependency-scanner.d.ts.map