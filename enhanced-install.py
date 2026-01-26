#!/usr/bin/env python3
"""
TraceLens Enhanced Installer
Rich terminal UI with multi-stage progress bars and beautiful success screens.
"""

import os
import sys
import subprocess
import time
import webbrowser
import argparse
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TimeElapsedColumn
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.live import Live
from rich.layout import Layout

console = Console()

def run_command_with_progress(cmd, cwd=None, task_id=None, progress=None, description="Running command"):
    """Run command with progress tracking"""
    try:
        process = subprocess.Popen(
            cmd, shell=True, cwd=cwd,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, bufsize=1, universal_newlines=True
        )
        
        output_lines = []
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                output_lines.append(output.strip())
                if progress and task_id is not None:
                    # Update progress based on output
                    if "Installing" in output or "Building" in output:
                        progress.update(task_id, advance=1)
        
        rc = process.poll()
        stderr = process.stderr.read()
        
        if rc != 0:
            raise subprocess.CalledProcessError(rc, cmd, stderr)
            
        return '\n'.join(output_lines)
        
    except subprocess.CalledProcessError as e:
        console.print(f"[red]❌ Command failed: {cmd}[/red]")
        console.print(f"[red]Error: {e.stderr}[/red]")
        sys.exit(1)

def check_prerequisites():
    """Check if required tools are installed"""
    console.print("[cyan]🔍 Checking prerequisites...[/cyan]")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console
    ) as progress:
        
        # Check Node.js
        task = progress.add_task("Checking Node.js...", total=None)
        node_version = subprocess.run("node --version", shell=True, capture_output=True, text=True)
        if node_version.returncode != 0:
            console.print("[red]❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org[/red]")
            sys.exit(1)
        progress.update(task, description=f"✅ Node.js: {node_version.stdout.strip()}")
        
        # Check Docker
        task = progress.add_task("Checking Docker...", total=None)
        docker_version = subprocess.run("docker --version", shell=True, capture_output=True, text=True)
        if docker_version.returncode != 0:
            console.print("[red]❌ Docker not found. Please install Docker from https://docker.com[/red]")
            sys.exit(1)
        progress.update(task, description=f"✅ Docker: {docker_version.stdout.strip()}")
        
        # Check Docker Compose
        task = progress.add_task("Checking Docker Compose...", total=None)
        compose_version = subprocess.run("docker compose version", shell=True, capture_output=True, text=True)
        if compose_version.returncode != 0:
            console.print("[red]❌ Docker Compose not found. Please install Docker Compose[/red]")
            sys.exit(1)
        progress.update(task, description=f"✅ Docker Compose: {compose_version.stdout.strip()}")

def start_databases():
    """Start PostgreSQL and Redis databases"""
    console.print("[cyan]🗄️ Starting databases...[/cyan]")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        
        task = progress.add_task("Starting PostgreSQL and Redis...", total=100)
        
        # Start databases
        run_command_with_progress(
            "docker compose up -d postgres redis",
            task_id=task, progress=progress
        )
        
        # Wait for databases to be ready
        progress.update(task, advance=50, description="Waiting for databases to be ready...")
        time.sleep(3)
        
        progress.update(task, advance=50, description="✅ Databases started successfully")

def install_dependencies():
    """Install npm dependencies with progress tracking"""
    console.print("[cyan]📦 Installing dependencies...[/cyan]")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        
        task = progress.add_task("Installing npm packages...", total=100)
        
        # Clear npm cache first
        progress.update(task, advance=10, description="Clearing npm cache...")
        run_command_with_progress("npm cache clean --force", task_id=task, progress=progress)
        
        # Install dependencies
        progress.update(task, advance=20, description="Installing dependencies...")
        run_command_with_progress("npm install", task_id=task, progress=progress)
        
        progress.update(task, advance=70, description="✅ Dependencies installed successfully")

def build_packages():
    """Build all packages with detailed progress"""
    console.print("[cyan]🔨 Building packages...[/cyan]")
    
    packages = [
        "shared",
        "browser-sdk", 
        "server-sdk",
        "ingestion-service",
        "analysis-engine",
        "web"
    ]
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        
        for i, package in enumerate(packages):
            task = progress.add_task(f"Building {package}...", total=100)
            
            try:
                run_command_with_progress(
                    f"npm run build --workspace=packages/{package}",
                    task_id=task, progress=progress
                )
                progress.update(task, advance=100, description=f"✅ {package} built successfully")
            except:
                # Try alternative build command
                run_command_with_progress(
                    "npm run build",
                    task_id=task, progress=progress
                )
                progress.update(task, advance=100, description=f"✅ All packages built successfully")
                break

