export interface ImportEvent {
    moduleName: string;
    importPath: string;
    timestamp: number;
    loadTime: number;
    caller?: string;
    isNative: boolean;
    isNodeModule: boolean;
}
export interface ImportMetrics {
    totalImports: number;
    uniqueModules: number;
    totalLoadTime: number;
    averageLoadTime: number;
    slowestImports: ImportEvent[];
    mostImported: Array<{
        module: string;
        count: number;
    }>;
}
export declare class ImportTracker {
    private imports;
    private moduleCount;
    private originalRequire;
    private isTracking;
    startTracking(): void;
    stopTracking(): void;
    getMetrics(): ImportMetrics;
    getImportsByModule(moduleName: string): ImportEvent[];
    getImportHistory(): ImportEvent[];
    clearHistory(): void;
    private recordImport;
    private normalizeModuleName;
    private isNativeModule;
    private isNodeModuleImport;
}
export declare const globalImportTracker: ImportTracker;
//# sourceMappingURL=import-tracker.d.ts.map