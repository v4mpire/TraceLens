# NPM Publishing Guide for TraceLens

This guide covers publishing TraceLens packages to npm for public distribution, updated for the latest npm authentication changes (December 2025).

## ⚠️ Important: npm Authentication Changes (December 2025)

**npm has permanently revoked all classic tokens and introduced new authentication methods:**

- **Classic tokens no longer work** (permanently revoked December 9, 2025)
- **New session-based authentication** with 2-hour sessions via `npm login`
- **New CLI token management** for granular access tokens
- **2FA enforcement** for all publishing operations
- **Secure-by-default 2FA** for new packages

## Packages to Publish

### 1. Core SDKs (Public Packages)

#### @tracelens/browser-sdk
**Purpose**: Client-side performance monitoring with <1ms overhead
**Target Users**: Frontend developers, React/Vue/Angular teams
```bash
npm install @tracelens/browser-sdk
```

#### @tracelens/server-sdk  
**Purpose**: Backend tracing and dependency analysis with OpenTelemetry
**Target Users**: Backend developers, Node.js/Express teams
```bash
npm install @tracelens/server-sdk
```

#### @tracelens/shared
**Purpose**: Common types and utilities shared between SDKs
**Target Users**: Advanced users, plugin developers
```bash
npm install @tracelens/shared
```

### 2. Private Packages (Not for NPM)

These remain private and are deployed as services:
- `@tracelens/ingestion-service` - Event processing API
- `@tracelens/analysis-engine` - Causal graph analysis
- `@tracelens/security-scanner` - CVE mapping service
- `@tracelens/web` - Dashboard application

## Pre-Publishing Setup

### 1. NPM Account Setup (Updated for 2025)
```bash
# Create npm account at https://www.npmjs.com/signup
# Verify email address and enable 2FA (required)

# Login with new session-based authentication
npm login
# This creates a 2-hour session token (auto-expires)

# Create organization (optional but recommended)
npm org create tracelens
```

### 2. Authentication Methods

#### For Local Development (Session-Based)
```bash
# Login creates 2-hour session
npm login

# Sessions automatically expire after 2 hours
# You'll need to re-authenticate periodically
# 2FA is enforced during sessions
```

#### For CI/CD (Granular Access Tokens)
```bash
# Create granular access tokens using new CLI
npm token create --read-only  # For read operations
npm token create --cidr=0.0.0.0/0 --scope=@tracelens  # For publishing

# Or create at https://www.npmjs.com/settings/~/tokens
# Set appropriate expiration (write tokens limited to 90 days max)
# Enable "Bypass 2FA" for automated workflows if needed
```

#### For Enhanced Security (OIDC Trusted Publishing)
Consider adopting [OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) which eliminates the need to generate and manage tokens.

### 3. Update Package Versions
All packages should be at version 1.0.0 for initial release:
```bash
# Already updated in package.json files:
# - @tracelens/browser-sdk: 1.0.0
# - @tracelens/server-sdk: 1.0.0  
# - @tracelens/shared: 1.0.0
```

## Publishing Process

### Option 1: Manual Publishing (First Release)

#### Step 1: Authenticate
```bash
# Use session-based authentication for local publishing
npm login
# Note: Session expires in 2 hours, re-authenticate as needed
```

#### Step 2: Build All Packages
```bash
# From project root
npm run build

# Verify builds completed
ls packages/*/dist/
```

#### Step 3: Test Packages Locally
```bash
# Test browser SDK
cd packages/browser-sdk
npm pack
npm install -g tracelens-browser-sdk-1.0.0.tgz

# Test server SDK
cd ../server-sdk
npm pack
npm install -g tracelens-server-sdk-1.0.0.tgz

# Clean up test installations
npm uninstall -g @tracelens/browser-sdk @tracelens/server-sdk
```

#### Step 4: Publish Shared Package First
```bash
cd packages/shared
npm publish --access public
# 2FA will be enforced during publishing
```

#### Step 5: Update SDK Dependencies
```bash
# Update browser SDK to use published shared package
cd ../browser-sdk
npm install @tracelens/shared@^1.0.0
npm run build

# Update server SDK to use published shared package  
cd ../server-sdk
npm install @tracelens/shared@^1.0.0
npm run build
```

#### Step 6: Publish SDKs
```bash
# Publish browser SDK
cd ../browser-sdk
npm publish --access public

# Publish server SDK
cd ../server-sdk
npm publish --access public
```

### Option 2: Automated Publishing (GitHub Actions) - Updated

