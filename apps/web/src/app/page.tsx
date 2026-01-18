import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp, Activity, Github, ExternalLink } from 'lucide-react';
import { Heading, Text } from '../components/ui/Typography';
import Badge from '../components/ui/Badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Header */}
      <nav className="absolute top-0 w-full z-10 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">TraceLens</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="https://github.com/v4mpire/TraceLens" className="text-sm hover:text-primary transition-colors flex items-center gap-1">
              <Github className="h-4 w-4" />
              GitHub
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Main Heading */}
          <div className="space-y-6 animate-fade-in">
            <Badge variant="info" className="mb-4">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Production Ready • Open Source
            </Badge>
            <Heading level={1} className="text-6xl md:text-7xl bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              TraceLens
            </Heading>
            <Heading level={2} className="text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
              Runtime Truth Engine for Web Applications
            </Heading>
            <Text variant="lead" className="max-w-2xl mx-auto">
              Focus on causality over metrics. Deterministic analysis of blocking paths and runtime-relevant vulnerabilities.
            </Text>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
            <div className="group card hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <p className="text-muted-foreground">Real-time bottleneck detection with &lt;1ms overhead</p>
            </div>
            <div className="group card hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground">Runtime vulnerability analysis and CVE mapping</p>
            </div>
            <div className="group card hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Insights</h3>
              <p className="text-muted-foreground">Causal dependency graphs and root cause analysis</p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Open Dashboard
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="https://github.com/v4mpire/TraceLens"
                className="inline-flex items-center gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <Github className="h-5 w-5" />
                View on GitHub
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            
            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Self-hosted & secure</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Production ready</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Open source</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-6 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ for the developer community • MIT License</p>
      </footer>
    </div>
  );
}
