// Runtime import tracking and module analysis
import * as Module from 'module';
import * as path from 'path';

export interface ImportEvent {
  moduleName: string;
  importPath: string;
  timestamp: number;
  loadTime: number;
  caller?: string;
  isNative: boolean;
  isNodeModule: boolean;
}

export interface ImportMetrics {
  totalImports: number;
  uniqueModules: number;
  totalLoadTime: number;
  averageLoadTime: number;
  slowestImports: ImportEvent[];
  mostImported: Array<{ module: string; count: number }>;
}

export class ImportTracker {
  private imports: ImportEvent[] = [];
  private moduleCount = new Map<string, number>();
  private originalRequire: any;
  private isTracking = false;

  public startTracking(): void {
    if (this.isTracking) return;

    this.originalRequire = Module.prototype.require;
    const self = this;

    Module.prototype.require = function(id: string) {
      const startTime = process.hrtime.bigint();
      
      try {
        const result = self.originalRequire.call(this, id);
        const endTime = process.hrtime.bigint();
        const loadTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        self.recordImport(id, this.filename || '', loadTime);
        
        return result;
      } catch (error) {
        throw error;
      }
    };

    this.isTracking = true;
  }

  public stopTracking(): void {
    if (!this.isTracking) return;

    Module.prototype.require = this.originalRequire;
    this.isTracking = false;
  }

  public getMetrics(): ImportMetrics {
    const totalLoadTime = this.imports.reduce((sum, imp) => sum + imp.loadTime, 0);
    const uniqueModules = new Set(this.imports.map(imp => imp.moduleName)).size;
    
    // Get slowest imports (top 10)
    const slowestImports = [...this.imports]
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 10);

    // Get most imported modules
    const mostImported = Array.from(this.moduleCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([module, count]) => ({ module, count }));

    return {
      totalImports: this.imports.length,
      uniqueModules,
      totalLoadTime,
      averageLoadTime: this.imports.length > 0 ? totalLoadTime / this.imports.length : 0,
      slowestImports,
      mostImported,
    };
  }

  public getImportsByModule(moduleName: string): ImportEvent[] {
    return this.imports.filter(imp => imp.moduleName === moduleName);
  }

  public getImportHistory(): ImportEvent[] {
    return [...this.imports];
  }

  public clearHistory(): void {
    this.imports = [];
    this.moduleCount.clear();
  }

  private recordImport(id: string, caller: string, loadTime: number): void {
    const moduleName = this.normalizeModuleName(id);
    const isNative = this.isNativeModule(id);
    const isNodeModule = this.isNodeModuleImport(id);

    const importEvent: ImportEvent = {
      moduleName,
      importPath: id,
      timestamp: Date.now(),
      loadTime,
      caller: caller || 'unknown',
      isNative,
      isNodeModule,
    };

    this.imports.push(importEvent);
    
    // Update module count
    const currentCount = this.moduleCount.get(moduleName) || 0;
    this.moduleCount.set(moduleName, currentCount + 1);
  }

  private normalizeModuleName(id: string): string {
    // Handle relative imports
    if (id.startsWith('./') || id.startsWith('../')) {
      return path.basename(id, path.extname(id));
    }

    // Handle scoped packages
    if (id.startsWith('@')) {
      const parts = id.split('/');
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : id;
    }

    // Handle regular packages
    const parts = id.split('/');
    return parts[0] || id;
  }

  private isNativeModule(id: string): boolean {
    const nativeModules = [
      'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'querystring',
      'stream', 'util', 'events', 'buffer', 'child_process', 'cluster',
      'dgram', 'dns', 'net', 'readline', 'repl', 'tls', 'tty', 'vm',
      'zlib', 'assert', 'constants', 'domain', 'punycode', 'string_decoder',
      'timers', 'v8', 'worker_threads'
    ];

    return nativeModules.includes(id) || id.startsWith('node:');
  }

  private isNodeModuleImport(id: string): boolean {
    return !id.startsWith('./') && 
           !id.startsWith('../') && 
           !path.isAbsolute(id) &&
           !this.isNativeModule(id);
  }
}

// Singleton instance for global import tracking
export const globalImportTracker = new ImportTracker();
