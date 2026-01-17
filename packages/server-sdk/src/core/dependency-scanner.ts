// Runtime dependency detection and analysis
import * as fs from 'fs';
import * as path from 'path';
import { DependencySnapshot, PackageDependency, RuntimeDependency, DependencyType } from '@tracelens/shared';
import { ServerSDKConfig } from './tracer';

export class DependencyScanner {
  private config: ServerSDKConfig;
  private packageJsonPath: string;
  private lockfilePath: string;
  private runtimeDependencies = new Map<string, RuntimeDependency>();
  private packageInfo: any = null;
  private scanInterval: NodeJS.Timeout | null = null;

  constructor(config: ServerSDKConfig) {
    this.config = config;
    this.packageJsonPath = this.findPackageJson();
    this.lockfilePath = this.findLockfile();
  }

  public async initialize(): Promise<void> {
    try {
      // Load package.json
      await this.loadPackageInfo();
      
      // Hook into require to track runtime dependencies
      this.hookRequire();

      // Start periodic scanning if in debug mode
      if (this.config.debug) {
        this.scanInterval = setInterval(() => {
          this.scanRuntimeDependencies();
        }, 30000); // Scan every 30 seconds
      }

      if (this.config.debug) {
        console.log('Dependency scanner initialized');
      }
    } catch (error) {
      console.error('Failed to initialize dependency scanner:', error);
    }
  }

  public shutdown(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  public getSnapshot(): DependencySnapshot {
    const dependencies = this.extractDependencies();
    const runtimeDeps = Array.from(this.runtimeDependencies.values());

    return {
      id: this.generateId(),
      projectId: this.config.serviceName,
      timestamp: Date.now(),
      environment: this.config.environment as any,
      nodeVersion: process.version,
      packageManager: this.detectPackageManager(),
      dependencies,
      runtimeDependencies: runtimeDeps,
      totalSize: this.calculateTotalSize(dependencies),
    };
  }

  private findPackageJson(): string {
    let currentDir = process.cwd();
    
    while (currentDir !== path.dirname(currentDir)) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        return packageJsonPath;
      }
      currentDir = path.dirname(currentDir);
    }
    
    return path.join(process.cwd(), 'package.json');
  }

  private findLockfile(): string {
    const dir = path.dirname(this.packageJsonPath);
    
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

  private async loadPackageInfo(): Promise<void> {
    try {
      if (fs.existsSync(this.packageJsonPath)) {
        const content = fs.readFileSync(this.packageJsonPath, 'utf8');
        this.packageInfo = JSON.parse(content);
      }
    } catch (error) {
      if (this.config.debug) {
        console.warn('Failed to load package.json:', error);
      }
    }
  }

  private hookRequire(): void {
    const originalRequire = require.extensions['.js'];
    const self = this;

    require.extensions['.js'] = function(module: any, filename: string) {
      const startTime = process.hrtime.bigint();
      
      try {
        const result = originalRequire?.call(this, module, filename);
        
        const endTime = process.hrtime.bigint();
        const loadTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Track runtime dependency
        self.trackRuntimeDependency(filename, loadTime);
        
        return result;
      } catch (error) {
        throw error;
      }
    };
  }

  private trackRuntimeDependency(filename: string, loadTime: number): void {
    try {
      // Extract package name from filename
      const packageName = this.extractPackageName(filename);
      if (!packageName || packageName.startsWith('.')) return;

      const existing = this.runtimeDependencies.get(packageName);
      
      if (existing) {
        existing.loadTime += loadTime;
        existing.executionTime += loadTime;
      } else {
        this.runtimeDependencies.set(packageName, {
          name: packageName,
          version: this.getPackageVersion(packageName) || '0.0.0',
          loadTime,
          executionTime: loadTime,
          memoryUsage: 0, // Would need more complex tracking
          importPath: filename,
          isEsm: false, // Simplified for now
          exports: [], // Would need module introspection
        });
      }
    } catch (error) {
      // Silently ignore tracking errors
    }
  }

  private extractPackageName(filename: string): string {
    const nodeModulesIndex = filename.indexOf('node_modules');
    if (nodeModulesIndex === -1) return '';

    const afterNodeModules = filename.substring(nodeModulesIndex + 'node_modules'.length + 1);
    const parts = afterNodeModules.split(path.sep);
    
    if (parts[0] && parts[0].startsWith('@')) {
      return `${parts[0]}/${parts[1] || ''}`;
    }
    
    return parts[0] || 'unknown';
  }

  private getPackageVersion(packageName: string): string {
    try {
      const packagePath = require.resolve(`${packageName}/package.json`);
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      return packageJson.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }

  private extractDependencies(): PackageDependency[] {
    if (!this.packageInfo) return [];

    const dependencies: PackageDependency[] = [];
    
    // Production dependencies
    if (this.packageInfo.dependencies) {
      for (const [name, version] of Object.entries(this.packageInfo.dependencies)) {
        dependencies.push({
          name,
          version: version as string,
          type: DependencyType.PRODUCTION,
          dev: false,
        });
      }
    }

    // Development dependencies
    if (this.packageInfo.devDependencies) {
      for (const [name, version] of Object.entries(this.packageInfo.devDependencies)) {
        dependencies.push({
          name,
          version: version as string,
          type: DependencyType.DEVELOPMENT,
          dev: true,
        });
      }
    }

    return dependencies;
  }

  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
    if (this.lockfilePath.includes('yarn.lock')) return 'yarn';
    if (this.lockfilePath.includes('pnpm-lock.yaml')) return 'pnpm';
    return 'npm';
  }

  private calculateTotalSize(dependencies: PackageDependency[]): number {
    // Simplified size calculation - would need actual file system analysis
    return dependencies.length * 1024; // Placeholder
  }

  private scanRuntimeDependencies(): void {
    // Periodic scan for memory usage updates
    for (const [name, dep] of this.runtimeDependencies) {
      // Update memory usage if possible
      // This would require more sophisticated memory tracking
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
