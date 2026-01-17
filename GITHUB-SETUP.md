# GitHub Repository Setup Guide

This guide walks through setting up TraceLens as a private GitHub repository and preparing packages for npm publishing.

## 1. Create GitHub Repository

### Option A: GitHub CLI (Recommended)
```bash
# Install GitHub CLI if not already installed
# macOS: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate with GitHub
gh auth login

# Create private repository
gh repo create tracelens --private --description "Runtime Truth Engine for Web Applications"

# Add remote and push
git remote add origin https://github.com/yourusername/tracelens.git
git branch -M main
git push -u origin main
```

### Option B: GitHub Web Interface
1. Go to https://github.com/new
2. Repository name: `tracelens`
3. Description: `Runtime Truth Engine for Web Applications`
4. Set to **Private**
5. Don't initialize with README (we already have one)
6. Click "Create repository"

```bash
# Add remote and push
git remote add origin https://github.com/yourusername/tracelens.git
git branch -M main
git push -u origin main
```

## 2. Repository Configuration

### Add Repository Secrets (for CI/CD)
Go to Settings → Secrets and variables → Actions, add:

```
NPM_TOKEN=your_npm_publish_token
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
```

### Configure Branch Protection
Go to Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Add Topics/Tags
Go to Settings → General → Topics:
```
observability, performance-monitoring, web-vitals, opentelemetry, 
causal-analysis, runtime-security, typescript, nextjs, docker
```

## 3. Prepare for Initial Commit

### Create .gitignore (if not exists)
```bash
# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.next/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.production
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Docker
.dockerignore

# Temporary folders
tmp/
temp/
```

### Create LICENSE file
```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 TraceLens Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
```

## 4. Initial Commit and Push

```bash
# Add all files
git add .

# Create initial commit
git commit -m "feat: initial TraceLens implementation

- Complete browser and server SDKs with <1ms overhead
- Causal graph analysis engine with deterministic results  
- Interactive dashboard with D3.js visualizations
- Production-ready deployment with Docker and Coolify
- Comprehensive documentation and examples
- End-to-end integration tests

Implements all 12 development checkpoints:
✅ Project infrastructure and shared utilities
✅ Browser and server SDK development  
✅ Data ingestion with validation and auth
✅ Analysis engine with causal graph construction
✅ Security scanner with CVE mapping
✅ Interactive dashboard with advanced visualizations
✅ End-to-end integration and sample applications
✅ Production deployment configuration

Ready for production deployment and npm publishing."

# Push to GitHub
git push -u origin main
```

## 5. NPM Publishing Setup

### Create npm Account and Organization
1. Create account at https://www.npmjs.com/signup
2. Verify email address
3. Create organization: `@tracelens`
4. Generate access token: Account → Access Tokens → Generate New Token
   - Type: **Automation** (for CI/CD)
   - Copy token for GitHub secrets

### Packages to Publish

#### Core SDKs (Public)
```bash
# Browser SDK
cd packages/browser-sdk
npm publish --access public

# Server SDK  
cd packages/server-sdk
npm publish --access public

# Shared utilities
cd packages/shared
npm publish --access public
```

#### Installation Commands for Users
```bash
# Frontend monitoring
npm install @tracelens/browser-sdk

# Backend tracing
npm install @tracelens/server-sdk

# Both (full stack)
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

### Publishing Workflow

#### Manual Publishing
```bash
# Build all packages
npm run build

# Test packages
npm run test

# Publish browser SDK
cd packages/browser-sdk
npm version patch  # or minor/major
npm publish

# Publish server SDK
cd packages/server-sdk  
npm version patch
npm publish

# Publish shared utilities
cd packages/shared
npm version patch
npm publish
```

#### Automated Publishing (GitHub Actions)
Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build packages
        run: npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Publish packages
        run: |
          cd packages/shared && npm publish
          cd ../browser-sdk && npm publish  
          cd ../server-sdk && npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 6. Repository Structure for GitHub

### README Badges
Add to top of README.md:
```markdown
[![Build Status](https://github.com/yourusername/tracelens/workflows/CI/badge.svg)](https://github.com/yourusername/tracelens/actions)
[![npm version](https://badge.fury.io/js/%40tracelens%2Fbrowser-sdk.svg)](https://www.npmjs.com/package/@tracelens/browser-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

### Issue Templates
Create `.github/ISSUE_TEMPLATE/`:

**Bug Report** (`.github/ISSUE_TEMPLATE/bug_report.md`):
```markdown
---
name: Bug report
about: Create a report to help us improve TraceLens
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**SDK Version**
- Browser SDK: [e.g. 1.0.0]
- Server SDK: [e.g. 1.0.0]

**Environment**
- OS: [e.g. macOS, Linux, Windows]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node.js: [e.g. 18.17.0]

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Additional context**
Add any other context about the problem here.
```

**Feature Request** (`.github/ISSUE_TEMPLATE/feature_request.md`):
```markdown
---
name: Feature request
about: Suggest an idea for TraceLens
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Pull Request Template
Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Performance impact validated (<1ms overhead maintained)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes without version bump
```

## 7. Final Repository Setup

```bash
# Create all GitHub-specific files
mkdir -p .github/ISSUE_TEMPLATE .github/workflows

# Add CI workflow
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm test
    
    - name: Build packages
      run: npm run build
EOF

# Commit GitHub configuration
git add .github/ LICENSE
git commit -m "feat: add GitHub repository configuration

- CI/CD workflows for automated testing
- Issue and PR templates for contributions
- MIT license for open source compliance
- Branch protection and repository settings"

git push origin main
```

## Summary

After following this guide, you'll have:

✅ **Private GitHub repository** with proper configuration  
✅ **CI/CD pipeline** for automated testing and publishing  
✅ **NPM packages** ready for public distribution  
✅ **Documentation** and contribution guidelines  
✅ **Issue tracking** and PR templates  

### Next Steps:
1. **Test the setup**: Create a test PR to validate CI/CD
2. **Publish packages**: Release v1.0.0 to npm
3. **Documentation**: Add more detailed API docs
4. **Community**: Set up Discord/Slack for support
5. **Marketing**: Create landing page and demos
