export interface VersionInfo {
    name: string;
    currentVersion: string;
    latestVersion?: string;
    wantedVersion?: string;
    isOutdated: boolean;
    securityVulnerabilities: number;
}
export interface VersionAnalysis {
    packages: VersionInfo[];
    outdatedCount: number;
    vulnerableCount: number;
    totalPackages: number;
}
export declare class VersionDetector {
    private projectRoot;
    private packageManager;
    constructor(projectRoot?: string);
    analyzeVersions(): Promise<VersionAnalysis>;
    getPackageVersion(packageName: string): Promise<string | null>;
    checkForUpdates(packageName: string): Promise<{
        current: string;
        latest: string;
        wanted: string;
    } | null>;
    private detectPackageManager;
    private getInstalledPackages;
    private getOutdatedPackages;
    private getVulnerabilities;
}
//# sourceMappingURL=version-detector.d.ts.map