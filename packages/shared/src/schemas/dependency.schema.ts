// Dependency snapshot schema for TraceLens
export const DependencySnapshotSchema = {
  type: 'object',
  required: [
    'id',
    'projectId', 
    'timestamp',
    'environment',
    'nodeVersion',
    'packageManager',
    'dependencies',
    'runtimeDependencies',
    'totalSize'
  ],
  properties: {
    id: {
      type: 'string',
      pattern: '^[a-zA-Z0-9_-]+$',
      minLength: 1,
      maxLength: 100,
      description: 'Unique identifier for this dependency snapshot'
    },
    projectId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9_-]+$',
      minLength: 3,
      maxLength: 50,
      description: 'Project identifier'
    },
    timestamp: {
      type: 'number',
      minimum: 1577836800000, // 2020-01-01
      maximum: 2524608000000, // 2050-01-01
      description: 'Snapshot timestamp in milliseconds since epoch'
    },
    environment: {
      type: 'string',
      enum: ['development', 'production', 'test'],
      description: 'Environment where snapshot was taken'
    },
    nodeVersion: {
      type: 'string',
      pattern: '^v?\\d+\\.\\d+\\.\\d+',
      description: 'Node.js version (e.g., v18.17.0)'
    },
    npmVersion: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+',
      description: 'npm version if applicable'
    },
    yarnVersion: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+',
      description: 'Yarn version if applicable'
    },
    packageManager: {
      type: 'string',
      enum: ['npm', 'yarn', 'pnpm'],
      description: 'Package manager used'
    },
    dependencies: {
      type: 'array',
      items: {
        $ref: '#/definitions/PackageDependency'
      },
      maxItems: 10000,
      description: 'List of package dependencies'
    },
    runtimeDependencies: {
      type: 'array',
      items: {
        $ref: '#/definitions/RuntimeDependency'
      },
      maxItems: 10000,
      description: 'List of runtime dependencies with execution data'
    },
    totalSize: {
      type: 'number',
      minimum: 0,
      description: 'Total size of all dependencies in bytes'
    },
    bundleSize: {
      type: 'number',
      minimum: 0,
      description: 'Bundle size in bytes if applicable'
    }
  },
  definitions: {
    PackageDependency: {
      type: 'object',
      required: ['name', 'version', 'type'],
      properties: {
        name: {
          type: 'string',
          pattern: '^(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$',
          maxLength: 214,
          description: 'Package name (npm naming rules)'
        },
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$',
          description: 'Semantic version'
        },
        type: {
          type: 'string',
          enum: ['production', 'development', 'peer', 'optional', 'bundled'],
          description: 'Dependency type'
        },
        resolved: {
          type: 'string',
          format: 'uri',
          description: 'Resolved URL for the package'
        },
        integrity: {
          type: 'string',
          pattern: '^(sha1|sha256|sha384|sha512)-[A-Za-z0-9+/]+=*$',
          description: 'Package integrity hash'
        },
        dev: {
          type: 'boolean',
          description: 'Whether this is a development dependency'
        },
        optional: {
          type: 'boolean',
          description: 'Whether this is an optional dependency'
        },
        bundled: {
          type: 'boolean',
          description: 'Whether this dependency is bundled'
        }
      },
      additionalProperties: false
    },
    RuntimeDependency: {
      type: 'object',
      required: ['name', 'version', 'loadTime', 'executionTime', 'memoryUsage', 'importPath', 'isEsm'],
      properties: {
        name: {
          type: 'string',
          pattern: '^(@[a-z0-9-~][a-z0-9-._~]*/)?[a-z0-9-~][a-z0-9-._~]*$',
          maxLength: 214,
          description: 'Package name'
        },
        version: {
          type: 'string',
          pattern: '^\\d+\\.\\d+\\.\\d+(?:-[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?(?:\\+[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*)?$',
          description: 'Package version'
        },
        loadTime: {
          type: 'number',
          minimum: 0,
          description: 'Time to load the module in milliseconds'
        },
        executionTime: {
          type: 'number',
          minimum: 0,
          description: 'Time to execute module initialization in milliseconds'
        },
        memoryUsage: {
          type: 'number',
          minimum: 0,
          description: 'Memory usage in bytes'
        },
        importPath: {
          type: 'string',
          maxLength: 1024,
          description: 'Import path used to load the module'
        },
        isEsm: {
          type: 'boolean',
          description: 'Whether the module is an ES module'
        },
        exports: {
          type: 'array',
          items: {
            type: 'string',
            maxLength: 256
          },
          maxItems: 1000,
          description: 'List of exported symbols'
        }
      },
      additionalProperties: false
    }
  },
  additionalProperties: false
} as const;
