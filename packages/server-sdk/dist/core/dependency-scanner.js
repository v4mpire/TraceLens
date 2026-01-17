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
exports.DependencyScanner = void 0;
// Runtime dependency detection and analysis
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const shared_1 = require("@tracelens/shared");
class DependencyScanner {
    constructor(config) {
        this.runtimeDependencies = new Map();
        this.packageInfo = null;
        this.scanInterval = null;
        this.config = config;
        this.packageJsonPath = this.findPackageJson();
        this.lockfilePath = this.findLockfile();
    }
    async initialize() {
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
        }
        catch (error) {
            console.error('Failed to initialize dependency scanner:', error);
        }
    }
    shutdown() {
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
    }
    getSnapshot() {
        const dependencies = this.extractDependencies();
        const runtimeDeps = Array.from(this.runtimeDependencies.values());
        return {
            id: this.generateId(),
            projectId: this.config.serviceName,
            timestamp: Date.now(),
            environment: this.config.environment,
            nodeVersion: process.version,
            packageManager: this.detectPackageManager(),
            dependencies,
            runtimeDependencies: runtimeDeps,
            totalSize: this.calculateTotalSize(dependencies),
        };
    }
    findPackageJson() {
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
    findLockfile() {
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
    async loadPackageInfo() {
        try {
            if (fs.existsSync(this.packageJsonPath)) {
                const content = fs.readFileSync(this.packageJsonPath, 'utf8');
                this.packageInfo = JSON.parse(content);
            }
        }
        catch (error) {
            if (this.config.debug) {
                console.warn('Failed to load package.json:', error);
            }
        }
    }
    hookRequire() {
        const originalRequire = require.extensions['.js'];
        const self = this;
        require.extensions['.js'] = function (module, filename) {
            const startTime = process.hrtime.bigint();
            try {
                const result = originalRequire?.call(this, module, filename);
                const endTime = process.hrtime.bigint();
                const loadTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
                // Track runtime dependency
                self.trackRuntimeDependency(filename, loadTime);
                return result;
            }
            catch (error) {
                throw error;
            }
        };
    }
    trackRuntimeDependency(filename, loadTime) {
        try {
            // Extract package name from filename
            const packageName = this.extractPackageName(filename);
            if (!packageName || packageName.startsWith('.'))
                return;
            const existing = this.runtimeDependencies.get(packageName);
            if (existing) {
                existing.loadTime += loadTime;
                existing.executionTime += loadTime;
            }
            else {
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
        }
        catch (error) {
            // Silently ignore tracking errors
        }
    }
    extractPackageName(filename) {
        const nodeModulesIndex = filename.indexOf('node_modules');
        if (nodeModulesIndex === -1)
            return '';
        const afterNodeModules = filename.substring(nodeModulesIndex + 'node_modules'.length + 1);
        const parts = afterNodeModules.split(path.sep);
        if (parts[0] && parts[0].startsWith('@')) {
            return `${parts[0]}/${parts[1] || ''}`;
        }
        return parts[0] || 'unknown';
    }
    getPackageVersion(packageName) {
        try {
            const packagePath = require.resolve(`${packageName}/package.json`);
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageJson.version || '0.0.0';
        }
        catch {
            return '0.0.0';
        }
    }
    extractDependencies() {
        if (!this.packageInfo)
            return [];
        const dependencies = [];
        // Production dependencies
        if (this.packageInfo.dependencies) {
            for (const [name, version] of Object.entries(this.packageInfo.dependencies)) {
                dependencies.push({
                    name,
                    version: version,
                    type: shared_1.DependencyType.PRODUCTION,
                    dev: false,
                });
            }
        }
        // Development dependencies
        if (this.packageInfo.devDependencies) {
            for (const [name, version] of Object.entries(this.packageInfo.devDependencies)) {
                dependencies.push({
                    name,
                    version: version,
                    type: shared_1.DependencyType.DEVELOPMENT,
                    dev: true,
                });
            }
        }
        return dependencies;
    }
    detectPackageManager() {
        if (this.lockfilePath.includes('yarn.lock'))
            return 'yarn';
        if (this.lockfilePath.includes('pnpm-lock.yaml'))
            return 'pnpm';
        return 'npm';
    }
    calculateTotalSize(dependencies) {
        // Simplified size calculation - would need actual file system analysis
        return dependencies.length * 1024; // Placeholder
    }
    scanRuntimeDependencies() {
        // Periodic scan for memory usage updates
        for (const [name, dep] of this.runtimeDependencies) {
            // Update memory usage if possible
            // This would require more sophisticated memory tracking
        }
    }
    generateId() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }
}
exports.DependencyScanner = DependencyScanner;
