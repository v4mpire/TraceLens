// Main security scanner orchestrating CVE analysis
import { CVEFetcher, CVEData } from './cve-fetcher';
import { VulnerabilityMatcher, VulnerabilityMatch, RuntimeDependency } from './vulnerability-matcher';
import { RuntimeRiskCalculator, RuntimeRisk, ExecutionContext } from './analyzers/risk-calculator';
import { CVEUpdateScheduler } from './schedulers/cve-updater';
import { DependencyGraph } from '@tracelens/analysis-engine';

export interface SecurityScanResult {
  scanId: string;
  timestamp: Date;
  dependenciesScanned: number;
  vulnerabilitiesFound: number;
  runtimeRisks: RuntimeRisk[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    activeRisks: number;
    theoreticalRisks: number;
  };
  processingTime: number;
}

export interface ScanOptions {
  includeTheoretical?: boolean;
  minSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  maxResults?: number;
}

export class SecurityScanner {
  private cveFetcher: CVEFetcher;
  private vulnerabilityMatcher: VulnerabilityMatcher;
  private riskCalculator: RuntimeRiskCalculator;
  private updateScheduler?: CVEUpdateScheduler;
  private cveCache: Map<string, CVEData> = new Map();

  constructor(nvdApiKey?: string) {
    this.cveFetcher = new CVEFetcher(nvdApiKey);
    this.vulnerabilityMatcher = new VulnerabilityMatcher();
    this.riskCalculator = new RuntimeRiskCalculator();
  }

  public async scanDependencies(
    dependencies: RuntimeDependency[],
    dependencyGraph?: DependencyGraph,
    executionHistory?: ExecutionContext[],
    options: ScanOptions = {}
  ): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`Starting security scan ${scanId} for ${dependencies.length} dependencies`);

    // Get recent CVEs (use cache if available)
    const cves = await this.getRecentCVEs();
    
    // Match vulnerabilities
    const vulnerabilities = this.vulnerabilityMatcher.matchVulnerabilities(dependencies, cves);
    
    // Calculate runtime risks
    const runtimeRisks = dependencyGraph 
      ? this.riskCalculator.calculateRuntimeRisk(vulnerabilities, dependencyGraph, executionHistory)
      : this.convertToBasicRisks(vulnerabilities);

    // Apply filters
    const filteredRisks = this.applyFilters(runtimeRisks, options);

    // Generate summary
    const summary = this.generateSummary(filteredRisks);

    const processingTime = Date.now() - startTime;

    console.log(`Security scan ${scanId} completed in ${processingTime}ms: ${filteredRisks.length} risks found`);

    return {
      scanId,
      timestamp: new Date(),
      dependenciesScanned: dependencies.length,
      vulnerabilitiesFound: vulnerabilities.length,
      runtimeRisks: filteredRisks,
      summary,
      processingTime
    };
  }

  public startPeriodicUpdates(onUpdate?: (cves: CVEData[]) => Promise<void>): void {
    if (this.updateScheduler) {
      console.warn('CVE update scheduler is already running');
      return;
    }

    this.updateScheduler = new CVEUpdateScheduler(this.cveFetcher, {
      updateInterval: 6 * 60 * 60 * 1000, // 6 hours
      onUpdate: async (cves: CVEData[]) => {
        // Update cache
        for (const cve of cves) {
          this.cveCache.set(cve.id, cve);
        }
        
        console.log(`Updated CVE cache with ${cves.length} new/modified CVEs`);
        
        if (onUpdate) {
          await onUpdate(cves);
        }
      },
      onError: (error) => {
        console.error('CVE update error:', error);
      }
    });

    this.updateScheduler.start();
  }

  public stopPeriodicUpdates(): void {
    if (this.updateScheduler) {
      this.updateScheduler.stop();
      this.updateScheduler = undefined;
    }
  }

  public getUpdateStatus() {
    return this.updateScheduler?.getStatus() || { isRunning: false };
  }

  private async getRecentCVEs(): Promise<CVEData[]> {
    // Try to use cached CVEs first
    if (this.cveCache.size > 0) {
      const recentThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      const recentCVEs = Array.from(this.cveCache.values())
        .filter(cve => new Date(cve.modified) > recentThreshold);
      
      if (recentCVEs.length > 0) {
        return recentCVEs;
      }
    }

    // Fetch fresh CVEs
    const cves = await this.cveFetcher.fetchRecentCVEs({
      modifiedSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      maxResults: 5000
    });

    // Update cache
    for (const cve of cves) {
      this.cveCache.set(cve.id, cve);
    }

    return cves;
  }

  private convertToBasicRisks(vulnerabilities: VulnerabilityMatch[]): RuntimeRisk[] {
    return vulnerabilities.map(vuln => ({
      cveId: vuln.cveId,
      packageName: vuln.packageName,
      severity: vuln.severity,
      runtimeExposure: false, // Unknown without graph analysis
      executionPaths: [],
      impactScore: vuln.score * 10 * vuln.matchConfidence,
      riskLevel: 'THEORETICAL' as const,
      recommendations: [
        `Update ${vuln.packageName} to a fixed version`,
        'Monitor for security updates',
        'Review dependency usage in codebase'
      ]
    }));
  }

  private applyFilters(risks: RuntimeRisk[], options: ScanOptions): RuntimeRisk[] {
    let filtered = risks;

    // Filter by theoretical risks
    if (!options.includeTheoretical) {
      filtered = filtered.filter(risk => risk.riskLevel !== 'THEORETICAL');
    }

    // Filter by minimum severity
    if (options.minSeverity) {
      const severityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
      const minLevel = severityOrder[options.minSeverity];
      filtered = filtered.filter(risk => severityOrder[risk.severity] >= minLevel);
    }

    // Limit results
    if (options.maxResults) {
      filtered = filtered.slice(0, options.maxResults);
    }

    return filtered;
  }

  private generateSummary(risks: RuntimeRisk[]) {
    const summary = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      activeRisks: 0,
      theoreticalRisks: 0
    };

    for (const risk of risks) {
      // Count by severity
      switch (risk.severity) {
        case 'CRITICAL': summary.critical++; break;
        case 'HIGH': summary.high++; break;
        case 'MEDIUM': summary.medium++; break;
        case 'LOW': summary.low++; break;
      }

      // Count by risk level
      if (risk.riskLevel === 'ACTIVE' || risk.riskLevel === 'LIKELY') {
        summary.activeRisks++;
      } else if (risk.riskLevel === 'THEORETICAL') {
        summary.theoreticalRisks++;
      }
    }

    return summary;
  }

  public getCacheStats() {
    return {
      cveCount: this.cveCache.size,
      oldestCVE: this.cveCache.size > 0 
        ? Math.min(...Array.from(this.cveCache.values()).map(cve => new Date(cve.published).getTime()))
        : null,
      newestCVE: this.cveCache.size > 0
        ? Math.max(...Array.from(this.cveCache.values()).map(cve => new Date(cve.modified).getTime()))
        : null
    };
  }
}

// Export all types and classes
export * from './cve-fetcher';
export * from './vulnerability-matcher';
export * from './analyzers/risk-calculator';
export * from './schedulers/cve-updater';
