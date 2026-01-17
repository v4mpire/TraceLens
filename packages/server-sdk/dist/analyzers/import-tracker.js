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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalImportTracker = exports.ImportTracker = void 0;
// Runtime import tracking and module analysis
const Module = __importStar(require("module"));
const path = __importStar(require("path"));
class ImportTracker {
    constructor() {
        this.imports = [];
        this.moduleCount = new Map();
        this.isTracking = false;
    }
    startTracking() {
        if (this.isTracking)
            return;
        this.originalRequire = Module.prototype.require;
        const self = this;
        Module.prototype.require = function (id) {
            const startTime = process.hrtime.bigint();
            try {
                const result = self.originalRequire.call(this, id);
                const endTime = process.hrtime.bigint();
                const loadTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
                self.recordImport(id, this.filename || '', loadTime);
                return result;
            }
            catch (error) {
                throw error;
            }
        };
        this.isTracking = true;
    }
    stopTracking() {
        if (!this.isTracking)
            return;
        Module.prototype.require = this.originalRequire;
        this.isTracking = false;
    }
    getMetrics() {
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
    getImportsByModule(moduleName) {
        return this.imports.filter(imp => imp.moduleName === moduleName);
    }
    getImportHistory() {
        return [...this.imports];
    }
    clearHistory() {
        this.imports = [];
        this.moduleCount.clear();
    }
    recordImport(id, caller, loadTime) {
        const moduleName = this.normalizeModuleName(id);
        const isNative = this.isNativeModule(id);
        const isNodeModule = this.isNodeModuleImport(id);
        const importEvent = {
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
    normalizeModuleName(id) {
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
    isNativeModule(id) {
        const nativeModules = [
            'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'querystring',
            'stream', 'util', 'events', 'buffer', 'child_process', 'cluster',
            'dgram', 'dns', 'net', 'readline', 'repl', 'tls', 'tty', 'vm',
            'zlib', 'assert', 'constants', 'domain', 'punycode', 'string_decoder',
            'timers', 'v8', 'worker_threads'
        ];
        return nativeModules.includes(id) || id.startsWith('node:');
    }
    isNodeModuleImport(id) {
        return !id.startsWith('./') &&
            !id.startsWith('../') &&
            !path.isAbsolute(id) &&
            !this.isNativeModule(id);
    }
}
exports.ImportTracker = ImportTracker;
// Singleton instance for global import tracking
exports.globalImportTracker = new ImportTracker();
