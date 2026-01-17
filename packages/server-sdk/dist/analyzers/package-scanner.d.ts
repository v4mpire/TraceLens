import { PackageInfo, PackageDependency } from '@tracelens/shared';
export interface PackageAnalysis {
    packageInfo: PackageInfo;
    dependencies: PackageDependency[];
    dependencyCount: {
        production: number;
        development: number;
        peer: number;
        optional: number;
    };
    securityIssues: string[];
    outdatedPackages: string[];
}
export declare class PackageScanner {
    private packageJsonPath;
    private lockfilePath;
    constructor(projectRoot?: string);
    analyze(): Promise<PackageAnalysis>;
    getDependencyTree(): Promise<any>;
    checkForVulnerabilities(): Promise<string[]>;
    private findPackageJson;
    private findLockfile;
    private loadPackageInfo;
    private extractDependencies;
    private countDependencies;
    private buildDependencyTree;
    private resolvePackageVersion;
}
//# sourceMappingURL=package-scanner.d.ts.map