#### Create Publishing Workflow
```yaml
# .github/workflows/publish.yml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build packages
        run: npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Publish shared package
        run: |
          cd packages/shared
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Update SDK dependencies
        run: |
          cd packages/browser-sdk
          npm install @tracelens/shared@^1.0.0
          npm run build
          
          cd ../server-sdk
          npm install @tracelens/shared@^1.0.0
          npm run build
      
      - name: Publish SDK packages
        run: |
          cd packages/browser-sdk
          npm publish --access public
          
          cd ../server-sdk
          npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Generate CI/CD Token (New Method)
```bash
# Create granular access token for CI/CD
npm token create --cidr=0.0.0.0/0 --scope=@tracelens --bypass-2fa

# Add to GitHub Secrets as NPM_TOKEN
# Go to Settings → Secrets and variables → Actions
# Add NPM_TOKEN with the generated token
```

#### Create GitHub Release
```bash
# Tag the release
git tag v1.0.0
git push origin v1.0.0

# Or use GitHub CLI
gh release create v1.0.0 --title "TraceLens v1.0.0" --notes "Initial production release"
```

## Token Management (New CLI Commands)

### List Tokens
```bash
# List all your tokens
npm token list

# List tokens with details
npm token list --json
```

### Create Tokens
```bash
# Create read-only token
npm token create --read-only

# Create token with specific scope
npm token create --scope=@tracelens

# Create token with CIDR restrictions
npm token create --cidr=192.168.1.0/24

# Create token for CI/CD (bypass 2FA)
npm token create --bypass-2fa --scope=@tracelens

# Create token with expiration (max 90 days for write tokens)
npm token create --expires=30d
```

### Revoke Tokens
```bash
# Revoke specific token
npm token revoke <token-id>

# Revoke all tokens
npm token revoke --all
```

## Security Best Practices (Updated)

### For Local Development
- Use `npm login` for session-based authentication
- Sessions expire after 2 hours for security
- 2FA is automatically enforced during sessions
- Re-authenticate when sessions expire

### For CI/CD Pipelines
- Use granular access tokens with minimal permissions
- Set appropriate expiration dates (max 90 days for write tokens)
- Use `--bypass-2fa` flag for automated workflows
- Restrict tokens with CIDR ranges when possible
- Consider OIDC trusted publishing for enhanced security

### For Production Security
- Enable 2FA on your npm account (required)
- Use organization-level security policies
- Regularly audit and rotate tokens
- Monitor package access and downloads
- Set up security alerts for your packages

## Migration from Classic Tokens

If you were using classic tokens (now permanently revoked):

### Immediate Actions Required
1. **Remove old tokens** from CI/CD environment variables
2. **Generate new granular tokens** using `npm token create`
3. **Update GitHub Actions secrets** with new tokens
4. **Test publishing workflow** with new authentication

### Updated Environment Variables
```bash
# Old (no longer works)
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# New (granular token)
NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx_xxxxxx
```

### Browser SDK README
Create `packages/browser-sdk/README.md`:
```markdown
# @tracelens/browser-sdk

Client-side performance monitoring with <1ms overhead for production web applications.

## Installation

```bash
npm install @tracelens/browser-sdk
```

## Quick Start

```javascript
import { TraceLens } from '@tracelens/browser-sdk';

const tracer = new TraceLens({
  projectKey: 'your-project-key',
  endpoint: 'https://your-tracelens-instance.com/api/events'
});

tracer.start(); // Automatic Web Vitals tracking
```

## Features

- ⚡ <1ms runtime overhead
- 📊 Automatic Web Vitals collection (CLS, LCP, FID, FCP, TTFB, INP)
- 🔍 Resource timing and long task detection
- 🚨 JavaScript error tracking
- 📦 Efficient event batching and transmission
- 🛡️ Production-safe with error resilience

## Documentation

