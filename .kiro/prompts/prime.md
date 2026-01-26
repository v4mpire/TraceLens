# Prime: Load Project Context & Initialize Development Logging

## Objective
Build comprehensive understanding of the TraceLens codebase by analyzing structure, documentation, and key files with focus on hackathon submission readiness and universal integration capabilities. Initialize systematic development logging for all subsequent activities.

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

### 6. Initialize Development Logging System
Read current DEVLOG.md to understand the ledger format and prepare for systematic logging of all development activities.

## Development Logging Protocol

**CRITICAL**: After completing the prime analysis, ALL subsequent development activities must be logged using this systematic approach:

### Logging Requirements
Every development activity (bug fix, feature addition, UI change, documentation update, performance optimization) must be logged immediately with:

1. **Entry Number**: Sequential numbering (check DEVLOG.md for next number)
2. **Timestamp**: UTC timestamp in format YYYY-MM-DD HH:MM UTC
3. **Type**: One of FEATURE, BUG_FIX, UI_CHANGE, PERFORMANCE, DOCUMENTATION, REFACTOR
4. **Component**: Specific system component affected
5. **Description**: Clear, concise description of what was changed
6. **Impact**: CRITICAL, HIGH, MEDIUM, LOW
7. **Files Changed**: List of modified files/directories
8. **Developer**: AI Assistant (or actual developer name)
9. **Duration**: Estimated time spent
10. **Additional Context**: Performance impact, testing status, dependencies, etc.

### Logging Template
```
### Entry #XXX - YYYY-MM-DD HH:MM UTC
**Type**: [FEATURE|BUG_FIX|UI_CHANGE|PERFORMANCE|DOCUMENTATION|REFACTOR]  
**Component**: [Component Name]  
**Description**: [Clear description of change]  
**Impact**: [CRITICAL|HIGH|MEDIUM|LOW] - [Brief impact explanation]  
**Files Changed**: [List of files/directories]  
**Developer**: AI Assistant  
**Duration**: [Time estimate]  
**[Additional Context]**: [Performance impact, testing, dependencies, etc.]  
```

### When to Log
- **Before starting work**: Log the planned activity
- **After completing work**: Update with actual results and any deviations
- **For bug fixes**: Include root cause analysis
- **For features**: Include performance impact and testing status
- **For UI changes**: Include user experience impact
- **For documentation**: Include scope and target audience

### Logging Commands
Use these commands to maintain the ledger:

**Add new entry**:
```bash
# Add entry to DEVLOG.md at line 20 (after ledger summary)
```

**Update ledger statistics**:
```bash
# Update the summary table with new counts
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

### Development Logging Status
- **Ledger Format**: ✅ Proper development ledger established
- **Entry Count**: [Current number from DEVLOG.md]
- **Logging Protocol**: ✅ Systematic logging protocol defined
- **Next Entry Number**: #[Next sequential number]
- **Logging Readiness**: ✅ Ready for systematic development tracking

**IMPORTANT**: All future development work must follow the logging protocol. Every bug fix, feature addition, UI change, and development decision must be recorded in DEVLOG.md using the standardized format.

**Make this summary easy to scan - use bullet points and clear headers. Focus on hackathon submission strengths, universal integration capabilities, and readiness for demo recording. Emphasize the importance of systematic development logging for all future activities.**