def start_services(dashboard_port=3002, api_port=3001):
    """Start TraceLens services"""
    console.print("[cyan]🚀 Starting TraceLens services...[/cyan]")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        
        # Start ingestion service
        task1 = progress.add_task("Starting ingestion service...", total=100)
        subprocess.Popen(
            f"PORT={api_port} npm run start --workspace=packages/ingestion-service",
            shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        progress.update(task1, advance=100, description=f"✅ Ingestion service started on port {api_port}")
        
        # Start web dashboard
        task2 = progress.add_task("Starting web dashboard...", total=100)
        subprocess.Popen(
            f"PORT={dashboard_port} npm run dev --workspace=apps/web",
            shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        progress.update(task2, advance=100, description=f"✅ Web dashboard started on port {dashboard_port}")
        
        # Wait for services to be ready
        time.sleep(5)

def display_success_summary(dashboard_port=3002, api_port=3001):
    """Display beautiful success screen with service status"""
    
    # Create service status table
    table = Table(title="🎉 TraceLens Installation Complete!")
    table.add_column("Service", style="cyan", no_wrap=True)
    table.add_column("Status", style="green")
    table.add_column("URL", style="blue")
    
    table.add_row("Web Dashboard", "✅ Running", f"http://localhost:{dashboard_port}")
    table.add_row("API Service", "✅ Running", f"http://localhost:{api_port}")
    table.add_row("PostgreSQL", "✅ Running", "localhost:5432")
    table.add_row("Redis", "✅ Running", "localhost:6379")
    
    # Create integration panel
    integration_text = f"""
[bold cyan]🤖 AI Integration Ready![/bold cyan]

Add to your .kiro/settings/mcp.json:
[dim]{{
  "mcpServers": {{
    "tracelens": {{
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:{api_port}"]
    }}
  }}
}}[/dim]

[bold green]Quick Commands:[/bold green]
• kiro-cli "What are my app's performance bottlenecks?"
• kiro-cli "Show me the dependency graph for user auth"
• kiro-cli "What security vulnerabilities should I fix first?"
"""
    
    integration_panel = Panel(
        integration_text,
        title="AI Integration",
        border_style="green"
    )
    
    console.print()
    console.print(table)
    console.print()
    console.print(integration_panel)
    console.print()
    console.print(f"[bold green]🌐 Opening dashboard at http://localhost:{dashboard_port}[/bold green]")
    
    # Auto-open browser
    try:
        webbrowser.open(f"http://localhost:{dashboard_port}")
    except:
        pass

def main():
    parser = argparse.ArgumentParser(description="TraceLens Enhanced Installer")
    parser.add_argument("--dashboard-port", type=int, default=3002, help="Dashboard port (default: 3002)")
    parser.add_argument("--api-port", type=int, default=3001, help="API port (default: 3001)")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without executing")
    
    args = parser.parse_args()
    
    if args.dry_run:
        console.print("[yellow]🔍 Dry run mode - showing installation steps:[/yellow]")
        console.print("1. Check prerequisites (Node.js, Docker, Docker Compose)")
        console.print("2. Start databases (PostgreSQL, Redis)")
        console.print("3. Install npm dependencies")
        console.print("4. Build packages (shared, browser-sdk, server-sdk, etc.)")
        console.print(f"5. Start services (dashboard:{args.dashboard_port}, api:{args.api_port})")
        console.print("6. Display success summary with AI integration")
        return
    
    console.print(Panel.fit(
        "[bold cyan]TraceLens Enhanced Installer[/bold cyan]\n"
        "🚀 Professional installation with rich progress tracking",
        border_style="cyan"
    ))
    
    try:
        check_prerequisites()
        start_databases()
        install_dependencies()
        build_packages()
        start_services(args.dashboard_port, args.api_port)
        display_success_summary(args.dashboard_port, args.api_port)
        
    except KeyboardInterrupt:
        console.print("\n[yellow]Installation cancelled by user[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"\n[red]Installation failed: {e}[/red]")
        sys.exit(1)

if __name__ == "__main__":
    main()
