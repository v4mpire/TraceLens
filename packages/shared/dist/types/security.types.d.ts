export interface CVERecord {
    id: string;
    published: string;
    lastModified: string;
    vulnStatus: VulnerabilityStatus;
    descriptions: CVEDescription[];
    metrics: CVEMetrics;
    weaknesses: CVEWeakness[];
    configurations: CVEConfiguration[];
    references: CVEReference[];
    vendorComments?: CVEVendorComment[];
}
export declare enum VulnerabilityStatus {
    ANALYZED = "Analyzed",
    MODIFIED = "Modified",
    REJECTED = "Rejected",
    AWAITING_ANALYSIS = "Awaiting Analysis",
    RECEIVED = "Received"
}
export interface CVEDescription {
    lang: string;
    value: string;
}
export interface CVEMetrics {
    cvssMetricV31?: CVSSv31[];
    cvssMetricV30?: CVSSv30[];
    cvssMetricV2?: CVSSv2[];
}
export interface CVSSv31 {
    source: string;
    type: 'Primary' | 'Secondary';
    cvssData: {
        version: '3.1';
        vectorString: string;
        attackVector: 'NETWORK' | 'ADJACENT_NETWORK' | 'LOCAL' | 'PHYSICAL';
        attackComplexity: 'LOW' | 'HIGH';
        privilegesRequired: 'NONE' | 'LOW' | 'HIGH';
        userInteraction: 'NONE' | 'REQUIRED';
        scope: 'UNCHANGED' | 'CHANGED';
        confidentialityImpact: 'NONE' | 'LOW' | 'HIGH';
        integrityImpact: 'NONE' | 'LOW' | 'HIGH';
        availabilityImpact: 'NONE' | 'LOW' | 'HIGH';
        baseScore: number;
        baseSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
    exploitabilityScore: number;
    impactScore: number;
}
export interface CVSSv30 {
    source: string;
    type: 'Primary' | 'Secondary';
    cvssData: {
        version: '3.0';
        vectorString: string;
        baseScore: number;
        baseSeverity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    };
}
export interface CVSSv2 {
    source: string;
    type: 'Primary' | 'Secondary';
    cvssData: {
        version: '2.0';
        vectorString: string;
        baseScore: number;
    };
}
export interface CVEWeakness {
    source: string;
    type: 'Primary' | 'Secondary';
    description: CVEDescription[];
}
export interface CVEConfiguration {
    nodes: CVENode[];
    operator?: 'AND' | 'OR';
}
export interface CVENode {
    operator: 'AND' | 'OR';
    negate?: boolean;
    cpeMatch: CPEMatch[];
}
export interface CPEMatch {
    vulnerable: boolean;
    criteria: string;
    matchCriteriaId: string;
    versionStartExcluding?: string;
    versionStartIncluding?: string;
    versionEndExcluding?: string;
    versionEndIncluding?: string;
}
export interface CVEReference {
    url: string;
    source: string;
    tags?: string[];
}
export interface CVEVendorComment {
    organization: string;
    comment: string;
    lastModified: string;
}
export interface VulnerabilityAssessment {
    cveId: string;
    packageName: string;
    packageVersion: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    score: number;
    vector: string;
    runtimeRelevant: boolean;
    executionPaths: string[];
    exploitability: ExploitabilityAssessment;
    mitigation: MitigationRecommendation;
}
export interface ExploitabilityAssessment {
    isExploitable: boolean;
    exploitComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresUserInteraction: boolean;
    requiresPrivileges: boolean;
    networkAccessible: boolean;
    publicExploitAvailable: boolean;
}
export interface MitigationRecommendation {
    action: 'UPDATE' | 'PATCH' | 'WORKAROUND' | 'MONITOR';
    targetVersion?: string;
    patchUrl?: string;
    workaroundDescription?: string;
    priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedEffort: 'MINUTES' | 'HOURS' | 'DAYS' | 'WEEKS';
}
export interface SecurityScan {
    id: string;
    projectId: string;
    timestamp: number;
    scanType: 'FULL' | 'INCREMENTAL' | 'TARGETED';
    vulnerabilities: VulnerabilityAssessment[];
    summary: SecuritySummary;
    runtimeAnalysis: RuntimeSecurityAnalysis;
}
export interface SecuritySummary {
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    runtimeRelevantCount: number;
    exploitableCount: number;
}
export interface RuntimeSecurityAnalysis {
    executedPackages: string[];
    vulnerableExecutedPackages: string[];
    criticalPathVulnerabilities: VulnerabilityAssessment[];
    riskScore: number;
    recommendations: MitigationRecommendation[];
}
//# sourceMappingURL=security.types.d.ts.map