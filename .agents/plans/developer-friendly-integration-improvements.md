# Feature: Developer-Friendly TraceLens Integration Improvements

The following plan addresses critical integration issues identified in real-world testing with VedMuni project to make TraceLens truly developer-friendly.

## Feature Description

Transform TraceLens from a promising but problematic integration into a seamless, production-ready observability platform that developers can integrate without friction. Address port conflicts, SDK package resolution issues, Docker compatibility problems, and development workflow challenges.

## User Story

As a web developer integrating TraceLens into my existing project
I want a frictionless setup that doesn't conflict with my development environment
So that I can add observability without disrupting my existing workflow or deployment process

## Problem Statement

Current TraceLens integration creates significant developer friction:
1. **Port Conflict**: Dashboard runs on localhost:3000, conflicting with most Next.js/React apps
2. **SDK Package Issues**: Published NPM packages fail to resolve during builds
3. **Docker Incompatibility**: Integration breaks Docker builds and deployments
4. **Development Workflow**: Cannot run TraceLens and target app simultaneously

## Solution Statement

Create a configurable, Docker-friendly TraceLens setup with:
- Configurable ports to avoid conflicts
- Robust SDK packages that work in all environments
- Docker-compatible integration patterns
- Seamless development workflow support

## Feature Metadata

**Feature Type**: Enhancement/Bug Fix
**Estimated Complexity**: High
**Primary Systems Affected**: Python installer, NPM packages, Docker setup, MCP integration
**Dependencies**: Docker, Node.js, NPM registry, existing TraceLens architecture

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `install.py` (lines 1-300) - Why: Main installer that needs port configuration
- `packages/browser-sdk/package.json` - Why: Check current SDK package configuration
- `packages/server-sdk/package.json` - Why: Check current SDK package configuration
- `packages/browser-sdk/src/index.ts` - Why: Verify SDK implementation and exports
- `packages/server-sdk/src/index.ts` - Why: Verify SDK implementation and exports
- `docker-compose.yaml` - Why: Current Docker configuration that needs port flexibility
- `TRACELENS-INTEGRATION-FEEDBACK.md` - Why: Real-world integration issues and requirements

### New Files to Create

