"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanner = void 0;
// Main security scanner orchestrating CVE analysis
const cve_fetcher_1 = require("./cve-fetcher");
const vulnerability_matcher_1 = require("./vulnerability-matcher");
const risk_calculator_1 = require("./analyzers/risk-calculator");
const cve_updater_1 = require("./schedulers/cve-updater");
class SecurityScanner {
    constructor(nvdApiKey) {
        this.cveCache = new Map();
        this.cveFetcher = new cve_fetcher_1.CVEFetcher(nvdApiKey);
        this.vulnerabilityMatcher = new vulnerability_matcher_1.VulnerabilityMatcher();
        this.riskCalculator = new risk_calculator_1.RuntimeRiskCalculator();
    }
    async scanDependencies(dependencies, dependencyGraph, executionHistory, options = {}) {
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
    startPeriodicUpdates(onUpdate) {
        if (this.updateScheduler) {
            console.warn('CVE update scheduler is already running');
            return;
        }
        this.updateScheduler = new cve_updater_1.CVEUpdateScheduler(this.cveFetcher, {
            updateInterval: 6 * 60 * 60 * 1000, // 6 hours
            onUpdate: async (cves) => {
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
    stopPeriodicUpdates() {
        if (this.updateScheduler) {
            this.updateScheduler.stop();
            this.updateScheduler = undefined;
        }
    }
    getUpdateStatus() {
        return this.updateScheduler?.getStatus() || { isRunning: false };
    }
    async getRecentCVEs() {
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
    convertToBasicRisks(vulnerabilities) {
        return vulnerabilities.map(vuln => ({
            cveId: vuln.cveId,
            packageName: vuln.packageName,
            severity: vuln.severity,
            runtimeExposure: false, // Unknown without graph analysis
            executionPaths: [],
            impactScore: vuln.score * 10 * vuln.matchConfidence,
            riskLevel: 'THEORETICAL',
            recommendations: [
                `Update ${vuln.packageName} to a fixed version`,
                'Monitor for security updates',
                'Review dependency usage in codebase'
            ]
        }));
    }
    applyFilters(risks, options) {
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
    generateSummary(risks) {
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
                case 'CRITICAL':
                    summary.critical++;
                    break;
                case 'HIGH':
                    summary.high++;
                    break;
                case 'MEDIUM':
                    summary.medium++;
                    break;
                case 'LOW':
                    summary.low++;
                    break;
            }
            // Count by risk level
            if (risk.riskLevel === 'ACTIVE' || risk.riskLevel === 'LIKELY') {
                summary.activeRisks++;
            }
            else if (risk.riskLevel === 'THEORETICAL') {
                summary.theoreticalRisks++;
            }
        }
        return summary;
    }
    getCacheStats() {
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
exports.SecurityScanner = SecurityScanner;
// Export all types and classes
__exportStar(require("./cve-fetcher"), exports);
__exportStar(require("./vulnerability-matcher"), exports);
__exportStar(require("./analyzers/risk-calculator"), exports);
__exportStar(require("./schedulers/cve-updater"), exports);
