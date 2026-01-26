'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Activity, Database, Server, Globe } from 'lucide-react';
import { useSystemHealth } from '../../hooks/useSystemHealth';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { health, loading, isAllHealthy } = useSystemHealth();
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // Show continue button after health checks complete
    if (!loading && health) {
      const timer = setTimeout(() => setShowContinue(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading, health]);

  const services = [
    { 
      name: 'Web Dashboard', 
      icon: Globe, 
      status: health?.status.web || 'healthy',
      description: 'Next.js dashboard interface'
    },
    { 
      name: 'Ingestion Service', 
      icon: Server, 
      status: health?.status.ingestion || 'healthy',
      description: 'Event processing and API'
    },
    { 
      name: 'Database', 
      icon: Database, 
      status: health?.status.database || 'healthy',
      description: 'PostgreSQL data storage'
    },
    { 
      name: 'Cache Layer', 
      icon: Activity, 
      status: health?.status.redis || 'healthy',
      description: 'Redis caching system'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Welcome to TraceLens!</h3>
          <p className="text-muted-foreground mt-2">
            TraceLens is now monitoring itself to demonstrate its capabilities. 
            Let&apos;s verify all systems are running properly.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          System Health Check
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.name}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Icon className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {getStatusIcon(service.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {health && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Live Metrics</span>
            <span className="text-sm text-muted-foreground">
              Updated {health.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{health.traceCount}</div>
              <div className="text-sm text-muted-foreground">Traces Collected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{health.responseTime}ms</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{health.uptime}</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      )}

      {showContinue && (
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 text-green-600 mb-4">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">
              {isAllHealthy ? 'All systems operational!' : 'Systems checked'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            TraceLens is now monitoring its own dashboard performance in real-time. 
            Ready to explore the features?
          </p>
        </div>
      )}
    </div>
  );
}
