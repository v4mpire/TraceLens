# Technical Architecture

## Technology Stack
- **Primary**: TypeScript (Node.js backend, Next.js frontend)
- **Tracing**: OpenTelemetry for runtime tracing and instrumentation
- **Database**: PostgreSQL for storing traces and dependency graphs
- **Message Queue**: Redis for event processing and caching
- **Containerization**: Docker for deployment and development
- **Deployment**: Coolify for self-hosted VPS deployment
- **Build Tools**: Turborepo for monorepo management, ESBuild for bundling
- **Testing**: Jest for unit testing, Playwright for E2E testing

## Architecture Overview
Monorepo architecture with separate packages for browser and server SDKs, a backend ingestion and analysis service, and a web-based dashboard. The system uses event ingestion, directed dependency graph construction, and deterministic analysis to identify critical paths and runtime risk.

### Core Components
- **Browser SDK**: Lightweight client-side performance monitoring
- **Server SDK**: Backend tracing and dependency tracking
- **Ingestion Service**: Event processing and data normalization
- **Analysis Engine**: Causal graph construction and critical path analysis
- **Dashboard**: Web interface for visualization and investigation
- **Security Scanner**: CVE mapping to runtime execution paths

## Development Environment
- **Node.js**: v18+ with npm/yarn package management
- **TypeScript**: Strict mode with comprehensive type checking
- **Development Server**: Next.js dev server with hot reload
- **Database**: PostgreSQL with Docker for local development
- **Code Editor**: VS Code with TypeScript, ESLint, and Prettier extensions

## Code Standards
- **TypeScript**: Strict type checking, explicit return types for functions
- **Naming**: camelCase for variables/functions, PascalCase for classes/types
- **File Structure**: Feature-based organization with clear separation of concerns
- **Documentation**: JSDoc comments for public APIs and complex logic
- **Imports**: Absolute imports using path mapping, grouped by external/internal

## Testing Strategy
- **Unit Tests**: Jest with comprehensive coverage for business logic
- **Integration Tests**: API endpoint testing with supertest
- **E2E Tests**: Playwright for critical user workflows
- **Performance Tests**: Load testing for ingestion endpoints
- **Coverage**: Minimum 80% code coverage requirement

## Deployment Process
- **Self-Hosted**: Docker containers deployed via Coolify on VPS
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Environment Management**: Docker Compose for local, production configs
- **Database Migrations**: Automated schema migrations with rollback support
- **Monitoring**: Health checks and basic metrics collection

## Performance Requirements
- **SDK Performance**: Non-blocking, <1ms overhead for production applications
- **Ingestion Latency**: <100ms for event processing and storage
- **Dashboard Response**: <2s for graph visualization and analysis queries
- **Scalability**: Handle 10k+ events per second per instance
- **Resource Usage**: Minimal memory footprint for client SDKs

## Security Considerations
- **Production Safety**: SDKs must never block application execution
- **Data Privacy**: Configurable data sanitization and PII filtering
- **Authentication**: Secure API keys for SDK authentication
- **Network Security**: HTTPS-only communication, rate limiting
- **Vulnerability Analysis**: Real-time CVE mapping to actual runtime paths
- **Self-Hosted Security**: Secure deployment practices and container hardening
