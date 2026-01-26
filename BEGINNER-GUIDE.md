# TraceLens Beginner Guide

Welcome to TraceLens! This guide will help you get started with monitoring your web applications and understanding performance bottlenecks.

## What is TraceLens?

TraceLens is like having a detective for your web application. Instead of just telling you "your app is slow," it shows you exactly why it's slow by tracking how different parts of your application interact with each other.

<details>
<summary><strong>Simple Analogy</strong></summary>

Think of your web application like a restaurant:
- **Traditional monitoring** tells you: "Customers are waiting 10 minutes for food"
- **TraceLens** tells you: "Customers wait 10 minutes because the kitchen takes 8 minutes to cook (the bottleneck) and serving takes 2 minutes"

Now you know to focus on speeding up the kitchen, not the serving.
</details>

## Quick Start (5 Minutes)

### Step 1: Install TraceLens

```bash
# Clone the repository
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens

# Run the installer
python3 install.py --dashboard-port 3002 --api-port 3001
```

The installer will:
1. Check if you have Docker and Node.js installed
2. Start the database services
3. Install all dependencies
4. Build the application
5. Start TraceLens services
6. Open your browser to the dashboard

### Step 2: See TraceLens in Action

When the installer finishes, your browser will open to `http://localhost:3002`. You'll see:

1. **Welcome Screen**: A 3-step onboarding wizard
2. **System Health Check**: All TraceLens services running
3. **Live Demo**: TraceLens monitoring its own dashboard performance
4. **Integration Guide**: Code examples for your framework

### Step 3: Add TraceLens to Your App

<details>
<summary><strong>For React/Next.js Apps</strong></summary>

Add this to your main component file:

```javascript
import { TraceLensSDK } from '@tracelens/browser-sdk';

// Initialize TraceLens
const tracer = new TraceLensSDK({
  projectKey: 'my-awesome-app',
  endpoint: 'http://localhost:3001/api/events'
});

// Start monitoring
tracer.start();
```

That's it! TraceLens will automatically track:
- Page load times
- User interactions
- Network requests
- JavaScript errors
</details>

<details>
<summary><strong>For Express.js Backend</strong></summary>

Add this to your Express server:

```javascript
import { createTraceLensMiddleware } from '@tracelens/server-sdk';
import express from 'express';

const app = express();

// Add TraceLens monitoring
app.use(createTraceLensMiddleware({
  projectKey: 'my-awesome-app',
  endpoint: 'http://localhost:3001/api/traces'
}));

// Your existing routes...
app.get('/api/users', (req, res) => {
  // TraceLens automatically tracks this route
  res.json({ users: [] });
});
```

TraceLens will automatically track:
- API response times
- Database queries
- External API calls
- Error rates
</details>

## Understanding the Dashboard

### Main Dashboard

When you open TraceLens, you'll see several sections:

<details>
<summary><strong>Metrics Grid</strong></summary>

Shows key performance numbers:
- **Response Time**: How long your app takes to respond
- **Error Rate**: Percentage of requests that fail
- **Throughput**: How many requests per second
- **Active Users**: Current users on your app

**What to look for**: High response times or error rates indicate problems.
</details>

<details>
<summary><strong>Dependency Graph</strong></summary>

Visual map showing how parts of your app connect:
- **Green nodes**: Fast components
- **Yellow nodes**: Slow components
- **Red nodes**: Very slow components (bottlenecks)
- **Lines**: Show how components call each other

**What to look for**: Red nodes are your biggest problems to fix first.
</details>

<details>
<summary><strong>Performance Charts</strong></summary>

Timeline showing how performance changes over time:
- **Response Time Chart**: Shows if your app is getting slower
- **Error Rate Chart**: Shows if errors are increasing
- **User Activity**: Shows when your app is busiest

**What to look for**: Sudden spikes indicate when problems started.
</details>

## Common Scenarios

### Scenario 1: "My Website Loads Slowly"

