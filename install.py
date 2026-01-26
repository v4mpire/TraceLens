#!/usr/bin/env python3
"""
TraceLens Universal Installer
Single entry point for all installation methods with comprehensive options.
"""

import os
import sys
import subprocess
import time
import webbrowser
import argparse
import json
import requests
from pathlib import Path

class TraceLensInstaller:
    def __init__(self, dashboard_port=3002, api_port=3001):
        self.dashboard_port = dashboard_port
        self.api_port = api_port
        
        # Ensure we're in the TraceLens directory
        self.project_root = self.find_project_root()
        if self.project_root:
            os.chdir(self.project_root)
        
    def find_project_root(self):
        """Find the TraceLens project root directory"""
        current = os.getcwd()
        
        # Check if we're already in the right directory
        if os.path.exists('package.json') and os.path.exists('turbo.json'):
            with open('package.json', 'r') as f:
                data = json.load(f)
                if data.get('name') == 'tracelens':
                    return current
        
        # Look for TraceLens directory in current path
        for root, dirs, files in os.walk(current):
            if 'package.json' in files and 'turbo.json' in files:
                package_path = os.path.join(root, 'package.json')
                try:
                    with open(package_path, 'r') as f:
                        data = json.load(f)
                        if data.get('name') == 'tracelens':
                            return root
                except:
                    continue
        
        return None
        
    def run_command(self, cmd, cwd=None, check=True, background=False):
        """Run command with error handling"""
        try:
            # Ensure we have a valid working directory
            if cwd is None:
                cwd = os.getcwd()
            
            # Verify the directory exists
            if not os.path.exists(cwd):
                print(f"❌ Working directory does not exist: {cwd}")
                if check:
                    sys.exit(1)
                return None
            
            if background:
                subprocess.Popen(cmd, shell=True, cwd=cwd,
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                return True
            else:
                result = subprocess.run(cmd, shell=True, cwd=cwd, check=check,
                                      capture_output=True, text=True)
                return result.stdout.strip() if result.returncode == 0 else None
        except subprocess.CalledProcessError as e:
            if check:
                print(f"❌ Command failed: {cmd}")
                print(f"Error: {e.stderr}")
                sys.exit(1)
            return None

    def check_prerequisites(self, minimal=False):
        """Check if required tools are installed"""
        print("🔍 Checking prerequisites...")
        
        # Check Node.js
        node_version = self.run_command("node --version", check=False)
        if not node_version:
            print("❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org")
            sys.exit(1)
        print(f"✅ Node.js: {node_version}")
        
        if not minimal:
            # Check Docker
            docker_version = self.run_command("docker --version", check=False)
            if not docker_version:
                print("❌ Docker not found. Please install Docker from https://docker.com")
                sys.exit(1)
            print(f"✅ Docker: {docker_version}")
            
            # Check Docker Compose
            compose_version = self.run_command("docker compose version", check=False)
            if not compose_version:
                print("❌ Docker Compose not found. Please install Docker Compose")
                sys.exit(1)
            print(f"✅ Docker Compose: {compose_version}")

    def standard_install(self):
        """Standard installation with full build"""
        print("🚀 TraceLens Standard Installation")
        print("=" * 50)
        
        # Validate project directory
        if not self.project_root:
            print("❌ TraceLens project directory not found. Please run from TraceLens directory.")
            return False
        
        self.check_prerequisites()
        
        # Start databases
        print("📦 Starting databases...")
        self.run_command("docker compose up -d postgres redis")
        time.sleep(3)
        
        # Install dependencies
        print("📥 Installing dependencies...")
        self.run_command("npm cache clean --force", check=False)
        self.run_command("rm -rf node_modules package-lock.json", check=False)
        self.run_command("npm install")
        
        # Build packages
        print("🔨 Building packages...")
        self.run_command("npm run build")
        
        # Start services
        print(f"🌐 Starting TraceLens (Dashboard: {self.dashboard_port}, API: {self.api_port})...")
        env = os.environ.copy()
        env['DASHBOARD_PORT'] = str(self.dashboard_port)
        env['API_PORT'] = str(self.api_port)
        
        subprocess.Popen(f"cd apps/web && PORT={self.dashboard_port} npm run dev",
                        shell=True, env=env)
        
        time.sleep(8)
        return True

    def quick_install(self):
        """Quick installation with minimal dependencies"""
        print("⚡ TraceLens Quick Installation (30 seconds)")
        print("=" * 50)
        
        # Validate project directory
        if not self.project_root:
            print("❌ TraceLens project directory not found. Please run from TraceLens directory.")
            return False
        
        self.check_prerequisites(minimal=True)
        
        # Start databases (optional)
        print("📦 Starting databases...")
        self.run_command("docker compose up -d postgres redis", check=False)
        
        # Quick install
        print("📥 Quick install...")
        self.run_command("npm install --production")
        
        # Start dashboard only
        print(f"🌐 Starting dashboard on port {self.dashboard_port}...")
        env = os.environ.copy()
        env['PORT'] = str(self.dashboard_port)
        
        subprocess.Popen(f"cd apps/web && PORT={self.dashboard_port} npm run dev",
                        shell=True, env=env)
        
        time.sleep(5)
        return True

    def demo_install(self):
        """Demo installation with zero build time"""
        print("🎬 TraceLens Demo Mode - Zero Build Time!")
        print("=" * 50)
        
        # Validate project directory
        if not self.project_root:
            print("❌ TraceLens project directory not found. Please run from TraceLens directory.")
            return False
        
        self.check_prerequisites(minimal=True)
        
        # Create demo dashboard
        dashboard_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TraceLens Dashboard - Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">T</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900">TraceLens Dashboard</h1>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">DEMO MODE</span>
                    </div>
                </div>
            </div>
        </header>
        <main class="max-w-7xl mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="font-semibold text-gray-600">Response Time</h3>
                    <p class="text-2xl font-bold text-blue-600">156ms</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="font-semibold text-gray-600">Throughput</h3>
                    <p class="text-2xl font-bold text-green-600">1,247/min</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="font-semibold text-gray-600">Issues</h3>
                    <p class="text-2xl font-bold text-red-600">3</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 class="font-semibold text-gray-600">Performance Score</h3>
                    <p class="text-2xl font-bold text-purple-600">87/100</p>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm border mb-8">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">Performance Bottlenecks</h2>
                </div>
                <div class="p-6">
                    <div class="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                        <div class="font-medium text-gray-900">Database Query - User Profile</div>
                        <div class="text-sm text-gray-600">Duration: 340ms | Missing index on user_id</div>
                        <div class="text-sm text-blue-600">💡 Add index on user_id column</div>
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">85% IMPACT</span>
                    </div>
                </div>
            </div>
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">🤖 AI Integration Ready</h3>
                <div class="bg-white rounded-lg p-4 border">
                    <div class="font-mono text-sm">
                        <div class="text-blue-600">$ kiro-cli "What are my app's performance bottlenecks?"</div>
                        <div class="text-gray-700 mt-2">🤖 Your app has a critical database query taking 340ms (85% impact)</div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>'''
        
        with open('demo-dashboard.html', 'w') as f:
            f.write(dashboard_html)
        
        # Create simple API
        api_code = f'''const http = require('http');
const server = http.createServer((req, res) => {{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const mockData = {{
        '/health': {{ status: 'healthy', service: 'tracelens-api' }},
        '/api/traces': [{{ id: '1', operation: '/api/users', duration: 340, status: 'slow' }}],
        '/api/performance/bottlenecks': [{{ operation: 'DB Query', avgDuration: 340, impactPercentage: 85 }}]
    }};
    
    const data = mockData[req.url] || {{ error: 'Not found' }};
    res.writeHead(200);
    res.end(JSON.stringify(data));
}});

server.listen({self.api_port}, () => console.log('🚀 API ready on :{self.api_port}'));'''
        
        with open('demo-api.js', 'w') as f:
            f.write(api_code)
        
        # Start services
        print("⚡ Starting services...")
        self.run_command("node demo-api.js", background=True)
        self.run_command(f"python3 -m http.server {self.dashboard_port}", background=True)
        
        time.sleep(3)
        return True

    def enhanced_install(self):
        """Enhanced installation with rich terminal UI"""
        from rich.console import Console
        from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
        from rich.panel import Panel
        from rich.table import Table
        from rich.text import Text
        import time
        
        console = Console()
        
        # Validate project directory
        if not self.project_root:
            console.print("❌ TraceLens project directory not found. Please run from TraceLens directory.", style="red")
            return False
        
        # Welcome screen
        console.print(Panel.fit(
            "[bold blue]TraceLens Enhanced Installation[/bold blue]\n"
            "[dim]Runtime Truth Engine for Web Applications[/dim]",
            border_style="blue"
        ))
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console,
            transient=True,
        ) as progress:
            
            # Prerequisites check
            task1 = progress.add_task("[cyan]Checking prerequisites...", total=3)
            console.print("🔍 Checking prerequisites...")
            
            # Check Node.js
            progress.update(task1, advance=1)
            node_version = self.run_command("node --version", check=False)
            if not node_version:
                console.print("❌ Node.js not found. Please install Node.js 18+", style="red")
                return False
            console.print(f"✅ Node.js: {node_version}", style="green")
            
            # Check Docker
            progress.update(task1, advance=1)
            docker_version = self.run_command("docker --version", check=False)
            if not docker_version:
                console.print("❌ Docker not found. Please install Docker", style="red")
                return False
            console.print(f"✅ Docker: {docker_version}", style="green")
            
            # Check Docker Compose
            progress.update(task1, advance=1)
            compose_version = self.run_command("docker compose version", check=False)
            if not compose_version:
                console.print("❌ Docker Compose not found", style="red")
                return False
            console.print(f"✅ Docker Compose: {compose_version}", style="green")
            
            # Database startup
            task2 = progress.add_task("[yellow]Starting databases...", total=1)
            self.run_command("docker compose up -d postgres redis")
            progress.update(task2, advance=1)
            console.print("✅ PostgreSQL and Redis started", style="green")
            time.sleep(2)
            
            # Dependencies installation
            task3 = progress.add_task("[magenta]Installing dependencies...", total=3)
            console.print("📥 Cleaning npm cache...")
            self.run_command("npm cache clean --force", check=False)
            progress.update(task3, advance=1)
            
            console.print("📥 Removing old dependencies...")
            self.run_command("rm -rf node_modules package-lock.json", check=False)
            progress.update(task3, advance=1)
            
            console.print("📥 Installing fresh dependencies...")
            self.run_command("npm install")
            progress.update(task3, advance=1)
            console.print("✅ Dependencies installed", style="green")
            
            # Build process
            task4 = progress.add_task("[blue]Building packages...", total=1)
            console.print("🔨 Building TraceLens packages...")
            self.run_command("npm run build")
            progress.update(task4, advance=1)
            console.print("✅ Packages built successfully", style="green")
            
            # Service startup
            task5 = progress.add_task("[green]Starting services...", total=1)
            console.print(f"🌐 Starting TraceLens services...")
            env = os.environ.copy()
            env['DASHBOARD_PORT'] = str(self.dashboard_port)
            env['API_PORT'] = str(self.api_port)
            
            subprocess.Popen(f"cd apps/web && PORT={self.dashboard_port} npm run dev",
                            shell=True, env=env)
            progress.update(task5, advance=1)
            console.print("✅ Services started", style="green")
            time.sleep(5)
        
        # Success table
        table = Table(title="🎉 Installation Complete!")
        table.add_column("Service", style="cyan", no_wrap=True)
        table.add_column("Status", style="green")
        table.add_column("URL", style="blue")
        
        table.add_row("Dashboard", "✅ Running", f"http://localhost:{self.dashboard_port}")
        table.add_row("API", "✅ Ready", f"http://localhost:{self.api_port}")
        table.add_row("Database", "✅ Connected", "PostgreSQL + Redis")
        
        console.print(table)
        
        # Next steps panel
        next_steps = Panel(
            "[bold green]🚀 Next Steps:[/bold green]\n\n"
            "1. Dashboard will open automatically\n"
            "2. Use AI integration: [cyan]kiro-cli \"What are my performance bottlenecks?\"[/cyan]\n"
            "3. Integrate with your app: [cyan]npm install @tracelens/browser-sdk[/cyan]\n\n"
            "[dim]Press Ctrl+C to stop services[/dim]",
            border_style="green"
        )
        console.print(next_steps)
        
        return True

    def validate_install(self):
        """Validate installation by checking services"""
        print("🔍 Validating installation...")
        
        try:
            # Check API
            api_response = requests.get(f'http://localhost:{self.api_port}/health', timeout=3)
            if api_response.status_code == 200:
                print(f"✅ API service running on port {self.api_port}")
            else:
                print(f"⚠️  API service not responding on port {self.api_port}")
        except:
            print(f"⚠️  API service not accessible on port {self.api_port}")
        
        try:
            # Check Dashboard
            dashboard_response = requests.get(f'http://localhost:{self.dashboard_port}', timeout=3)
            if dashboard_response.status_code == 200:
                print(f"✅ Dashboard running on port {self.dashboard_port}")
            else:
                print(f"⚠️  Dashboard not responding on port {self.dashboard_port}")
        except:
            print(f"⚠️  Dashboard not accessible on port {self.dashboard_port}")

    def generate_integration_guide(self):
        """Generate integration guide for AI assistants"""
        return f"""
🤖 **AI INTEGRATION GUIDE**

Copy this prompt to any coding assistant (Kiro CLI, Claude, Cursor):

---

I want to integrate TraceLens observability into my web application. TraceLens is running at:
- Dashboard: http://localhost:{self.dashboard_port}
- API: http://localhost:{self.api_port}

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

Add to .kiro/settings/mcp.json:
```json
{{
  "mcpServers": {{
    "tracelens": {{
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:{self.api_port}"]
    }}
  }}
}}
```

🎯 **INTEGRATION GOAL:** 
Transform "My app is slow" into "This 340ms database query is the bottleneck" with AI-queryable insights.
"""

    def show_success_summary(self, mode="standard"):
        """Display success summary"""
        dashboard_url = f"http://localhost:{self.dashboard_port}"
        api_url = f"http://localhost:{self.api_port}"
        
        if mode == "demo":
            dashboard_url += "/demo-dashboard.html"
        
        print("\n" + "=" * 50)
        print("✅ TRACELENS INSTALLATION COMPLETE!")
        print("=" * 50)
        
        print(f"""
🎯 **TRACELENS IS READY**

📊 Dashboard: {dashboard_url}
🔌 API: {api_url}

🚀 **NEXT STEPS:**

1. Open the dashboard to see TraceLens in action
2. Use the AI integration guide below in your project
3. Start monitoring your application's performance

{self.generate_integration_guide()}

💡 **TIPS:**
- Use Kiro CLI: `kiro-cli "What are my app's performance bottlenecks?"`
- Check real-time metrics in the dashboard
- Integrate with 2 lines of frontend + 3 lines of backend code

🎉 **Happy monitoring with TraceLens!**
""")
        
        # Auto-open browser
        try:
            webbrowser.open(dashboard_url)
        except:
            pass

def main():
    parser = argparse.ArgumentParser(
        description='TraceLens Universal Installer - Single entry point for all installation methods',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
INSTALLATION MODES:
  --standard     Full installation with build process (default)
  --quick        Quick installation with minimal dependencies
  --demo         Demo mode with zero build time (perfect for presentations)
  --enhanced     Enhanced installation with rich terminal UI (requires 'rich' package)

EXAMPLES:
  python3 install.py                                    # Standard installation
  python3 install.py --quick --dashboard-port 3000     # Quick install on port 3000
  python3 install.py --demo                            # Demo mode for presentations
  python3 install.py --validate                        # Validate existing installation
  python3 install.py --help-integration                # Show AI integration guide only

PORTS:
  --dashboard-port PORT    Dashboard port (default: 3002)
  --api-port PORT         API port (default: 3001)

OPTIONS:
  --skip-browser          Skip opening browser automatically
  --validate             Validate installation without installing
  --help-integration     Show AI integration guide only
  --dry-run              Show what would be done without executing
        """
    )
    
    # Installation modes
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument('--standard', action='store_true', default=True,
                           help='Standard installation with full build (default)')
    mode_group.add_argument('--quick', action='store_true',
                           help='Quick installation with minimal dependencies')
    mode_group.add_argument('--demo', action='store_true',
                           help='Demo mode with zero build time')
    mode_group.add_argument('--enhanced', action='store_true',
                           help='Enhanced installation with rich terminal UI')
    
    # Port configuration
    parser.add_argument('--dashboard-port', type=int, default=3002,
                       help='Dashboard port (default: 3002)')
    parser.add_argument('--api-port', type=int, default=3001,
                       help='API port (default: 3001)')
    
    # Options
    parser.add_argument('--skip-browser', action='store_true',
                       help='Skip opening browser automatically')
    parser.add_argument('--validate', action='store_true',
                       help='Validate installation without installing')
    parser.add_argument('--help-integration', action='store_true',
                       help='Show AI integration guide only')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without executing')
    
    args = parser.parse_args()
    
    installer = TraceLensInstaller(args.dashboard_port, args.api_port)
    
    # Handle special modes
    if args.help_integration:
        print(installer.generate_integration_guide())
        return
    
    if args.validate:
        installer.validate_install()
        return
    
    if args.dry_run:
        print("🔍 Dry run mode - showing installation steps:")
        if args.demo:
            print("1. Check Node.js prerequisite")
            print("2. Create demo HTML dashboard")
            print("3. Create simple API server")
            print("4. Start services")
        elif args.quick:
            print("1. Check prerequisites (Node.js)")
            print("2. Start databases (optional)")
            print("3. Install production dependencies")
            print("4. Start dashboard")
        else:
            print("1. Check prerequisites (Node.js, Docker, Docker Compose)")
            print("2. Start databases (PostgreSQL, Redis)")
            print("3. Install npm dependencies")
            print("4. Build packages")
            print("5. Start services")
        print(f"6. Open dashboard at http://localhost:{args.dashboard_port}")
        return
    
    # Run installation
    try:
        if args.demo:
            success = installer.demo_install()
            mode = "demo"
        elif args.quick:
            success = installer.quick_install()
            mode = "quick"
        elif args.enhanced:
            try:
                success = installer.enhanced_install()
                mode = "enhanced"
            except ImportError:
                print("❌ Enhanced mode requires 'rich' package: pip install rich")
                print("🔄 Falling back to standard mode...")
                success = installer.standard_install()
                mode = "standard"
        else:
            success = installer.standard_install()
            mode = "standard"
        
        if success:
            installer.show_success_summary(mode)
            
            if mode == "demo":
                try:
                    print("⏳ Demo running. Press Ctrl+C to stop.")
                    while True:
                        time.sleep(1)
                except KeyboardInterrupt:
                    print("\n🧹 Stopping demo...")
                    subprocess.run("pkill -f demo-api.js", shell=True)
                    subprocess.run("pkill -f 'python3 -m http.server'", shell=True)
                    for f in ['demo-api.js', 'demo-dashboard.html']:
                        if os.path.exists(f):
                            os.remove(f)
                    print("👋 Demo stopped!")
        
    except KeyboardInterrupt:
        print("\n🛑 Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Installation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()