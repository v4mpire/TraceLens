// Runtime risk assessment and execution path mapping
import type { DependencyGraph } from '@tracelens/shared';
import { VulnerabilityMatch } from '../vulnerability-matcher';

export interface RuntimeRisk {
  cveId: string;
  packageName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  runtimeExposure: boolean;
  executionPaths: string[];
  impactScore: number; // 0-100
  riskLevel: 'THEORETICAL' | 'POSSIBLE' | 'LIKELY' | 'ACTIVE';
  recommendations: string[];
}

export interface ExecutionContext {
  traceId: string;
  spanIds: string[];
  operationNames: string[];
  frequency: number;
  lastSeen: Date;
}

export class RuntimeRiskCalculator {
  public calculateRuntimeRisk(
    vulnerabilities: VulnerabilityMatch[],
    dependencyGraph: DependencyGraph,
    executionHistory: ExecutionContext[] = []
  ): RuntimeRisk[] {
    const risks: RuntimeRisk[] = [];

    for (const vuln of vulnerabilities) {
      const risk = this.assessVulnerabilityRisk(vuln, dependencyGraph, executionHistory);
      risks.push(risk);
    }

    // Sort by impact score (highest first)
    return risks.sort((a, b) => b.impactScore - a.impactScore);
  }

  private assessVulnerabilityRisk(
    vulnerability: VulnerabilityMatch,
    graph: DependencyGraph,
    executionHistory: ExecutionContext[]
  ): RuntimeRisk {
    // Find execution paths that use this dependency
    const executionPaths = this.findExecutionPaths(vulnerability.packageName, graph);
    
    // Check if dependency is actually executed in runtime
    const runtimeExposure = this.checkRuntimeExposure(vulnerability.packageName, executionHistory);
    
    // Calculate impact score
    const impactScore = this.calculateImpactScore(vulnerability, executionPaths, runtimeExposure);
    
    // Determine risk level
    const riskLevel = this.determineRiskLevel(vulnerability, runtimeExposure, executionPaths.length);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(vulnerability, riskLevel, executionPaths);

    return {
      cveId: vulnerability.cveId,
      packageName: vulnerability.packageName,
      severity: vulnerability.severity,
      runtimeExposure,
      executionPaths,
      impactScore,
      riskLevel,
      recommendations
    };
  }

  private findExecutionPaths(packageName: string, graph: DependencyGraph): string[] {
    const paths: string[] = [];
    
    // Search through dependencies for the package
    for (const [depName, dependency] of graph.dependencies) {
      if (depName === packageName || depName.includes(packageName)) {
        // Create a simple path representation
        paths.push(`${graph.rootPackage.name} → ${depName}@${dependency.version}`);
      }
    }
    
    return paths;
  }

  private nodeReferencesPackage(node: any, packageName: string): boolean {
    // Simplified check for package references
    return false;
  }

  private findPathToNode(graph: DependencyGraph, targetNodeId: string): string[] {
    // Simplified path finding - return empty array
    return [];
  }

  private checkRuntimeExposure(packageName: string, executionHistory: ExecutionContext[]): boolean {
    // Check if package appears in recent execution traces
    const recentThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    
    return executionHistory.some(context => 
      context.lastSeen > recentThreshold &&
      context.operationNames.some(name => 
        name.toLowerCase().includes(packageName.toLowerCase())
      )
    );
  }

  private calculateImpactScore(
    vulnerability: VulnerabilityMatch,
    executionPaths: string[],
    runtimeExposure: boolean
  ): number {
    let score = 0;

    // Base score from CVSS
    score += vulnerability.score * 10; // 0-100 scale

    // Runtime exposure multiplier
    if (runtimeExposure) {
      score *= 1.5;
    }

    // Execution path multiplier
    if (executionPaths.length > 0) {
      score *= (1 + Math.min(executionPaths.length * 0.1, 0.5));
    }

    // Severity multiplier
    const severityMultipliers = {
      'CRITICAL': 1.0,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.4
    };
    score *= severityMultipliers[vulnerability.severity];

    // Match confidence factor
    score *= vulnerability.matchConfidence;

    return Math.min(Math.round(score), 100);
  }

  private determineRiskLevel(
    vulnerability: VulnerabilityMatch,
    runtimeExposure: boolean,
    pathCount: number
  ): 'THEORETICAL' | 'POSSIBLE' | 'LIKELY' | 'ACTIVE' {
    if (!runtimeExposure && pathCount === 0) {
      return 'THEORETICAL';
    }

    if (runtimeExposure && pathCount === 0) {
      return 'POSSIBLE';
    }

    if (pathCount > 0 && !runtimeExposure) {
      return 'POSSIBLE';
    }

    if (runtimeExposure && pathCount > 0) {
      return vulnerability.severity === 'CRITICAL' || vulnerability.severity === 'HIGH' 
        ? 'ACTIVE' 
        : 'LIKELY';
    }

    return 'THEORETICAL';
  }

  private generateRecommendations(
    vulnerability: VulnerabilityMatch,
    riskLevel: string,
    executionPaths: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Version-based recommendations
    if (vulnerability.fixedVersions.length > 0) {
      const latestFix = vulnerability.fixedVersions[vulnerability.fixedVersions.length - 1];
      recommendations.push(`Update ${vulnerability.packageName} to version ${latestFix} or later`);
    } else {
      recommendations.push(`Monitor ${vulnerability.packageName} for security updates`);
    }

    // Risk-level specific recommendations
    switch (riskLevel) {
      case 'ACTIVE':
        recommendations.push('URGENT: This vulnerability is actively exploitable in your runtime');
        recommendations.push('Consider temporarily disabling affected functionality if possible');
        break;
      case 'LIKELY':
        recommendations.push('HIGH PRIORITY: This vulnerability affects runtime execution paths');
        recommendations.push('Plan immediate update or mitigation');
        break;
      case 'POSSIBLE':
        recommendations.push('MEDIUM PRIORITY: Potential runtime exposure detected');
        recommendations.push('Include in next maintenance cycle');
        break;
      case 'THEORETICAL':
        recommendations.push('LOW PRIORITY: No runtime exposure detected');
        recommendations.push('Update during regular dependency maintenance');
        break;
    }

    // Execution path specific recommendations
    if (executionPaths.length > 0) {
      recommendations.push(`Review execution paths: ${executionPaths.slice(0, 2).join(', ')}`);
      if (executionPaths.length > 2) {
        recommendations.push(`And ${executionPaths.length - 2} other execution paths`);
      }
    }

    // Severity-specific recommendations
    if (vulnerability.severity === 'CRITICAL') {
      recommendations.push('Consider implementing additional security controls');
      recommendations.push('Monitor for exploitation attempts');
    }

    return recommendations.slice(0, 6); // Limit to top 6 recommendations
  }
}
