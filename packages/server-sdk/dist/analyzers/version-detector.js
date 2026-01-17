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
exports.VersionDetector = void 0;
// Dependency version detection and resolution
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class VersionDetector {
    constructor(projectRoot) {
        this.projectRoot = projectRoot || process.cwd();
        this.packageManager = this.detectPackageManager();
    }
    async analyzeVersions() {
        const packages = await this.getInstalledPackages();
        const outdatedInfo = await this.getOutdatedPackages();
        const vulnerabilityInfo = await this.getVulnerabilities();
        const packageInfos = packages.map(pkg => {
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
    async getPackageVersion(packageName) {
        try {
            const packageJsonPath = require.resolve(`${packageName}/package.json`);
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            return packageJson.version || null;
        }
        catch {
            return null;
        }
    }
    async checkForUpdates(packageName) {
        try {
            let command;
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
            const result = (0, child_process_1.execSync)(command, {
                cwd: this.projectRoot,
                encoding: 'utf8',
                timeout: 10000
            });
            const current = await this.getPackageVersion(packageName);
            if (!current)
                return null;
            let latest;
            if (this.packageManager === 'yarn') {
                const parsed = JSON.parse(result);
                latest = parsed.data;
            }
            else {
                latest = result.trim();
            }
            return {
                current,
                latest,
                wanted: latest, // Simplified - would need semver analysis
            };
        }
        catch (error) {
            return null;
        }
    }
    detectPackageManager() {
        if (fs.existsSync(path.join(this.projectRoot, 'yarn.lock'))) {
            return 'yarn';
        }
        if (fs.existsSync(path.join(this.projectRoot, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }
        return 'npm';
    }
    async getInstalledPackages() {
        try {
            const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
            if (!fs.existsSync(nodeModulesPath)) {
                return [];
            }
            const packages = [];
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
                    }
                    else {
                        // Regular package
                        const version = await this.getPackageVersion(entry.name);
                        if (version) {
                            packages.push({ name: entry.name, version });
                        }
                    }
                }
            }
            return packages;
        }
        catch (error) {
            return [];
        }
    }
    async getOutdatedPackages() {
        try {
            let command;
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
            const result = (0, child_process_1.execSync)(command, {
                cwd: this.projectRoot,
                encoding: 'utf8',
                timeout: 30000
            });
            const outdated = JSON.parse(result);
            if (this.packageManager === 'npm') {
                return Object.entries(outdated).map(([name, info]) => ({
                    name,
                    current: info.current,
                    wanted: info.wanted,
                    latest: info.latest,
                }));
            }
            // Handle yarn/pnpm format differences
            return [];
        }
        catch (error) {
            // Command might fail if no outdated packages
            return [];
        }
    }
    async getVulnerabilities() {
        const vulnerabilities = new Map();
        try {
            let command;
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
            const result = (0, child_process_1.execSync)(command, {
                cwd: this.projectRoot,
                encoding: 'utf8',
                timeout: 30000
            });
            const audit = JSON.parse(result);
            if (this.packageManager === 'npm' && audit.vulnerabilities) {
                for (const [packageName, vulnInfo] of Object.entries(audit.vulnerabilities)) {
                    vulnerabilities.set(packageName, vulnInfo.severity ? 1 : 0);
                }
            }
            return vulnerabilities;
        }
        catch (error) {
            // Audit might fail or have no vulnerabilities
            return vulnerabilities;
        }
    }
}
exports.VersionDetector = VersionDetector;
