export interface PackageDependency {
    name: string;
    version: string;
    type: DependencyType;
    resolved?: string;
    integrity?: string;
    dev?: boolean;
    optional?: boolean;
    bundled?: boolean;
}
export declare enum DependencyType {
    PRODUCTION = "production",
    DEVELOPMENT = "development",
    PEER = "peer",
    OPTIONAL = "optional",
    BUNDLED = "bundled"
}
export interface DependencyGraph {
    projectId: string;
    timestamp: number;
    rootPackage: PackageInfo;
    dependencies: Map<string, PackageDependency>;
    dependencyTree: DependencyNode;
    lockfileHash?: string;
}
export interface PackageInfo {
    name: string;
    version: string;
    description?: string;
    main?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    bundledDependencies?: string[];
}
export interface DependencyNode {
    name: string;
    version: string;
    path: string;
    children: DependencyNode[];
    parent?: DependencyNode;
    depth: number;
    circular?: boolean;
}
export interface RuntimeDependency {
    name: string;
    version: string;
    loadTime: number;
    executionTime: number;
    memoryUsage: number;
    importPath: string;
    isEsm: boolean;
    exports: string[];
}
export interface DependencySnapshot {
    id: string;
    projectId: string;
    timestamp: number;
    environment: 'development' | 'production' | 'test';
    nodeVersion: string;
    npmVersion?: string;
    yarnVersion?: string;
    packageManager: 'npm' | 'yarn' | 'pnpm';
    dependencies: PackageDependency[];
    runtimeDependencies: RuntimeDependency[];
    totalSize: number;
    bundleSize?: number;
}
export interface DependencyChange {
    type: 'added' | 'removed' | 'updated';
    package: string;
    oldVersion?: string;
    newVersion?: string;
    timestamp: number;
    reason?: string;
}
export interface DependencyAnalysis {
    snapshotId: string;
    criticalPath: string[];
    bottlenecks: DependencyBottleneck[];
    unusedDependencies: string[];
    duplicateDependencies: DuplicateDependency[];
    securityIssues: string[];
    performanceImpact: PerformanceImpact;
}
export interface DependencyBottleneck {
    package: string;
    version: string;
    impact: 'high' | 'medium' | 'low';
    reason: 'load-time' | 'execution-time' | 'memory-usage' | 'bundle-size';
    value: number;
    threshold: number;
}
export interface DuplicateDependency {
    package: string;
    versions: string[];
    paths: string[];
    wastedSize: number;
}
export interface PerformanceImpact {
    totalLoadTime: number;
    totalExecutionTime: number;
    totalMemoryUsage: number;
    criticalPathTime: number;
    parallelizableTime: number;
}
//# sourceMappingURL=dependency.types.d.ts.map