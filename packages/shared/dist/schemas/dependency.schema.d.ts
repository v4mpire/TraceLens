export declare const DependencySnapshotSchema: {
    readonly type: "object";
    readonly required: readonly ["id", "projectId", "timestamp", "environment", "nodeVersion", "packageManager", "dependencies", "runtimeDependencies", "totalSize"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^[a-zA-Z0-9_-]+$";
            readonly minLength: 1;
            readonly maxLength: 100;
            readonly description: "Unique identifier for this dependency snapshot";
        };
        readonly projectId: {
            readonly type: "string";
            readonly pattern: "^[a-zA-Z0-9_-]+$";
            readonly minLength: 3;
            readonly maxLength: 50;
            readonly description: "Project identifier";
        };
        readonly timestamp: {
            readonly type: "number";
            readonly minimum: 1577836800000;
            readonly maximum: 2524608000000;
            readonly description: "Snapshot timestamp in milliseconds since epoch";
        };
        readonly environment: {
            readonly type: "string";
            readonly enum: readonly ["development", "production", "test"];
            readonly description: "Environment where snapshot was taken";
        };
        readonly nodeVersion: {
            readonly type: "string";
            readonly pattern: "^v?\\d+\\.\\d+\\.\\d+";
            readonly description: "Node.js version (e.g., v18.17.0)";
        };
        readonly npmVersion: {
            readonly type: "string";
            readonly pattern: "^\\d+\\.\\d+\\.\\d+";
            readonly description: "npm version if applicable";
        };
        readonly yarnVersion: {
            readonly type: "string";
            readonly pattern: "^\\d+\\.\\d+\\.\\d+";
            readonly description: "Yarn version if applicable";
        };
        readonly packageManager: {
            readonly type: "string";
            readonly enum: readonly ["npm", "yarn", "pnpm"];
            readonly description: "Package manager used";
        };
        readonly dependencies: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/definitions/PackageDependency";
            };
            readonly maxItems: 10000;
            readonly description: "List of package dependencies";
        };
        readonly runtimeDependencies: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/definitions/RuntimeDependency";
            };
            readonly maxItems: 10000;
            readonly description: "List of runtime dependencies with execution data";
        };
        readonly totalSize: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Total size of all dependencies in bytes";
        };
        readonly bundleSize: {
            readonly type: "number";
            readonly minimum: 0;
            readonly description: "Bundle size in bytes if applicable";
        };
    };
    readonly definitions: {
        readonly PackageDependency: {
            readonly type: "object";
            readonly required: readonly ["name", "version", "type"];
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                    readonly pattern: "^(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$";
                    readonly maxLength: 214;
                    readonly description: "Package name (npm naming rules)";
                };
                readonly version: {
                    readonly type: "string";
                    readonly pattern: "^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$";
                    readonly description: "Semantic version";
                };
                readonly type: {
                    readonly type: "string";
                    readonly enum: readonly ["production", "development", "peer", "optional", "bundled"];
                    readonly description: "Dependency type";
                };
                readonly resolved: {
                    readonly type: "string";
                    readonly format: "uri";
                    readonly description: "Resolved URL for the package";
                };
                readonly integrity: {
                    readonly type: "string";
                    readonly pattern: "^(sha1|sha256|sha384|sha512)-[A-Za-z0-9+/]+=*$";
                    readonly description: "Package integrity hash";
                };
                readonly dev: {
                    readonly type: "boolean";
                    readonly description: "Whether this is a development dependency";
                };
                readonly optional: {
                    readonly type: "boolean";
                    readonly description: "Whether this is an optional dependency";
                };
                readonly bundled: {
                    readonly type: "boolean";
                    readonly description: "Whether this dependency is bundled";
                };
            };
            readonly additionalProperties: false;
        };
        readonly RuntimeDependency: {
            readonly type: "object";
            readonly required: readonly ["name", "version", "loadTime", "executionTime", "memoryUsage", "importPath", "isEsm"];
            readonly properties: {
                readonly name: {
                    readonly type: "string";
                    readonly pattern: "^(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$";
                    readonly maxLength: 214;
                    readonly description: "Package name";
                };
                readonly version: {
                    readonly type: "string";
                    readonly pattern: "^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$";
                    readonly description: "Package version";
                };
                readonly loadTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "Time to load the module in milliseconds";
                };
                readonly executionTime: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "Time to execute module initialization in milliseconds";
                };
                readonly memoryUsage: {
                    readonly type: "number";
                    readonly minimum: 0;
                    readonly description: "Memory usage in bytes";
                };
                readonly importPath: {
                    readonly type: "string";
                    readonly maxLength: 1024;
                    readonly description: "Import path used to load the module";
                };
                readonly isEsm: {
                    readonly type: "boolean";
                    readonly description: "Whether the module is an ES module";
                };
                readonly exports: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly maxLength: 256;
                    };
                    readonly maxItems: 1000;
                    readonly description: "List of exported symbols";
                };
            };
            readonly additionalProperties: false;
        };
    };
    readonly additionalProperties: false;
};
//# sourceMappingURL=dependency.schema.d.ts.map