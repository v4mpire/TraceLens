import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TraceLens
            </h1>
            <p className="text-xl text-muted-foreground">
              Runtime Truth Engine for Web Applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <div className="card text-center space-y-2">
              <Zap className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Performance</h3>
              <p className="text-sm text-muted-foreground">Real-time bottleneck detection</p>
            </div>
            <div className="card text-center space-y-2">
              <Shield className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Runtime vulnerability analysis</p>
            </div>
            <div className="card text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-primary" />
              <h3 className="font-semibold">Insights</h3>
              <p className="text-sm text-muted-foreground">Causal dependency graphs</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-3"
            >
              Open Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Focus on causality over metrics</p>
              <p>• Deterministic analysis of blocking paths</p>
              <p>• &lt;1ms overhead in production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
