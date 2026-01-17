# Project Structure

## Directory Layout
```
TraceLens/
├── packages/
│   ├── browser-sdk/          # Client-side performance monitoring SDK
│   ├── server-sdk/           # Backend tracing and dependency SDK
│   ├── ingestion-service/    # Event processing and data normalization
│   ├── analysis-engine/      # Causal graph construction and analysis
│   ├── dashboard/            # Next.js web interface
│   └── security-scanner/     # CVE mapping and vulnerability analysis
├── apps/
│   └── web/                  # Main dashboard application
├── tools/
│   ├── eslint-config/        # Shared ESLint configuration
│   └── tsconfig/             # Shared TypeScript configurations
├── docker/                   # Docker configurations and compose files
├── docs/                     # Documentation and API specs
├── tests/                    # Integration and E2E tests
├── scripts/                  # Build and deployment scripts
└── .kiro/                    # Kiro CLI configuration and prompts
```

## File Naming Conventions
- **TypeScript files**: camelCase for components, kebab-case for utilities
- **Components**: PascalCase (e.g., `TraceVisualization.tsx`)
- **Utilities**: camelCase (e.g., `graphAnalysis.ts`)
- **Configuration**: kebab-case (e.g., `docker-compose.yml`)
- **Tests**: `.test.ts` or `.spec.ts` suffix
- **Types**: `.types.ts` suffix for shared type definitions

## Module Organization
- **Feature-based structure**: Group related functionality together
- **Shared utilities**: Common code in `packages/shared/`
- **SDK separation**: Browser and server SDKs as independent packages
- **Service isolation**: Each service as separate package with clear interfaces
- **Type definitions**: Shared types in dedicated files with `.types.ts` suffix

## Configuration Files
- **Root level**: `turbo.json`, `package.json`, `tsconfig.json`
- **Package level**: Individual `package.json` and `tsconfig.json` per package
- **Docker**: `docker-compose.yml` for local development, `Dockerfile` per service
- **Environment**: `.env.example` templates, `.env.local` for development
- **Database**: Migration files in `packages/ingestion-service/migrations/`

## Documentation Structure
- **API Documentation**: OpenAPI specs in `docs/api/`
- **SDK Documentation**: Usage guides in `packages/*/README.md`
- **Architecture**: High-level docs in `docs/architecture/`
- **Deployment**: Setup guides in `docs/deployment/`
- **Contributing**: Development guidelines in `CONTRIBUTING.md`

## Asset Organization
- **Static assets**: `apps/web/public/` for dashboard assets
- **Icons and images**: `apps/web/public/assets/`
- **Fonts**: `apps/web/public/fonts/`
- **Styles**: Component-level CSS modules or styled-components

## Build Artifacts
- **Compiled packages**: `packages/*/dist/` for built SDK packages
- **Next.js build**: `apps/web/.next/` for dashboard build
- **Docker images**: Built and tagged for deployment
- **Type declarations**: `.d.ts` files generated alongside compiled code

## Environment-Specific Files
- **Development**: `.env.local` for local development overrides
- **Testing**: `.env.test` for test environment configuration
- **Production**: Environment variables injected via Docker/Coolify
- **CI/CD**: `.github/workflows/` for GitHub Actions configuration
- **Docker environments**: Separate compose files for dev/prod
