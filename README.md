# TraceLens - Runtime Truth Engine for Web Applications

[![GitHub Stars](https://img.shields.io/github/stars/v4mpire/TraceLens?style=social)](https://github.com/v4mpire/TraceLens)
[![npm](https://img.shields.io/npm/v/@tracelens/browser-sdk)](https://www.npmjs.com/package/@tracelens/browser-sdk)
[![npm](https://img.shields.io/npm/v/@tracelens/server-sdk)](https://www.npmjs.com/package/@tracelens/server-sdk)
[![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)](https://www.typescriptlang.org/)
[![Performance](https://img.shields.io/badge/overhead-%3C1ms-brightgreen)](https://github.com/v4mpire/TraceLens)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

TraceLens transforms web application observability by focusing on **causality over metrics**. Instead of showing what happened, TraceLens explains **why it happened** by reconstructing execution order from real runtime signals and building causal dependency graphs.

**🎯 Core Innovation**: Deterministic analysis of blocking paths and runtime-relevant vulnerabilities, replacing guesswork with concrete explanations.

## 🚀 Live Demo & Quick Start

### Try TraceLens Now
```bash
# Install SDKs (published on npm)
npm install @tracelens/browser-sdk @tracelens/server-sdk

# Or deploy your own instance
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
./scripts/deploy.sh
```

### Browser Integration (2 lines)
```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'https://your-tracelens-instance.com/api/events'
});

tracer.start(); // Automatic Web Vitals and performance tracking
```

### Server Integration (Express)
```javascript
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import express from 'express';

const app = express();
app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'https://your-tracelens-instance.com/api/traces'
}));
```

## 📋 What Makes TraceLens Different

| Traditional APM | TraceLens |
|----------------|-----------|
| Shows metrics and logs | **Explains causal relationships** |
| Theoretical security alerts | **Runtime-relevant vulnerabilities** |
| Multiple dashboards | **Single unified view** |
| High overhead monitoring | **<1ms production overhead** |
| Reactive debugging | **Proactive root cause analysis** |

## 🏗️ Architecture

TraceLens uses a modern microservices architecture designed for scale and reliability:

```
Browser/Server SDKs → Ingestion API → Analysis Engine → Interactive Dashboard
                           ↓              ↓
                    PostgreSQL ← Security Scanner → CVE Databases
```

### Core Components

- **Browser SDK**: Lightweight client-side performance monitoring
- **Server SDK**: OpenTelemetry-based backend tracing with dependency analysis
- **Ingestion Service**: High-throughput event processing (10k+ events/sec)
- **Analysis Engine**: Causal graph construction and critical path detection
- **Security Scanner**: Real-time CVE mapping to execution paths
- **Dashboard**: Interactive visualization with D3.js dependency graphs

## 📊 Performance Specifications

### Browser SDK
- **Initialization**: <5ms on main thread
- **Runtime Overhead**: <1ms per event
- **Memory Usage**: <2MB baseline
- **Network Impact**: Batched transmission, <1KB/minute

### Platform Performance
- **API Response**: <100ms for event ingestion
- **Graph Analysis**: <2s for complex dependency graphs
- **Dashboard Load**: <2s initial render
- **Throughput**: 10,000+ events per second per instance

## 🛠️ Development & Integration

### Supported Frameworks

**Frontend**
- React, Vue, Angular, Vanilla JS
- Next.js, Nuxt.js, SvelteKit
- Mobile: React Native (coming soon)

**Backend**
- Node.js (Express, Fastify, Koa)
- Python (Django, Flask) - coming soon
- Go, Java, .NET - coming soon

### Example Integrations

**React Application**
```javascript
// Automatic performance tracking
tracer.track('user-action', {
  action: 'button-click',
  component: 'checkout-form',
  timestamp: Date.now()
});
```

**Express API**
```javascript
// Automatic trace correlation
app.get('/api/users', async (req, res) => {
  // TraceLens automatically captures:
  // - Request timing and metadata
  // - Database query performance  
  // - External API calls
  // - Dependency versions used
  const users = await db.users.findAll();
  res.json(users);
});
```

## 🚀 Deployment Options

### Option 1: One-Command Deployment
```bash
./scripts/deploy.sh deploy
```

### Option 2: Docker Compose
```bash
docker-compose -f docker/production/docker-compose.yml up -d
```

### Option 3: Coolify (VPS)
```bash
# Deploy to your VPS with Coolify
# Uses included coolify.json configuration
```

All deployment options include:
- PostgreSQL database with optimized schema
- Redis caching for performance
- Nginx reverse proxy with rate limiting
- Automated health checks and monitoring
- SSL/TLS support ready

## 📚 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Integration Examples](examples/)** - React and Express samples
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 Examples & Demos

### Live Examples
- **[React Demo App](examples/react-app/)** - Complete frontend integration
- **[Express API Demo](examples/express-api/)** - Backend tracing example
- **[Integration Tests](tests/)** - End-to-end validation

### Key Use Cases
1. **Performance Debugging**: Identify exact bottlenecks in user journeys
2. **Security Assessment**: Focus on vulnerabilities that actually matter
3. **Dependency Analysis**: Understand runtime package usage and risks
4. **Root Cause Analysis**: Trace issues from symptom to source

## 🔒 Security & Privacy

- **Self-Hosted**: Your data never leaves your infrastructure
- **Minimal Data**: Only collects performance and dependency metadata
- **PII Protection**: Automatic sanitization of sensitive information
- **Production Safe**: Non-blocking operation with <1ms overhead
- **Open Source**: Full transparency and auditability

## 🤝 Contributing

TraceLens is built with systematic development practices:

1. **Follow [CHECKPOINTS.md](CHECKPOINTS.md)** - Systematic development phases
2. **Use Kiro CLI** - AI-assisted development workflow  
3. **Validate Performance** - Every change must maintain <1ms overhead
4. **Test Thoroughly** - Unit, integration, and performance tests
5. **Document Changes** - Update relevant documentation

### Development Setup
```bash
# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev

# Run tests
npm test
```

## 📈 Roadmap

### Q1 2026
- [ ] Python SDK (Django, Flask)
- [ ] Advanced alerting and notifications
- [ ] Custom dashboard widgets
- [ ] API integrations (Slack, PagerDuty)

### Q2 2026  
- [ ] Go and Java SDKs
- [ ] Machine learning insights
- [ ] Multi-tenant architecture
- [ ] Enterprise SSO integration

### Q3 2026
- [ ] React Native mobile SDK
- [ ] Real-time collaboration features
- [ ] Advanced security scanning
- [ ] Plugin marketplace

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [OpenTelemetry](https://opentelemetry.io/) for distributed tracing
- [D3.js](https://d3js.org/) for interactive visualizations  
- [Next.js](https://nextjs.org/) for the dashboard
- [PostgreSQL](https://postgresql.org/) for data storage
- [Kiro CLI](https://kiro.dev/) for AI-assisted development

---

**Ready to transform your observability?** 

[Get Started](docs/QUICKSTART.md) | [View Examples](examples/) | [Deploy Now](docs/DEPLOYMENT.md)

**TraceLens: Because understanding WHY matters more than knowing WHAT.** 🔍✨
