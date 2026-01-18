# TraceLens Quick Start Guide

Get TraceLens running locally in 5 minutes and start understanding why your app is slow.

## 🚀 Option 1: Use NPM Packages (Recommended)

### Install SDKs
```bash
npm install @tracelens/browser-sdk @tracelens/server-sdk
```

### Frontend Integration (2 lines)
```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start(); // Automatic Web Vitals and performance tracking
```

### Backend Integration (Express)
```javascript
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import express from 'express';

const app = express();
app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
}));
```

## 🏠 Option 2: Run Local TraceLens Instance

### One-Command Setup
```bash
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
npm install
docker-compose up -d
```

### Access Your Dashboard
- 🌐 **Dashboard**: http://localhost:3000
- 📡 **API**: http://localhost:3001
- 🗄️ **Database**: PostgreSQL on port 5432
- 🚀 **Cache**: Redis on port 6379

## 🎮 Perfect for AI-Assisted Development

### With Kiro CLI
```bash
# Start TraceLens in your project
kiro-cli "Set up TraceLens monitoring for my Express API"

# Debug with real data
kiro-cli "My /api/users endpoint is slow, what's the bottleneck?"

# Validate fixes
kiro-cli "Did my caching fix improve the response time?"
```

### With Claude Code / Cursor
```javascript
// Give AI tools actual runtime context
const bottleneck = await traceLens.getCriticalPath();
// "The database query in getUserProfile() is taking 340ms"

// Ask targeted questions
// "How can I optimize this specific query that's causing 340ms delays?"
```

## 📊 What You'll See Immediately

### Real-Time Dependency Graph
```
Frontend (120ms) → API Gateway (45ms) → User Service (230ms) → Database (180ms)
                                    ↓
                                Cache (15ms)
                                    ↓
                            External API (340ms) ← BOTTLENECK!
```

### Causal Analysis
- **Critical Path**: External API is blocking 89% of requests
- **Impact**: 340ms added to every user request
- **Solution**: Cache external API responses or find alternative

## 🔧 Development Workflow

### 1. Identify Issues with TraceLens
TraceLens shows you exactly what's slow and why.

### 2. Ask AI Tools Specific Questions
Instead of "My app is slow", ask "How do I optimize this 340ms database query in getUserProfile()?"

### 3. Implement AI-Suggested Fixes
Get targeted solutions for real bottlenecks.

### 4. Validate with TraceLens
Immediately see if your fixes actually worked.

## 💰 Save Money on AI Coding

### Before TraceLens
- ❌ "My app is slow, help me debug" (vague, expensive)
- ❌ Multiple back-and-forth conversations
- ❌ Guessing at solutions
- ❌ Repeated debugging of same issues

### With TraceLens
- ✅ "Optimize this specific 340ms query" (targeted, efficient)
- ✅ One conversation with precise context
- ✅ Data-driven solutions
- ✅ Permanent visibility into performance

## 🛠️ Supported Frameworks

**Frontend**: React, Vue, Angular, Next.js, Nuxt.js, SvelteKit  
**Backend**: Express, Fastify, Koa (Python/Go coming soon)

## 📈 Performance Guarantees

- **Browser SDK**: <1ms overhead
- **Server SDK**: <1ms per request
- **Dashboard**: <2s load time
- **API**: <100ms response time

## 🔒 Privacy & Security

- **Self-Hosted**: Your data never leaves localhost
- **Minimal Data**: Only performance metadata
- **Production Safe**: Non-blocking operation
- **Open Source**: Full transparency

## 🆘 Need Help?

- **Documentation**: [Full docs](../README.md)
- **Examples**: [React & Express demos](../examples/)
- **Issues**: [GitHub Issues](https://github.com/v4mpire/TraceLens/issues)

---

**Ready to stop guessing and start understanding?** 🔍✨

[Back to README](../README.md) | [View Examples](../examples/) | [Join Community](https://github.com/v4mpire/TraceLens/discussions)
