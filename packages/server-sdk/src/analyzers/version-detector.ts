// Dependency version detection and resolution
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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

export class VersionDetector {
  private projectRoot: string;
  private packageManager: 'npm' | 'yarn' | 'pnpm';

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
    this.packageManager = this.detectPackageManager();
  }

  public async analyzeVersions(): Promise<VersionAnalysis> {
    const packages = await this.getInstalledPackages();
    const outdatedInfo = await this.getOutdatedPackages();
    const vulnerabilityInfo = await this.getVulnerabilities();

    const packageInfos: VersionInfo[] = packages.map(pkg => {
      const outdated = outdatedInfo.find(o => o.name === pkg.name);
      const vulnerabilities = vulnerabilityInfo.get(pkg.name) || 0;

      return {
        name: pkg.name,
        currentVersion: pkg.version,
        latestVersion: outdated?.latest,
        wantedVersion: outdated?.wanted,
        isOutdated: !!outdated,
        securityVulnerabilities: vulnerabilities,
      };
    });

    return {
      packages: packageInfos,
      outdatedCount: packageInfos.filter(p => p.isOutdated).length,
      vulnerableCount: packageInfos.filter(p => p.securityVulnerabilities > 0).length,
      totalPackages: packageInfos.length,
    };
  }

  public async getPackageVersion(packageName: string): Promise<string | null> {
    try {
      const packageJsonPath = require.resolve(`${packageName}/package.json`);
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version || null;
    } catch {
      return null;
    }
  }

  public async checkForUpdates(packageName: string): Promise<{
    current: string;
    latest: string;
    wanted: string;
  } | null> {
    try {
      let command: string;
      
      switch (this.packageManager) {
        case 'npm':
          command = `npm view ${packageName} version`;
          break;
        case 'yarn':
          command = `yarn info ${packageName} version --json`;
          break;
        case 'pnpm':
          command = `pnpm view ${packageName} version`;
          break;
      }

      const result = execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        timeout: 10000 
      });

      const current = await this.getPackageVersion(packageName);
      if (!current) return null;

      let latest: string;
      if (this.packageManager === 'yarn') {
        const parsed = JSON.parse(result);
        latest = parsed.data;
      } else {
        latest = result.trim();
      }

      return {
        current,
        latest,
        wanted: latest, // Simplified - would need semver analysis
      };
    } catch (error) {
      return null;
    }
  }

  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
    if (fs.existsSync(path.join(this.projectRoot, 'yarn.lock'))) {
      return 'yarn';
    }
    if (fs.existsSync(path.join(this.projectRoot, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    return 'npm';
  }

  private async getInstalledPackages(): Promise<Array<{ name: string; version: string }>> {
    try {
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        return [];
      }

      const packages: Array<{ name: string; version: string }> = [];
      const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (entry.name.startsWith('@')) {
            // Scoped package
            const scopedPath = path.join(nodeModulesPath, entry.name);
            const scopedEntries = fs.readdirSync(scopedPath, { withFileTypes: true });
            
            for (const scopedEntry of scopedEntries) {
              if (scopedEntry.isDirectory()) {
                const packageName = `${entry.name}/${scopedEntry.name}`;
                const version = await this.getPackageVersion(packageName);
                if (version) {
                  packages.push({ name: packageName, version });
                }
              }
            }
          } else {
            // Regular package
            const version = await this.getPackageVersion(entry.name);
            if (version) {
              packages.push({ name: entry.name, version });
            }
          }
        }
      }

      return packages;
    } catch (error) {
      return [];
    }
  }

  private async getOutdatedPackages(): Promise<Array<{
    name: string;
    current: string;
    wanted: string;
    latest: string;
  }>> {
    try {
      let command: string;
      
      switch (this.packageManager) {
        case 'npm':
          command = 'npm outdated --json';
          break;
        case 'yarn':
          command = 'yarn outdated --json';
          break;
        case 'pnpm':
          command = 'pnpm outdated --format json';
          break;
      }

      const result = execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        timeout: 30000 
      });

      const outdated = JSON.parse(result);
      
      if (this.packageManager === 'npm') {
        return Object.entries(outdated).map(([name, info]: [string, any]) => ({
          name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
        }));
      }

      // Handle yarn/pnpm format differences
      return [];
    } catch (error) {
      // Command might fail if no outdated packages
      return [];
    }
  }

  private async getVulnerabilities(): Promise<Map<string, number>> {
    const vulnerabilities = new Map<string, number>();
    
    try {
      let command: string;
      
      switch (this.packageManager) {
        case 'npm':
          command = 'npm audit --json';
          break;
        case 'yarn':
          command = 'yarn audit --json';
          break;
        case 'pnpm':
          command = 'pnpm audit --json';
          break;
      }

      const result = execSync(command, { 
        cwd: this.projectRoot,
        encoding: 'utf8',
        timeout: 30000 
      });

      const audit = JSON.parse(result);
      
      if (this.packageManager === 'npm' && audit.vulnerabilities) {
        for (const [packageName, vulnInfo] of Object.entries(audit.vulnerabilities)) {
          vulnerabilities.set(packageName, (vulnInfo as any).severity ? 1 : 0);
        }
      }

      return vulnerabilities;
    } catch (error) {
      // Audit might fail or have no vulnerabilities
      return vulnerabilities;
    }
  }
}
