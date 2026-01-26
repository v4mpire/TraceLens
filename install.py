#!/usr/bin/env python3
"""
TraceLens Setup Script
Ultra-fast installation with custom port configuration and AI integration prompts.
"""

import os
import sys
import subprocess
import time
import webbrowser
import argparse
from pathlib import Path

def run_command(cmd, cwd=None, check=True):
    """Run command with error handling"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, check=check, 
                              capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e.stderr}")
        if check:
            sys.exit(1)
        return None

def check_prerequisites():
    """Check if required tools are installed"""
    print("🔍 Checking prerequisites...")
    
    # Check Node.js
    node_version = run_command("node --version", check=False)
    if not node_version:
        print("❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org")
        sys.exit(1)
    print(f"✅ Node.js: {node_version}")
    
    # Check Docker
    docker_version = run_command("docker --version", check=False)
    if not docker_version:
        print("❌ Docker not found. Please install Docker from https://docker.com")
        sys.exit(1)
    print(f"✅ Docker: {docker_version}")
    
    # Check Docker Compose
    compose_version = run_command("docker compose version", check=False)
    if not compose_version:
        print("❌ Docker Compose not found. Please install Docker Compose")
        sys.exit(1)
    print(f"✅ Docker Compose: {compose_version}")

def setup_tracelens(dashboard_port=3002, api_port=3001):
    """Main setup function"""
    print("🚀 Setting up TraceLens...")
    
    # Start databases
    print("📦 Starting databases...")
    run_command("docker compose up -d postgres redis")
    time.sleep(3)
    
    # Install dependencies
    print("📥 Installing dependencies...")
    run_command("npm install")
    
    # Build packages
    print("🔨 Building packages...")
    run_command("npm run build")
    
    # Start services with custom ports
    print(f"🌐 Starting TraceLens (Dashboard: {dashboard_port}, API: {api_port})...")
    
    # Set environment variables for ports
    env = os.environ.copy()
    env['DASHBOARD_PORT'] = str(dashboard_port)
    env['API_PORT'] = str(api_port)
    
    # Start services in background
    subprocess.Popen(f"cd apps/web && PORT={dashboard_port} npm run dev", 
                    shell=True, env=env)
    
    # Wait for services to start
    print("⏳ Waiting for services to start...")
    time.sleep(8)
    
    # Open browser
    dashboard_url = f"http://localhost:{dashboard_port}"
    print(f"🎉 TraceLens is ready!")
    print(f"📊 Dashboard: {dashboard_url}")
    print(f"🔌 API: http://localhost:{api_port}")
    
    webbrowser.open(dashboard_url)
    
    return dashboard_port, api_port

def generate_integration_prompt(dashboard_port, api_port):
    """Generate AI integration prompt"""
    prompt = f"""
🤖 **AI INTEGRATION PROMPT**

Copy and paste this prompt to any coding assistant (Kiro CLI, Claude Code, Cursor) in your project directory:

---

I want to integrate TraceLens observability into my web application. TraceLens is running at:
- Dashboard: http://localhost:{dashboard_port}
- API: http://localhost:{api_port}

Please help me:

1. **Frontend Integration** (2 lines):
   Add TraceLens browser SDK to track performance metrics and user interactions.

2. **Backend Integration** (3 lines):
   Add TraceLens server SDK to trace API calls and database queries.

3. **MCP Integration**:
   Set up Model Context Protocol server for AI-queryable observability.

My project structure:
[Paste your project structure here or describe your framework: React, Next.js, Express, etc.]

Please provide the exact code changes needed for minimal integration with maximum observability value.

---

📋 **QUICK COMMANDS:**

Frontend (React/Next.js):
```bash
npm install @tracelens/browser-sdk
```

Backend (Node.js/Express):
```bash
npm install @tracelens/server-sdk
```

MCP Server:
```bash
npm install -g @tracelens/mcp-server
```

🎯 **INTEGRATION GOAL:** 
Transform "My app is slow" into "This 340ms database query is the bottleneck" with AI-queryable insights.
"""
    return prompt

def main():
    parser = argparse.ArgumentParser(description='TraceLens Setup Script')
    parser.add_argument('--dashboard-port', type=int, default=3002,
                       help='Dashboard port (default: 3002)')
    parser.add_argument('--api-port', type=int, default=3001,
                       help='API port (default: 3001)')
    parser.add_argument('--skip-browser', action='store_true',
                       help='Skip opening browser')
    
    args = parser.parse_args()
    
    print("🔍 TraceLens Setup - Production Ready")
    print("=" * 50)
    
    # Check prerequisites
    check_prerequisites()
    
    # Setup TraceLens
    dashboard_port, api_port = setup_tracelens(args.dashboard_port, args.api_port)
    
    # Generate integration prompt
    integration_prompt = generate_integration_prompt(dashboard_port, api_port)
    
    print("\n" + "=" * 50)
    print("✅ SETUP COMPLETE!")
    print("=" * 50)
    
    print(f"""
🎯 **TRACELENS IS READY**

📊 Dashboard: http://localhost:{dashboard_port}
🔌 API: http://localhost:{api_port}
📚 Docs: http://localhost:{dashboard_port}/docs

🚀 **NEXT STEPS:**

1. Open the dashboard to see TraceLens in action
2. Use the AI integration prompt below in your project
3. Start monitoring your application's performance

{integration_prompt}

💡 **TIPS:**
- Use Kiro CLI: `kiro-cli "What are my app's performance bottlenecks?"`
- Check real-time metrics in the dashboard
- Integrate with 2 lines of frontend + 3 lines of backend code

🎉 **Happy monitoring with TraceLens!**
""")

if __name__ == "__main__":
    main()
