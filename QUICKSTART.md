# TraceLens Quick Start Guide

Get TraceLens running locally in 5 minutes and start debugging with AI-powered observability.

## 🚀 Installation Options

### Option 1: NPM Packages (Recommended)

```bash
# Install SDKs
npm install @tracelens/browser-sdk @tracelens/server-sdk

# Install MCP server for AI integration
npm install -g @tracelens/mcp-server
```

<details>
<summary><strong>📱 Frontend Integration</strong></summary>

```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start(); // Automatic Web Vitals and performance tracking
```
</details>

<details>
<summary><strong>🖥️ Backend Integration</strong></summary>

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

### Option 2: Local Development Setup

<details>
<summary><strong>🐳 Docker Setup</strong></summary>

```bash
# Clone repository
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens

# Start all services
docker-compose up -d

# Services will be available at:
# - Dashboard: http://localhost:3000
# - API: http://localhost:3001
# - Database: PostgreSQL on port 5432
# - Cache: Redis on port 6379
```
</details>

## 🤖 AI Integration Setup

### With Kiro CLI + MCP Integration
```bash
# Install TraceLens MCP server
npm install -g @tracelens/mcp-server

# Add to .kiro/settings/mcp.json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001"]
    }
  }
}

# Natural language queries
kiro-cli "What are my app's current performance bottlenecks?"
kiro-cli "Show me the dependency graph for user authentication"
kiro-cli "What security vulnerabilities should I fix first?"
```

<details>
<summary><strong>🔧 Advanced MCP Configuration</strong></summary>

```json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": [
        "--endpoint", "http://localhost:3001",
        "--project", "my-app",
        "--api-key", "your-api-key"
      ],
      "env": {
        "TRACELENS_LOG_LEVEL": "info"
      }
    }
  }
}
```
</details>

### With Claude Code / Cursor
```javascript
// Give AI tools actual runtime context through MCP
// "My getUserProfile API is slow" → TraceLens MCP shows exact 340ms database query
// Ask targeted questions: "How do I optimize this specific query?"
```

## 🎯 What You Get

<details>
<summary><strong>📊 Performance Insights</strong></summary>

- **Bottleneck Detection**: Identify exact slow operations
- **Critical Path Analysis**: See what's blocking your app
- **Dependency Mapping**: Understand component relationships
- **Real-time Monitoring**: <1ms overhead production monitoring
</details>

<details>
<summary><strong>🛡️ Security Analysis</strong></summary>

- **Runtime Vulnerability Assessment**: Only alerts for actually used packages
- **CVE Impact Analysis**: Understand real security exposure
- **Dependency Risk Scoring**: Prioritize fixes that matter
</details>

<details>
<summary><strong>🤖 AI-Powered Debugging</strong></summary>

- **Natural Language Queries**: Ask questions in plain English
- **Precise Context**: Give AI tools exact performance data
- **Cost Reduction**: Reduce AI debugging costs by 80%
- **Faster Resolution**: 10-15 minutes instead of 2-4 hours
</details>

## 🔧 Verification

<details>
<summary><strong>✅ Test Your Setup</strong></summary>

1. **Check Dashboard**: Visit http://localhost:3000
2. **Verify API**: `curl http://localhost:3001/health`
3. **Test MCP**: `kiro-cli "Check TraceLens health status"`
4. **Monitor Performance**: Generate some traffic and see traces appear
</details>

## 🆘 Troubleshooting

<details>
<summary><strong>🐛 Common Issues</strong></summary>

**Docker Issues:**
- Ensure ports 3000, 3001, 5432, 6379 are available
- Run `docker-compose logs` to check service status

**MCP Issues:**
- Verify `tracelens-mcp` is in PATH: `which tracelens-mcp`
- Check Kiro CLI MCP configuration: `/mcp` command

**SDK Issues:**
- Ensure correct endpoint URLs in SDK configuration
- Check network connectivity to TraceLens API
</details>

## 📚 Next Steps

- **[API Documentation](docs/API.md)** - Complete API reference
- **[MCP Integration Guide](docs/MCP_INTEGRATION.md)** - Advanced AI tool setup
- **[Examples](examples/)** - React and Express integration examples
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Detailed problem solving

---

**Ready to debug with AI?** Start asking TraceLens questions through your favorite AI tool! 🤖✨
