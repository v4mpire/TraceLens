'use client';

import { useState } from 'react';
import { Copy, Check, Code, Zap, Bot } from 'lucide-react';

interface IntegrationStepProps {
  onNext: () => void;
}

export default function IntegrationStep({ onNext }: IntegrationStepProps) {
  const [selectedFramework, setSelectedFramework] = useState('nextjs');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const frameworks = [
    { id: 'nextjs', name: 'Next.js', icon: '⚡' },
    { id: 'react', name: 'React', icon: '⚛️' },
    { id: 'express', name: 'Express', icon: '🚀' },
    { id: 'vanilla', name: 'Vanilla JS', icon: '🌐' }
  ];

  const integrationCode = {
    nextjs: {
      frontend: `// app/layout.tsx
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start();`,
      backend: `// pages/api/middleware.ts
import { createTraceLensMiddleware } from '@tracelens/server-sdk';

export default createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
});`
    },
    react: {
      frontend: `// src/index.tsx
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start();`,
      backend: `// server.js
const { createTraceLensMiddleware } = require('@tracelens/server-sdk');

app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
}));`
    },
    express: {
      frontend: `// public/js/tracelens.js
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start();`,
      backend: `// app.js
const { createTraceLensMiddleware } = require('@tracelens/server-sdk');

app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
}));`
    },
    vanilla: {
      frontend: `<!-- index.html -->
<script type="module">
import { TraceLensSDK } from '@tracelens/browser-sdk';

const tracer = new TraceLensSDK({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/events'
});

tracer.start();
</script>`,
      backend: `// server.js
const { createTraceLensMiddleware } = require('@tracelens/server-sdk');

app.use(createTraceLensMiddleware({
  projectKey: 'your-project-key',
  endpoint: 'http://localhost:3001/api/traces'
}));`
    }
  };

  const aiIntegrationCode = `// .kiro/settings/mcp.json
{
  "mcpServers": {
    "tracelens": {
      "command": "tracelens-mcp",
      "args": ["--endpoint", "http://localhost:3001"]
    }
  }
}`;

  const aiQueries = [
    'kiro-cli "What are my app&apos;s current performance bottlenecks?"',
    'kiro-cli "Show me the dependency graph for user authentication"',
    'kiro-cli "What security vulnerabilities should I fix first?"',
    'kiro-cli "How can I optimize this slow database query?"'
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const selectedCode = integrationCode[selectedFramework as keyof typeof integrationCode];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <Code className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Integration Guide</h3>
          <p className="text-muted-foreground mt-2">
            Add TraceLens to your project with just a few lines of code. 
            Choose your framework and copy the integration code.
          </p>
        </div>
      </div>

      {/* Framework Selection */}
      <div className="space-y-3">
        <h4 className="font-medium">Select Your Framework</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {frameworks.map((framework) => (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`p-3 border rounded-lg text-center transition-all hover:bg-muted/50 ${
                selectedFramework === framework.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted'
              }`}
            >
              <div className="text-2xl mb-1">{framework.icon}</div>
              <div className="text-sm font-medium">{framework.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Integration Code */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Frontend Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">Frontend Integration</h5>
              <button
                onClick={() => copyToClipboard(selectedCode.frontend, 'frontend')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedCode === 'frontend' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedCode === 'frontend' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{selectedCode.frontend}</code>
            </pre>
          </div>

          {/* Backend Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-sm">Backend Integration</h5>
              <button
                onClick={() => copyToClipboard(selectedCode.backend, 'backend')}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedCode === 'backend' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copiedCode === 'backend' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{selectedCode.backend}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* AI Integration */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h4 className="font-medium">AI Integration (Kiro CLI)</h4>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">MCP Configuration</span>
            <button
              onClick={() => copyToClipboard(aiIntegrationCode, 'ai')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedCode === 'ai' ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedCode === 'ai' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
            <code>{aiIntegrationCode}</code>
          </pre>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Example AI Queries</span>
          <div className="space-y-1">
            {aiQueries.map((query, index) => (
              <div key={index} className="text-xs font-mono bg-muted/50 p-2 rounded">
                {query}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-medium text-sm">Quick Start Tips</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Replace &apos;your-project-key&apos; with a unique identifier for your app</li>
              <li>• Ensure TraceLens services are running on the specified ports</li>
              <li>• Check the dashboard for real-time data after integration</li>
              <li>• Use AI queries to get insights about your app&apos;s performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
