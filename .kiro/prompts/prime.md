# Prime: Load Project Context

## Objective
Build comprehensive understanding of the TraceLens codebase by analyzing structure, documentation, and key files with focus on hackathon submission readiness and universal integration capabilities.

## Process

### 1. Analyze Project Structure
If this is a git repository, list tracked files:
```bash
git ls-files | head -50
```

Show directory structure:
```bash
tree -L 3 -I 'node_modules|__pycache__|.git|dist|build'
```
(or use `ls -la` and explore key directories if tree is not available)

### 2. Read Core Documentation
- Read README files at project root and major directories
- Read any architecture documentation
- Review steering documents for project context (already loaded in context)
- Check hackathon-specific documentation (hackathon-evaluation.md, development-methodology.md)
- Review universal integration documentation (docs/universal-integration.md)
- Avoid reading anything in examples or content_plan folders

### 3. Identify Key Files
Based on the structure, identify and read:
- Main entry points (index.ts files in packages)
- Core configuration files (package.json, tsconfig.json, turbo.json)
- Key model/schema definitions in packages/shared
- Important service files (ingestion-service, analysis-engine)
- MCP server implementation (packages/mcp-server)
- Python installer (install.py)
- Universal integration prompts (.kiro/prompts/tracelens-integrate*.md)

### 4. Understand Current State (if git repository)
Check recent activity:
```bash
git log -10 --oneline
```

Check current branch and status:
```bash
git status
```

### 5. Verify NPM Package Status
Check published packages:
```bash
npm view @tracelens/browser-sdk version
npm view @tracelens/server-sdk version
npm view @tracelens/mcp-server version
```

## Output Report
Provide a concise summary covering:

### Project Overview
- Purpose: Runtime Truth Engine for Web Applications with AI Integration
- Type: Self-hosted observability platform with MCP server and universal integration
- Primary technologies and frameworks
- Current version/state and NPM package status

### Architecture
- Turborepo monorepo with 7 packages + 1 web app
- Key architectural patterns: Event-driven, causal graph construction, MCP integration
- Important directories and their purposes
- AI integration approach via Model Context Protocol
- Universal integration system via @tracelens-integrate prompt

### Tech Stack
- Languages: TypeScript (Node.js backend, Next.js frontend)
- Frameworks: Next.js 14, Express.js, OpenTelemetry, MCP SDK
- Build tools: Turborepo, TypeScript 5.0
- Database: PostgreSQL 15 with Redis 7
- Testing: Jest, Playwright
- Deployment: Python installer (install.py) for one-command setup

### Core Principles
- <1ms overhead requirement for production safety
- Causality-focused analysis vs traditional metrics
- AI-first design for natural language queries
- Self-hosted deployment for data sovereignty
- Universal integration for any web framework
- Comprehensive documentation with GitHub collapsibles

### Hackathon Readiness
- Completion status: 13/13 checkpoints completed (100%)
- Published packages: 4 NPM packages including MCP server
- Documentation quality: Comprehensive with collapsibles
- Innovation level: Novel AI integration approach + universal integration
- Python installer: One-command setup for complete platform
- Real-world validation: Successfully integrated into Next.js 16 + React 19 + Convex projects
- Missing components: Demo video (critical for presentation score)

### Current State
- Active branch (if git repository)
- Recent changes focus: Universal integration, Python installer, real-world testing
- NPM publication status: All packages published
- Integration success: Proven with complex real-world projects
- Hackathon score projection: 87/100 (95/100 with demo video)

### AI Integration Highlights
- MCP server for natural language queries
- 80% reduction in AI debugging costs
- Integration with Kiro CLI, Claude Code, Cursor
- 5 core tools: performance, dependencies, security, traces, health
- Universal @tracelens-integrate prompt for automatic project integration
- Supports React, Vue, Angular, Express, Next.js, and more

### Universal Integration System
- @tracelens-integrate prompt for automatic framework detection
- Supports 10+ frameworks: React, Vue, Angular, Express, Next.js, Fastify, etc.
- Automatic SDK installation and configuration
- Environment variable setup
- MCP integration configuration
- Documentation updates
- Real-world validation with complex projects (Next.js 16 + React 19 + Convex)

### Competitive Advantages
- First observability platform with comprehensive MCP integration
- Universal integration system (works with any web framework)
- Causality analysis vs metrics-based monitoring
- Production-ready with published NPM packages
- One-command setup with Python installer
- Systematic development methodology
- Cost reduction for AI-assisted development
- Real-world proven integration success

**Make this summary easy to scan - use bullet points and clear headers. Focus on hackathon submission strengths, universal integration capabilities, and readiness for demo recording.**
