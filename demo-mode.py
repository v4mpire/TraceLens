#!/usr/bin/env python3
"""
TraceLens Demo Mode - Zero Build Time
Perfect for live demos and hackathon judging
"""

import subprocess
import time
import json
import os
import sys
import requests
import webbrowser
from pathlib import Path

def create_demo_html():
    """Create a standalone HTML demo dashboard"""
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TraceLens Dashboard - Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">T</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900">TraceLens Dashboard</h1>
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">DEMO MODE</span>
                    </div>
                    <div class="text-sm text-gray-500">Real-time Performance Monitoring</div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Key Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <i data-lucide="activity" class="w-6 h-6 text-blue-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Response Time</p>
                            <p class="text-2xl font-bold text-gray-900" id="response-time">156ms</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-lg">
                            <i data-lucide="trending-up" class="w-6 h-6 text-green-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Throughput</p>
                            <p class="text-2xl font-bold text-gray-900">1,247 req/min</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-2 bg-orange-100 rounded-lg">
                            <i data-lucide="alert-triangle" class="w-6 h-6 text-orange-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Issues</p>
                            <p class="text-2xl font-bold text-gray-900">3</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow-sm border">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <i data-lucide="cpu" class="w-6 h-6 text-purple-600"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Performance Score</p>
                            <p class="text-2xl font-bold text-gray-900">87/100</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Bottlenecks -->
            <div class="bg-white rounded-lg shadow-sm border mb-8">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-lg font-semibold text-gray-900">Performance Bottlenecks</h2>
                    <p class="text-sm text-gray-600">Critical issues requiring immediate attention</p>
                </div>
                <div class="p-6">
                    <div class="space-y-4" id="bottlenecks-list">
                        <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                            <div class="flex items-center space-x-3">
                                <span class="text-2xl">🔗</span>
                                <div>
                                    <div class="font-medium text-gray-900">Database Query - User Profile</div>
                                    <div class="text-sm text-gray-600">Duration: 340ms | Missing index on user_id</div>
                                    <div class="text-sm text-blue-600">💡 Add index on user_id column</div>
                                </div>
                            </div>
                            <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">85% IMPACT</span>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div class="flex items-center space-x-3">
                                <span class="text-2xl">⚡</span>
                                <div>
                                    <div class="font-medium text-gray-900">API Call - Payment Processing</div>
                                    <div class="text-sm text-gray-600">Duration: 180ms | Slow external API</div>
                                    <div class="text-sm text-blue-600">💡 Implement caching layer</div>
                                </div>
                            </div>
                            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">60% IMPACT</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- AI Integration Demo -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
                <div class="flex items-center space-x-3 mb-4">
                    <div class="p-2 bg-blue-100 rounded-lg">
                        <i data-lucide="brain" class="w-6 h-6 text-blue-600"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">AI Integration Ready</h3>
                </div>
                <p class="text-gray-700 mb-4">TraceLens integrates with AI coding assistants for natural language queries:</p>
                <div class="bg-white rounded-lg p-4 border">
                    <div class="font-mono text-sm">
                        <div class="text-blue-600">$ kiro-cli "What are my app's performance bottlenecks?"</div>
                        <div class="text-gray-700 mt-2">🤖 Your app has 3 critical bottlenecks:</div>
                        <div class="text-gray-700">1. Database query taking 340ms (85% impact)</div>
                        <div class="text-gray-700">2. Payment API taking 180ms (60% impact)</div>
                        <div class="text-gray-700">3. Bundle loading taking 120ms (30% impact)</div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();
        
        // Simulate real-time updates
        function updateMetrics() {
            const responseTime = document.getElementById('response-time');
            const currentTime = parseInt(responseTime.textContent);
            const newTime = currentTime + Math.floor(Math.random() * 20) - 10;
            responseTime.textContent = Math.max(100, newTime) + 'ms';
        }
        
        // Update every 3 seconds
        setInterval(updateMetrics, 3000);
        
        console.log('🚀 TraceLens Demo Dashboard loaded!');
        console.log('📊 This is a demo showing TraceLens capabilities');
        console.log('🔌 API running on http://localhost:3135');
    </script>
</body>
</html>'''
    
    with open('demo-dashboard.html', 'w') as f:
        f.write(html_content)
    
    return 'demo-dashboard.html'

def create_simple_api():
    """Create the simplest possible API server"""
    api_code = '''const http = require('http');
const url = require('url');

const mockData = {
    '/health': { status: 'healthy', timestamp: Date.now(), service: 'tracelens-api' },
    '/api/traces': [
        { id: '1', operation: '/api/users', duration: 340, status: 'slow', timestamp: Date.now() - 60000 },
        { id: '2', operation: '/api/auth', duration: 120, status: 'normal', timestamp: Date.now() - 30000 }
    ],
    '/api/performance/bottlenecks': [{
        operation: 'Database Query - User Profile',
        avgDuration: 340,
        impactPercentage: 85,
        rootCause: 'Missing index on user_id',
        recommendation: 'Add index on user_id column'
    }]
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    const pathname = url.parse(req.url).pathname;
    const data = mockData[pathname];
    
    if (data) {
        res.writeHead(200);
        res.end(JSON.stringify(data));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(3135, () => {
    console.log('🚀 TraceLens API ready on http://localhost:3135');
});'''
    
    with open('demo-api.js', 'w') as f:
        f.write(api_code)
    
    return 'demo-api.js'

def main():
    print("🎬 TraceLens Demo Mode - Zero Build Time!")
    print("=" * 50)
    
    # Create demo files
    print("⚡ Creating demo dashboard...")
    dashboard_file = create_demo_html()
    
    print("⚡ Creating demo API...")
    api_file = create_simple_api()
    
    # Start API
    print("⚡ Starting API server...")
    api_process = subprocess.Popen(['node', api_file], 
                                  stdout=subprocess.DEVNULL, 
                                  stderr=subprocess.DEVNULL)
    
    # Start simple HTTP server for dashboard
    print("⚡ Starting dashboard...")
    dashboard_process = subprocess.Popen(['python3', '-m', 'http.server', '3134'], 
                                       stdout=subprocess.DEVNULL, 
                                       stderr=subprocess.DEVNULL)
    
    time.sleep(2)
    
    # Verify and open
    try:
        response = requests.get('http://localhost:3135/health', timeout=2)
        if response.status_code == 200:
            print("✅ TraceLens Demo Ready!")
            print(f"""
🎯 DEMO URLS:
📊 Dashboard: http://localhost:3134/{dashboard_file}
🔌 API:       http://localhost:3135

🎬 PERFECT FOR:
✅ Live demos (0 build time)
✅ Hackathon judging
✅ Quick evaluation
✅ Screenshots/recordings

🤖 TEST AI INTEGRATION:
kiro-cli "What are my performance bottlenecks?"

⏱️  Total startup: ~5 seconds
""")
            
            # Auto-open browser
            webbrowser.open(f'http://localhost:3134/{dashboard_file}')
            
            try:
                print("⏳ Demo running. Press Ctrl+C to stop.")
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\\n🧹 Stopping demo...")
                api_process.terminate()
                dashboard_process.terminate()
                
                # Cleanup
                for file in [dashboard_file, api_file]:
                    if os.path.exists(file):
                        os.remove(file)
                
                print("👋 Demo stopped!")
        else:
            print("❌ Failed to start API")
            return False
    except:
        print("❌ Failed to verify services")
        return False

if __name__ == "__main__":
    main()