- [Full Documentation](https://github.com/username/tracelens#readme)
- [API Reference](https://github.com/username/tracelens/blob/main/docs/API.md)
- [Examples](https://github.com/username/tracelens/tree/main/examples)

## License

MIT © TraceLens Team
```

### Server SDK README  
Create `packages/server-sdk/README.md`:
```markdown
# @tracelens/server-sdk

Backend tracing and dependency analysis with OpenTelemetry integration for Node.js applications.

## Installation

```bash
npm install @tracelens/server-sdk
```

## Quick Start

```javascript
import { TraceLensSDK } from '@tracelens/server-sdk';
import express from 'express';

const app = express();
const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'https://your-tracelens-instance.com/api/traces'
});

app.use(tracer.middleware()); // Automatic tracing
```

## Features

- 🔍 OpenTelemetry-based distributed tracing
- 📦 Runtime dependency analysis and version detection
- ⚡ Express.js and Fastify middleware support
- 🔗 Automatic trace correlation across services
- 📊 Performance timing and bottleneck detection
- 🛡️ Production-safe with minimal overhead

## Supported Frameworks

- Express.js
- Fastify
- Koa (coming soon)
- NestJS (coming soon)

## Documentation

- [Full Documentation](https://github.com/username/tracelens#readme)
- [API Reference](https://github.com/username/tracelens/blob/main/docs/API.md)
- [Examples](https://github.com/username/tracelens/tree/main/examples)

## License

MIT © TraceLens Team
```

## Post-Publishing Tasks

### 1. Verify Package Publication
```bash
# Check packages are live
npm view @tracelens/browser-sdk
npm view @tracelens/server-sdk
npm view @tracelens/shared

# Test installation
mkdir test-install
cd test-install
npm init -y
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

### 2. Update Documentation
```bash
# Update main README with npm install commands
# Update examples to use published packages instead of file: references
# Create getting started guide with npm installation
```

### 3. Create Example Projects
```bash
# Create standalone example repositories that use published packages
# Update existing examples to reference npm packages
# Add CodeSandbox/StackBlitz examples
```

### 4. Marketing and Distribution
```bash
# Submit to npm weekly newsletter
# Post on Twitter/LinkedIn about release
# Create blog post about TraceLens features
# Submit to awesome lists and directories
```

## Version Management

### Semantic Versioning
- **Major (1.x.x)**: Breaking changes
- **Minor (x.1.x)**: New features, backward compatible
- **Patch (x.x.1)**: Bug fixes, backward compatible

### Release Process
```bash
# For patch releases
npm version patch
git push origin main --tags

# For minor releases  
npm version minor
git push origin main --tags

# For major releases
npm version major
git push origin main --tags
```

### Automated Versioning
Use `semantic-release` for automated version management:
```bash
npm install --save-dev semantic-release
```

## Package Statistics and Monitoring

### NPM Package Health
- Monitor download statistics at https://npmjs.com/package/@tracelens/browser-sdk
- Track package size and dependencies
- Monitor security vulnerabilities with `npm audit`

### Usage Analytics
- Set up download tracking
- Monitor GitHub stars and forks
- Track issues and feature requests
- Monitor community adoption

## Troubleshooting (Updated for 2025)

### Common Publishing Issues

**Authentication Error (Classic Token)**
```bash
# Classic tokens no longer work - use new methods
npm login  # For local development
# OR
npm token create --scope=@tracelens  # For CI/CD
```

**Session Expired**
```bash
# Sessions expire after 2 hours
npm login  # Re-authenticate
```

**2FA Required Error**
```bash
# 2FA is now enforced for all publishing
# Ensure 2FA is enabled on your account
# For CI/CD, use --bypass-2fa when creating tokens
npm token create --bypass-2fa --scope=@tracelens
```

**Package Already Exists**
```bash
# Increment version number
npm version patch
npm publish
```

**Build Failures**
```bash
# Clean and rebuild
npm run clean
npm run build
npm test
```

**Dependency Issues**
```bash
# Update shared package first
# Then update dependent packages
# Ensure version compatibility
```

### Legacy API Endpoint Issues

If you're using Yarn v1 or v2 and experiencing issues:
- The legacy API endpoint is temporarily restored but will be removed soon
- Update to modern package managers (npm 7+, Yarn 3+, pnpm)
- Migrate to current npm authentication methods

### Token Management Issues

**Token Not Working**
```bash
# Check token permissions and expiration
npm token list

# Create new token if needed
npm token create --scope=@tracelens
```

**CI/CD Pipeline Failures**
```bash
# Ensure NPM_TOKEN secret is updated with granular token
# Check token has correct permissions for publishing
# Verify token hasn't expired (90 day max for write tokens)
```

## Summary

After publishing, developers can install TraceLens with:

```bash
# Frontend monitoring
npm install @tracelens/browser-sdk

# Backend tracing  
npm install @tracelens/server-sdk

# Full stack monitoring
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

The packages provide production-ready observability with:
- ✅ <1ms overhead browser monitoring
- ✅ OpenTelemetry-based server tracing  
- ✅ Causal analysis and dependency tracking
- ✅ Self-hosted deployment options
- ✅ Comprehensive documentation and examples