- `install-config.json` - Configuration file for installer options
- `packages/browser-sdk/dist/index.js` - Ensure built files are included in package
- `packages/server-sdk/dist/index.js` - Ensure built files are included in package
- `docker/development/docker-compose.yml` - Development-friendly Docker setup
- `examples/nextjs-integration/` - Working Next.js integration example
- `docs/INTEGRATION_TROUBLESHOOTING.md` - Common integration issues and solutions

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [NPM Package Publishing Guide](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
  - Specific section: Package.json configuration and dist files
  - Why: Need to ensure packages are properly published with built files
- [Docker Compose Port Configuration](https://docs.docker.com/compose/compose-file/compose-file-v3/#ports)
  - Specific section: Port mapping and environment variables
  - Why: Required for configurable port setup
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
  - Specific section: Multi-stage builds and dependencies
  - Why: Understanding Docker build issues with Next.js

### Patterns to Follow

**Port Configuration Pattern:**
```python
# From install.py - environment variable support
port = os.environ.get('TRACELENS_DASHBOARD_PORT', '3002')
```

**NPM Package Export Pattern:**
```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/**/*"]
}
```

**Docker Environment Pattern:**
```yaml
environment:
  - DASHBOARD_PORT=${DASHBOARD_PORT:-3002}
  - API_PORT=${API_PORT:-3001}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Port Configuration System

Create flexible port configuration to eliminate conflicts with user applications.

**Tasks:**
- Add environment variable support to installer
- Update Docker Compose with configurable ports
- Modify dashboard and API to use environment-based ports

### Phase 2: SDK Package Resolution

Fix NPM package issues to ensure reliable imports in all environments.

**Tasks:**
- Verify and rebuild SDK packages with proper dist files
- Update package.json configurations for proper exports
- Test package resolution in various environments
- Republish packages to NPM registry

### Phase 3: Docker Compatibility

Ensure TraceLens works seamlessly with Docker-based development and deployment.

**Tasks:**
- Create Docker-friendly integration examples
- Update documentation with Docker-specific instructions
- Test integration with common Docker setups

### Phase 4: Development Workflow Optimization

Streamline the developer experience for simultaneous TraceLens and app development.

**Tasks:**
- Create development-specific configurations
- Add integration examples for popular frameworks
- Update documentation with workflow best practices

---

## STEP-BY-STEP TASKS

### CREATE install-config.json

- **IMPLEMENT**: Configuration file for installer customization
- **PATTERN**: Environment variable configuration pattern
- **IMPORTS**: None (JSON configuration)
- **GOTCHA**: Must provide sensible defaults for all options
- **VALIDATE**: `python3 -c "import json; json.load(open('install-config.json'))"`

### UPDATE install.py

- **IMPLEMENT**: Port configuration support with environment variables
- **PATTERN**: Environment variable reading with defaults
- **IMPORTS**: `import os, json`
- **GOTCHA**: Must maintain backward compatibility with existing usage
- **VALIDATE**: `python3 install.py --help` (should show new options)

### UPDATE docker-compose.yaml

- **IMPLEMENT**: Environment variable support for port configuration
- **PATTERN**: Docker Compose environment variable substitution
- **IMPORTS**: None (YAML configuration)
- **GOTCHA**: Must work with and without environment variables set
- **VALIDATE**: `docker-compose config` (should show resolved configuration)

### UPDATE packages/browser-sdk/package.json

- **IMPLEMENT**: Proper package configuration with dist files
- **PATTERN**: Standard NPM package structure with main/types/files
- **IMPORTS**: None (package configuration)
- **GOTCHA**: Must include all necessary files in package
- **VALIDATE**: `npm pack && tar -tf *.tgz` (should show dist files)

### UPDATE packages/server-sdk/package.json

- **IMPLEMENT**: Proper package configuration with dist files
- **PATTERN**: Standard NPM package structure with main/types/files
- **IMPORTS**: None (package configuration)
- **GOTCHA**: Must include all necessary files in package
- **VALIDATE**: `npm pack && tar -tf *.tgz` (should show dist files)

### CREATE packages/browser-sdk/dist/index.js

- **IMPLEMENT**: Ensure built JavaScript files exist and are current
- **PATTERN**: TypeScript compilation output
- **IMPORTS**: Compiled from TypeScript source
- **GOTCHA**: Must be kept in sync with source changes
- **VALIDATE**: `node -e "require('./packages/browser-sdk/dist/index.js')"`

### CREATE packages/server-sdk/dist/index.js

- **IMPLEMENT**: Ensure built JavaScript files exist and are current
- **PATTERN**: TypeScript compilation output
- **IMPORTS**: Compiled from TypeScript source
- **GOTCHA**: Must be kept in sync with source changes
- **VALIDATE**: `node -e "require('./packages/server-sdk/dist/index.js')"`

### CREATE examples/nextjs-integration/

- **IMPLEMENT**: Complete working Next.js integration example
- **PATTERN**: Standard Next.js project structure with TraceLens integration
- **IMPORTS**: @tracelens/browser-sdk, @tracelens/server-sdk
- **GOTCHA**: Must work with both development and production builds
- **VALIDATE**: `cd examples/nextjs-integration && npm run build`

### CREATE docker/development/docker-compose.yml

- **IMPLEMENT**: Development-friendly Docker setup with configurable ports
- **PATTERN**: Docker Compose with environment variables
- **IMPORTS**: None (Docker configuration)
- **GOTCHA**: Must not conflict with user application ports
- **VALIDATE**: `docker-compose -f docker/development/docker-compose.yml config`

### UPDATE README.md

- **IMPLEMENT**: Add port configuration documentation
- **PATTERN**: Existing README structure with new configuration section
- **IMPORTS**: None (documentation)
- **GOTCHA**: Must be clear and concise for developers
- **VALIDATE**: Manual review of documentation clarity

### CREATE docs/INTEGRATION_TROUBLESHOOTING.md

- **IMPLEMENT**: Comprehensive troubleshooting guide for common issues
- **PATTERN**: Problem/Solution format with code examples
- **IMPORTS**: None (documentation)
- **GOTCHA**: Must address real-world issues from feedback
- **VALIDATE**: Manual review against feedback issues

### UPDATE .kiro/prompts/tracelens-integrate.md

- **IMPLEMENT**: Updated integration prompt with port configuration
- **PATTERN**: Existing prompt structure with enhanced configuration
- **IMPORTS**: None (prompt template)
- **GOTCHA**: Must handle port conflicts automatically
- **VALIDATE**: Test prompt with sample project

---

## TESTING STRATEGY

### Unit Tests

Test individual components of the improved integration system:
- Port configuration parsing
- Environment variable handling
- Package resolution

### Integration Tests

Test complete integration workflows:
- Full installer run with custom ports
- SDK package installation and import
- Docker build with TraceLens integration

### Real-World Validation

Test with actual projects:
- Next.js 16 + React 19 project (VedMuni scenario)
- Docker-based deployment
- Multiple simultaneous applications

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
python3 -m py_compile install.py
docker-compose config
npm run lint
```

### Level 2: Package Tests

```bash
npm pack packages/browser-sdk
npm pack packages/server-sdk
npm install -g @tracelens/mcp-server
```

### Level 3: Integration Tests

```bash
python3 install.py --dashboard-port 3002 --api-port 3001
curl http://localhost:3001/health
curl http://localhost:3002
```

### Level 4: Real-World Validation

```bash
cd examples/nextjs-integration
npm install
npm run build
npm run start
```

### Level 5: Docker Validation

```bash
docker-compose -f docker/development/docker-compose.yml up -d
docker-compose -f docker/development/docker-compose.yml ps
```

---

## ACCEPTANCE CRITERIA

- [ ] TraceLens dashboard runs on configurable port (default 3002)
- [ ] TraceLens API runs on configurable port (default 3001)
- [ ] SDK packages install and import successfully in all environments
- [ ] Docker builds work with TraceLens integration
- [ ] Can run TraceLens and user application simultaneously
- [ ] Integration examples work out of the box
- [ ] All validation commands pass
- [ ] Real-world integration (VedMuni scenario) works
- [ ] Documentation addresses all feedback issues
- [ ] Backward compatibility maintained

---

## COMPLETION CHECKLIST

- [ ] Port configuration system implemented
- [ ] SDK packages rebuilt and republished
- [ ] Docker compatibility verified
- [ ] Integration examples created and tested
- [ ] Documentation updated with troubleshooting
- [ ] All validation commands pass
- [ ] Real-world testing completed
- [ ] Feedback issues resolved

---

## NOTES

**Critical Success Factors:**
1. Must eliminate port conflicts completely
2. SDK packages must work in Docker builds
3. Integration must be truly frictionless
4. Backward compatibility is essential

**Risk Mitigation:**
- Test with multiple Node.js versions
- Verify NPM package publishing process
- Test Docker integration thoroughly
- Validate with real projects before release

**Performance Considerations:**
- Maintain <1ms overhead requirement
- Ensure port configuration doesn't impact performance
- Keep Docker image sizes reasonable
