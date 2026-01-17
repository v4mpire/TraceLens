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
exports.PackageScanner = void 0;
// Package.json analysis and dependency extraction
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const shared_1 = require("@tracelens/shared");
class PackageScanner {
    constructor(projectRoot) {
        const root = projectRoot || process.cwd();
        this.packageJsonPath = this.findPackageJson(root);
        this.lockfilePath = this.findLockfile(path.dirname(this.packageJsonPath));
    }
    async analyze() {
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
    async getDependencyTree() {
        // Simplified dependency tree - would need more sophisticated analysis
        const packageInfo = await this.loadPackageInfo();
        return {
            name: packageInfo.name,
            version: packageInfo.version,
            dependencies: this.buildDependencyTree(packageInfo),
        };
    }
    async checkForVulnerabilities() {
        // Placeholder for security vulnerability checking
        // Would integrate with npm audit or similar tools
        return [];
    }
    findPackageJson(startDir) {
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
    findLockfile(dir) {
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
        }
        catch (error) {
            throw new Error(`Failed to load package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractDependencies(packageInfo) {
        const dependencies = [];
        // Production dependencies
        for (const [name, version] of Object.entries(packageInfo.dependencies || {})) {
            dependencies.push({
                name,
                version,
                type: shared_1.DependencyType.PRODUCTION,
                dev: false,
            });
        }
        // Development dependencies
        for (const [name, version] of Object.entries(packageInfo.devDependencies || {})) {
            dependencies.push({
                name,
                version,
                type: shared_1.DependencyType.DEVELOPMENT,
                dev: true,
            });
        }
        // Peer dependencies
        for (const [name, version] of Object.entries(packageInfo.peerDependencies || {})) {
            dependencies.push({
                name,
                version,
                type: shared_1.DependencyType.PEER,
                dev: false,
            });
        }
        // Optional dependencies
        for (const [name, version] of Object.entries(packageInfo.optionalDependencies || {})) {
            dependencies.push({
                name,
                version,
                type: shared_1.DependencyType.OPTIONAL,
                optional: true,
            });
        }
        return dependencies;
    }
    countDependencies(dependencies) {
        return dependencies.reduce((counts, dep) => {
            switch (dep.type) {
                case shared_1.DependencyType.PRODUCTION:
                    counts.production++;
                    break;
                case shared_1.DependencyType.DEVELOPMENT:
                    counts.development++;
                    break;
                case shared_1.DependencyType.PEER:
                    counts.peer++;
                    break;
                case shared_1.DependencyType.OPTIONAL:
                    counts.optional++;
                    break;
            }
            return counts;
        }, { production: 0, development: 0, peer: 0, optional: 0 });
    }
    buildDependencyTree(packageInfo) {
        // Simplified tree building - would need recursive resolution
        const tree = {};
        for (const [name, version] of Object.entries(packageInfo.dependencies || {})) {
            tree[name] = {
                version,
                resolved: this.resolvePackageVersion(name),
                dependencies: {}, // Would recursively build
            };
        }
        return tree;
    }
    resolvePackageVersion(packageName) {
        try {
            const packagePath = require.resolve(`${packageName}/package.json`);
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return packageJson.version || '0.0.0';
        }
        catch {
            return '0.0.0';
        }
    }
}
exports.PackageScanner = PackageScanner;
