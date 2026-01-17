// Package.json analysis and dependency extraction
import * as fs from 'fs';
import * as path from 'path';
import { PackageInfo, PackageDependency, DependencyType } from '@tracelens/shared';

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

export class PackageScanner {
  private packageJsonPath: string;
  private lockfilePath: string;

  constructor(projectRoot?: string) {
    const root = projectRoot || process.cwd();
    this.packageJsonPath = this.findPackageJson(root);
    this.lockfilePath = this.findLockfile(path.dirname(this.packageJsonPath));
  }

  public async analyze(): Promise<PackageAnalysis> {
    const packageInfo = await this.loadPackageInfo();
    const dependencies = this.extractDependencies(packageInfo);
    
    return {
      packageInfo,
      dependencies,
      dependencyCount: this.countDependencies(dependencies),
      securityIssues: [], // Would integrate with npm audit
      outdatedPackages: [], // Would integrate with npm outdated
    };
  }

  public async getDependencyTree(): Promise<any> {
    // Simplified dependency tree - would need more sophisticated analysis
    const packageInfo = await this.loadPackageInfo();
    
    return {
      name: packageInfo.name,
      version: packageInfo.version,
      dependencies: this.buildDependencyTree(packageInfo),
    };
  }

  public async checkForVulnerabilities(): Promise<string[]> {
    // Placeholder for security vulnerability checking
    // Would integrate with npm audit or similar tools
    return [];
  }

  private findPackageJson(startDir: string): string {
    let currentDir = startDir;
    
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        return packageJsonPath;
      }
      currentDir = path.dirname(currentDir);
    }
    
    throw new Error('package.json not found');
  }

  private findLockfile(dir: string): string {
    const lockfiles = [
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ];

    for (const lockfile of lockfiles) {
      const lockfilePath = path.join(dir, lockfile);
      if (fs.existsSync(lockfilePath)) {
        return lockfilePath;
      }
    }

    return '';
  }

  private async loadPackageInfo(): Promise<PackageInfo> {
    try {
      const content = fs.readFileSync(this.packageJsonPath, 'utf8');
      const packageJson = JSON.parse(content);
      
      return {
        name: packageJson.name || 'unknown',
        version: packageJson.version || '0.0.0',
        description: packageJson.description,
        main: packageJson.main,
        scripts: packageJson.scripts || {},
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        peerDependencies: packageJson.peerDependencies || {},
        optionalDependencies: packageJson.optionalDependencies || {},
        bundledDependencies: packageJson.bundledDependencies || [],
      };
    } catch (error: unknown) {
      throw new Error(`Failed to load package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractDependencies(packageInfo: PackageInfo): PackageDependency[] {
    const dependencies: PackageDependency[] = [];
    
    // Production dependencies
    for (const [name, version] of Object.entries(packageInfo.dependencies || {})) {
      dependencies.push({
        name,
        version,
        type: DependencyType.PRODUCTION,
        dev: false,
      });
    }

    // Development dependencies
    for (const [name, version] of Object.entries(packageInfo.devDependencies || {})) {
      dependencies.push({
        name,
        version,
        type: DependencyType.DEVELOPMENT,
        dev: true,
      });
    }

    // Peer dependencies
    for (const [name, version] of Object.entries(packageInfo.peerDependencies || {})) {
      dependencies.push({
        name,
        version,
        type: DependencyType.PEER,
        dev: false,
      });
    }

    // Optional dependencies
    for (const [name, version] of Object.entries(packageInfo.optionalDependencies || {})) {
      dependencies.push({
        name,
        version,
        type: DependencyType.OPTIONAL,
        optional: true,
      });
    }

    return dependencies;
  }

  private countDependencies(dependencies: PackageDependency[]) {
    return dependencies.reduce(
      (counts, dep) => {
        switch (dep.type) {
          case DependencyType.PRODUCTION:
            counts.production++;
            break;
          case DependencyType.DEVELOPMENT:
            counts.development++;
            break;
          case DependencyType.PEER:
            counts.peer++;
            break;
          case DependencyType.OPTIONAL:
            counts.optional++;
            break;
        }
        return counts;
      },
      { production: 0, development: 0, peer: 0, optional: 0 }
    );
  }

  private buildDependencyTree(packageInfo: PackageInfo): any {
    // Simplified tree building - would need recursive resolution
    const tree: any = {};
    
    for (const [name, version] of Object.entries(packageInfo.dependencies || {})) {
      tree[name] = {
        version,
        resolved: this.resolvePackageVersion(name),
        dependencies: {}, // Would recursively build
      };
    }
    
    return tree;
  }

  private resolvePackageVersion(packageName: string): string {
    try {
      const packagePath = require.resolve(`${packageName}/package.json`);
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }
}
