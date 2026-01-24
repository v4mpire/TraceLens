# @tracelens-integrate

Automatically integrate TraceLens observability into this project. Analyze the codebase, detect frameworks, and implement the appropriate TraceLens SDKs with proper configuration.

## What This Does

1. **Analyzes your project** - Detects React, Vue, Angular, Express, Next.js, etc.
2. **Installs TraceLens packages** - Adds browser-sdk and server-sdk
3. **Integrates frontend monitoring** - 2 lines of code for Web Vitals tracking
4. **Integrates backend tracing** - 3 lines of code for API monitoring
5. **Sets up AI integration** - Configures MCP for natural language queries
6. **Creates environment config** - Proper env vars for all environments
7. **Adds TypeScript support** - If your project uses TypeScript
8. **Updates documentation** - Adds TraceLens section to your README

## Expected Result

After integration, you'll be able to:
- 📊 See real-time performance data at http://localhost:3000
- 🤖 Ask AI: "What are my app's performance bottlenecks?"
- 🎯 Get specific answers: "Your /api/users endpoint takes 340ms"
- ⚡ Debug issues 10x faster with precise context
- 💰 Reduce AI debugging costs by 80%

## Prerequisites

Ensure TraceLens is running:
```bash
git clone https://github.com/v4mpire/TraceLens.git
cd TraceLens
python3 install.py
```

## Usage

Simply use this prompt and I'll handle the complete integration automatically based on your project structure.