**What TraceLens Shows You:**
```
Homepage Load: 3.2 seconds
├── HTML: 0.1s ✅ Fast
├── CSS: 0.2s ✅ Fast  
├── JavaScript: 2.8s ❌ SLOW!
└── Images: 0.1s ✅ Fast

Problem: JavaScript bundle is too large
```

**How to Fix:**
1. Look at your JavaScript bundle size
2. Remove unused libraries
3. Split code into smaller chunks
4. Use lazy loading for non-critical features

### Scenario 2: "My API is Slow"

**What TraceLens Shows You:**
```
GET /api/products: 1.5 seconds
├── Route handling: 5ms ✅ Fast
├── Database query: 1.4s ❌ SLOW!
├── Data processing: 50ms ✅ Fast
└── Response: 10ms ✅ Fast

Problem: Database query needs optimization
```

**How to Fix:**
1. Add database indexes
2. Optimize your SQL queries
3. Use database query caching
4. Consider pagination for large datasets

### Scenario 3: "Users Report Errors"

**What TraceLens Shows You:**
```
Error Rate: 5% (50 errors in last hour)
├── /api/login: 30 errors ❌ HIGH
├── /api/checkout: 15 errors ⚠️ MEDIUM
└── /api/profile: 5 errors ✅ LOW

Problem: Login API is failing frequently
```

**How to Fix:**
1. Check login API logs
2. Verify database connections
3. Test authentication logic
4. Add better error handling

## AI Integration (Advanced)

TraceLens works with AI coding assistants to give you smart suggestions:

<details>
<summary><strong>Setup AI Integration</strong></summary>

1. Install Kiro CLI (or use Claude Code/Cursor)
2. Add TraceLens MCP server:

```json
// .kiro/settings/mcp.json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001"]
    }
  }
}
```

3. Now you can ask natural language questions:

```bash
kiro-cli "Why is my checkout page slow?"
kiro-cli "What's causing the high error rate?"
kiro-cli "How can I optimize my database queries?"
```
</details>

## Troubleshooting

<details>
<summary><strong>Installation Issues</strong></summary>

**Problem**: "Docker not found"
**Solution**: Install Docker Desktop from https://docker.com

**Problem**: "Node.js not found"  
**Solution**: Install Node.js 18+ from https://nodejs.org

**Problem**: "Port already in use"
**Solution**: Use different ports:
```bash
python3 install.py --dashboard-port 3003 --api-port 3002
```
</details>

<details>
<summary><strong>Dashboard Issues</strong></summary>

**Problem**: "No data showing"
**Solution**: 
1. Make sure you added TraceLens to your app code
2. Check that your app is making requests
3. Verify the endpoint URL matches your API port

**Problem**: "Dashboard won't load"
**Solution**:
1. Check if services are running: `docker ps`
2. Restart TraceLens: `python3 install.py`
3. Check browser console for errors
</details>

## Next Steps

Once you have TraceLens running:

1. **Monitor for a day**: Let TraceLens collect data from real usage
2. **Identify bottlenecks**: Look for red nodes in the dependency graph
3. **Fix the biggest problems first**: Focus on components with highest impact
4. **Measure improvements**: See if your changes actually help
5. **Set up alerts**: Get notified when performance degrades

## Getting Help

- **Documentation**: Check the [main README](README.md) for detailed info
- **Examples**: Look at [examples/](examples/) for integration samples
- **Issues**: Report bugs on [GitHub Issues](https://github.com/v4mpire/TraceLens/issues)
- **Community**: Join discussions on [GitHub Discussions](https://github.com/v4mpire/TraceLens/discussions)

## Key Concepts Summary

- **Causality**: TraceLens shows WHY things are slow, not just THAT they're slow
- **Dependency Graphs**: Visual maps of how your app components connect
- **Critical Path**: The slowest chain of operations blocking your users
- **Self-Monitoring**: TraceLens monitors itself to demonstrate capabilities
- **AI Integration**: Ask natural language questions about your app's performance

**Remember**: TraceLens is designed to be simple. You don't need to be a performance expert to use it effectively. Just look for red nodes in the graphs and fix those first!
