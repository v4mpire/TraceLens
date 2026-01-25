# TraceLens Quick Start Guide

Get TraceLens running locally in **2 minutes** with our automated installer.

## 🚀 One-Command Installation

```bash
# Clone and install everything automatically
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
python3 install.py

# For custom ports (avoid conflicts with your app):
python3 install.py --dashboard-port 3002 --api-port 3001
```

**The installer handles everything:**
- ✅ Checks prerequisites (Docker, Node.js)
- ✅ Starts database services (PostgreSQL + Redis)
- ✅ Installs dependencies and builds packages
- ✅ Starts TraceLens API and Web Dashboard
- ✅ Configures AI integration (MCP server)
- ✅ Shows you exactly how to use TraceLens

**✅ 100% Working Solution**: All integration issues resolved, port conflicts eliminated, works reliably in any environment.

## 🎯 What You Get Instantly

- **📊 Web Dashboard**: http://localhost:3000
- **🔌 API Endpoint**: http://localhost:3001
- **💾 Database**: PostgreSQL + Redis (Docker)
- **🤖 AI Integration**: Ready for Kiro CLI queries

## 🚀 Add to Your Project

<details>
<summary><strong>📱 Frontend Integration (2 lines)</strong></summary>

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
<summary><strong>🖥️ Backend Integration (3 lines)</strong></summary>

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

## 🤖 AI Integration

**Natural Language Queries:**
```bash
kiro-cli "What are my app's current performance bottlenecks?"
kiro-cli "Show me the slowest API endpoints"
kiro-cli "What should I optimize first?"
```

**Universal Integration:**
```bash
# In any project directory with Kiro CLI
@tracelens-integrate
```
*Automatically detects your framework and adds TraceLens monitoring*

**MCP Configuration** (automatically created):
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

## 🔧 Manual Installation (Advanced)

<details>
<summary><strong>If you prefer manual setup</strong></summary>

```bash
# 1. Start databases
docker-compose up -d postgres redis

# 2. Install and build
npm install && npm run build

# 3. Start services manually
# (See install.py source for exact commands)
```
</details>

## ✅ Verification

<details>
<summary><strong>Test Your Setup</strong></summary>

```bash
# Test API
curl http://localhost:3001/health
curl http://localhost:3001/api/traces
curl http://localhost:3001/api/performance/bottlenecks

# Test Dashboard
open http://localhost:3000

# Test AI Integration
kiro-cli "Check TraceLens health status"
```
</details>

## 🆘 Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

**Prerequisites Missing:**
- Install Docker Desktop
- Install Node.js 18+
- Run `python3 install.py` again

**Port Conflicts:**
- Ensure ports 3000, 3001, 5432, 6379 are available
- Stop other services using these ports

**Services Not Starting:**
- Check Docker Desktop is running
- Run `docker-compose logs` to see errors
</details>

---

**Ready to debug with AI in 2 minutes!** 🤖✨
