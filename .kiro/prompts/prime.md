# Prime: Load Project Context

## Objective
Build comprehensive understanding of the TraceLens codebase by analyzing structure, documentation, and key files with focus on hackathon submission readiness.

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
- Avoid reading anything in examples or content_plan folders

### 3. Identify Key Files
Based on the structure, identify and read:
- Main entry points (index.ts files in packages)
- Core configuration files (package.json, tsconfig.json, turbo.json)
- Key model/schema definitions in packages/shared
- Important service files (ingestion-service, analysis-engine)
- MCP server implementation (packages/mcp-server)

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
- Type: Self-hosted observability platform with MCP server
- Primary technologies and frameworks
- Current version/state and NPM package status

### Architecture
- Turborepo monorepo with 7 packages + 1 web app
- Key architectural patterns: Event-driven, causal graph construction, MCP integration
- Important directories and their purposes
- AI integration approach via Model Context Protocol

### Tech Stack
- Languages: TypeScript (Node.js backend, Next.js frontend)
- Frameworks: Next.js 14, Express.js, OpenTelemetry, MCP SDK
- Build tools: Turborepo, TypeScript 5.0
- Database: PostgreSQL 15 with Redis 7
- Testing: Jest, Playwright

### Core Principles
- <1ms overhead requirement for production safety
- Causality-focused analysis vs traditional metrics
- AI-first design for natural language queries
- Self-hosted deployment for data sovereignty
- Comprehensive documentation with GitHub collapsibles

### Hackathon Readiness
- Completion status: 13/13 checkpoints completed (100%)
- Published packages: 4 NPM packages including MCP server
- Documentation quality: Comprehensive with collapsibles
- Innovation level: Novel AI integration approach
- Missing components: Demo video (critical for presentation score)

### Current State
- Active branch (if git repository)
- Recent changes focus: MCP integration, documentation enhancement
- NPM publication status: All packages published
- Hackathon score projection: 87/100 (95/100 with demo video)

### AI Integration Highlights
- MCP server for natural language queries
- 80% reduction in AI debugging costs
- Integration with Kiro CLI, Claude Code, Cursor
- 5 core tools: performance, dependencies, security, traces, health

### Competitive Advantages
- First observability platform with comprehensive MCP integration
- Causality analysis vs metrics-based monitoring
- Production-ready with published NPM packages
- Systematic development methodology
- Cost reduction for AI-assisted development

**Make this summary easy to scan - use bullet points and clear headers. Focus on hackathon submission strengths and readiness.**
