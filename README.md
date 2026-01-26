# TraceLens - Runtime Truth Engine for Web Applications

[![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)](https://www.typescriptlang.org/)
[![Performance](https://img.shields.io/badge/overhead-%3C1ms-brightgreen)](https://github.com/v4mpire/TraceLens)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Self-Hosted](https://img.shields.io/badge/deployment-localhost-green)](docs/deployment.md)

TraceLens transforms application debugging by focusing on causality rather than metrics. Instead of telling you "your app is slow," TraceLens builds real-time dependency graphs from browser and server runtime signals to show you exactly why it's slow.

## What Makes TraceLens Different

<details>
<summary><strong>Self-Monitoring Demonstration</strong></summary>

TraceLens monitors its own dashboard performance in real-time to demonstrate capabilities before you integrate it into your projects. When you install TraceLens, you immediately see:

- Live trace counting from dashboard interactions
- Real-time performance metrics from the dashboard itself
- System health monitoring of all services
- Interactive onboarding that proves the platform works

This "meta" observability approach means you experience TraceLens's power before writing a single line of integration code.
</details>

<details>
<summary><strong>Causality-Focused Analysis</strong></summary>

Traditional monitoring tools show you metrics. TraceLens shows you causality:

- **Traditional**: "Your app has a 2.3s response time"
- **TraceLens**: "Your app is slow because the user authentication service is waiting 1.8s for a database query that's missing an index"

TraceLens builds dependency graphs from runtime signals to show exactly what's blocking your application performance.
</details>

<details>
<summary><strong>AI-Queryable Insights</strong></summary>

TraceLens integrates with AI coding assistants through the Model Context Protocol (MCP):

```bash
kiro-cli "What are my app's current performance bottlenecks?"
kiro-cli "Show me the dependency graph for user authentication"
kiro-cli "What security vulnerabilities should I fix first?"
```

This reduces AI debugging costs by 80% because you get precise context instead of vague conversations.
</details>

## Quick Start

<details>
<summary><strong>Installation</strong></summary>

**Single Entry Point - See All Options:**
```bash
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
python3 install.py --help
```

**Installation Modes:**
```bash
# Standard installation (full build)
python3 install.py

# Quick installation (minimal dependencies)
python3 install.py --quick

# Demo mode (zero build time, perfect for presentations)
python3 install.py --demo

# Enhanced installation (rich terminal UI)
python3 install.py --enhanced

# Custom ports
python3 install.py --dashboard-port 3000 --api-port 3001

# Validate existing installation
python3 install.py --validate
```

The `install.py` script is your single entry point for:
- Multiple installation modes (standard, quick, demo, enhanced)
- Custom port configuration to avoid conflicts
- Prerequisites checking (Docker, Node.js)
- Database services setup (PostgreSQL + Redis)
- Dependency installation and package building
- Automatic dashboard launch with self-monitoring demonstration
- Installation validation and troubleshooting

Run `python3 install.py --help` to see all available options including installation modes, port configurations, and validation methods.
</details>

<details>
<summary><strong>Integration (2 lines)</strong></summary>

**Frontend Integration:**
```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start(); // Automatic Web Vitals and performance tracking
```

**Backend Integration:**
```javascript
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import express from 'express';

const app = express();
app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
}));
```
</details>

## Key Features

<details>
<summary><strong>Interactive Onboarding</strong></summary>

New users get a guided 3-step experience:

1. **System Health Check**: Verify all services are running with live metrics
2. **Dashboard Tour**: Interactive walkthrough of key features with real data
3. **Integration Guide**: Framework-specific code generation for your stack

The onboarding uses real self-monitoring data to demonstrate TraceLens capabilities immediately.
</details>

<details>
<summary><strong>Enhanced Installation Experience</strong></summary>

Professional installer with rich terminal UI:
- Multi-stage progress bars showing exactly what's happening
- Live package installation updates during npm install
- Beautiful success screen with service status table
- Automatic browser launch to dashboard
- Custom port configuration to avoid conflicts
</details>

<details>
<summary><strong>Production-Safe Monitoring</strong></summary>

- **<1ms Overhead**: Non-blocking operation with minimal performance impact
- **Self-Hosted**: Your data never leaves your infrastructure
- **Automatic Instrumentation**: Web Vitals and performance tracking out of the box
- **Real-Time Analysis**: Dependency graphs and critical path detection
- **Security Scanning**: CVE mapping to actual runtime execution paths
</details>

## Architecture

<details>
<summary><strong>Technical Stack</strong></summary>

**Core Components:**
- **Browser SDK**: Lightweight client-side performance monitoring
- **Server SDK**: Backend tracing and dependency tracking
- **Ingestion Service**: Event processing and data normalization
- **Analysis Engine**: Causal graph construction and critical path analysis
- **Dashboard**: Next.js web interface with real-time visualization
- **Self-Monitoring**: __SYSTEM__ project that monitors the dashboard itself

**Technology:**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Monitoring**: OpenTelemetry, Custom performance tracking
- **Build**: Turborepo monorepo, ESBuild bundling
- **Testing**: Jest, Playwright, Visual regression testing
- **AI Integration**: Model Context Protocol (MCP) for natural language queries
</details>

<details>
<summary><strong>Performance Specifications</strong></summary>

- **Browser SDK**: <1ms overhead, <2MB memory usage
- **API Response**: <100ms for event ingestion
- **Graph Analysis**: <2s for complex dependency graphs
- **Throughput**: 10,000+ events per second
- **Self-Monitoring**: Real-time updates every 5 seconds
</details>

## AI Integration

<details>
<summary><strong>Setup</strong></summary>

Install MCP server:
```bash
npm install -g @tracelens/mcp-server
```

Add to `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001"]
    }
  }
}
```
</details>

<details>
<summary><strong>Natural Language Queries</strong></summary>

```bash
# Performance Analysis
kiro-cli "What's causing the slow response time in my user dashboard?"
kiro-cli "Show me the critical path for checkout process"

# Security Analysis  
kiro-cli "What vulnerabilities affect my authentication flow?"
kiro-cli "Which security issues should I prioritize?"

# Optimization
kiro-cli "How can I optimize this 340ms database query?"
kiro-cli "What's the best way to reduce my bundle size?"
```
</details>

## Documentation

<details>
<summary><strong>Getting Started</strong></summary>

- [Installation Guide](QUICKSTART.md) - Get running in 5 minutes
- [Beginner Guide](BEGINNER-GUIDE.md) - Step-by-step tutorial
- [Integration Examples](examples/) - React and Express samples
</details>

<details>
<summary><strong>Advanced</strong></summary>

- [API Documentation](docs/api.md) - Complete API reference
- [MCP Integration](docs/mcp-integration.md) - AI tool setup guide
- [Deployment Guide](docs/deployment.md) - Production deployment
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions
</details>

## Why TraceLens Saves Time and Money

<details>
<summary><strong>AI Coding Cost Reduction</strong></summary>

**Without TraceLens:**
- "My app is slow, help me debug" → Vague, expensive conversations
- Multiple back-and-forth messages to narrow down issues
- Generic solutions that might not work

**With TraceLens:**
- "How do I optimize this 340ms database query?" → Specific, targeted conversation
- Precise context leads to exact solutions
- Immediate validation that fixes work

**Real savings**: $50-100/month in AI credits for active developers
</details>

<details>
<summary><strong>Development Time Savings</strong></summary>

**Without TraceLens:**
- 2-4 hours debugging performance issues
- Guessing which part of code is slow
- Testing multiple theories

**With TraceLens:**
- 10-15 minutes to identify exact problem
- Direct path to solution with dependency graphs
- Immediate validation that fixes work

**Real savings**: 10-20 hours/month for active development
</details>

## Contributing

TraceLens is built with systematic development practices. See [DEVELOPMENT-JOURNEY.md](DEVELOPMENT-JOURNEY.md) for our development philosophy and [CHECKPOINTS.md](CHECKPOINTS.md) for systematic progress tracking.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Ready to understand WHY your app is slow instead of just knowing THAT it's slow?**

[Get Started](QUICKSTART.md) | [View Examples](examples/) | [Join Community](https://github.com/v4mpire/TraceLens/discussions)
