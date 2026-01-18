# 🚀 Quick Start Guide

## What is TraceLens?

TraceLens is a **Runtime Truth Engine** that explains **WHY** performance issues happen in web applications, not just what happened. It builds causal dependency graphs from real runtime signals to identify true blocking paths and runtime-relevant security vulnerabilities.

## 🎯 Problem It Solves

- **Traditional APM**: Shows metrics and logs → **TraceLens**: Explains causal relationships
- **Guesswork debugging** → **Deterministic root cause analysis**
- **Multiple monitoring tools** → **Single unified observability platform**
- **High overhead monitoring** → **<1ms production overhead**

## ⚡ One-Command Setup

```bash
# Clone and start
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
docker-compose up -d
```

**That's it!** 🎉

- **Dashboard**: http://localhost:3000
- **API**: http://localhost:3001

## 📋 Requirements

- **Docker** and **Docker Compose**
- **4GB RAM** minimum
- **Node.js 18+** (for development)

## 🔧 Development Setup

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🧪 Integration Examples

### Browser (2 lines)
```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  endpoint: 'http://localhost:3001/api/events'
});
tracer.start();
```

### Server (Express)
```javascript
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

app.use(createTraceLensMiddleware({
  endpoint: 'http://localhost:3001/api/traces'
}));
```

## 🏗️ Architecture

```
Browser/Server SDKs → Ingestion API → Analysis Engine → Dashboard
                           ↓              ↓
                    PostgreSQL ← Security Scanner → CVE Database
```

## 📊 What You Get

- **Performance Dashboard**: Real-time bottleneck detection
- **Security Analysis**: Runtime vulnerability mapping  
- **Dependency Graphs**: Interactive causal relationships
- **Trace Analysis**: End-to-end request flow visualization

## 🔒 Privacy & Security

- **Self-hosted**: Your data never leaves your infrastructure
- **Minimal collection**: Only performance and dependency metadata
- **Production safe**: <1ms overhead, non-blocking operation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**TraceLens: Because understanding WHY matters more than knowing WHAT.** 🔍✨
