'use client';

import { useState } from 'react';
import { Play, BarChart3, Network, Activity, Eye } from 'lucide-react';

interface TourStepProps {
  onNext: () => void;
}

export default function TourStep({ onNext }: TourStepProps) {
  const [currentTourStep, setCurrentTourStep] = useState(0);

  const tourSteps = [
    {
      title: 'Real-Time Metrics',
      icon: BarChart3,
      description: 'Monitor performance metrics as they happen',
      highlight: 'metrics-grid',
      content: 'The metrics grid shows live performance data including response times, error rates, and throughput. TraceLens is currently monitoring its own dashboard performance.'
    },
    {
      title: 'Dependency Graph', 
      icon: Network,
      description: 'Visualize component relationships and bottlenecks',
      highlight: 'dependency-graph',
      content: 'The dependency graph reveals how components interact and where bottlenecks occur. Critical paths are highlighted to show what&apos;s blocking performance.'
    },
    {
      title: 'Performance Charts',
      icon: Activity, 
      description: 'Track trends and identify patterns over time',
      highlight: 'performance-chart',
      content: 'Performance charts show historical trends and help identify patterns. You can spot performance degradations before they impact users.'
    },
    {
      title: 'Self-Monitoring',
      icon: Eye,
      description: 'TraceLens monitoring itself in real-time',
      highlight: 'self-monitoring-banner',
      content: 'TraceLens is currently monitoring its own dashboard, demonstrating real observability capabilities. This proves the platform works before you integrate it.'
    }
  ];

  const currentStep = tourSteps[currentTourStep];
  if (!currentStep) {
    return null;
  }
  
  const Icon = currentStep.icon;

  const handleStartTour = () => {
    // In a real implementation, this would use react-joyride or similar
    // For now, we'll simulate the tour steps
    if (currentTourStep < tourSteps.length - 1) {
      setCurrentTourStep(prev => prev + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Interactive Dashboard Tour</h3>
          <p className="text-muted-foreground mt-2">
            Let&apos;s explore the key features of TraceLens with live data from the dashboard monitoring itself.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
            {currentTourStep + 1}
          </div>
          <div>
            <h4 className="font-semibold">{currentStep.title}</h4>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>
        </div>
        
        <div className="pl-11">
          <p className="text-sm leading-relaxed">{currentStep.content}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tourSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentTourStep;
          const isCompleted = index < currentTourStep;
          
          return (
            <div
              key={step.title}
              className={`p-4 border rounded-lg text-center transition-all ${
                isActive 
                  ? 'border-primary bg-primary/5' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-muted'
              }`}
            >
              <StepIcon className={`h-6 w-6 mx-auto mb-2 ${
                isActive 
                  ? 'text-primary' 
                  : isCompleted 
                    ? 'text-green-500' 
                    : 'text-muted-foreground'
              }`} />
              <div className="text-sm font-medium">{step.title}</div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={handleStartTour}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Play className="h-4 w-4" />
          {currentTourStep === 0 ? 'Start Tour' : 
           currentTourStep < tourSteps.length - 1 ? 'Next Feature' : 'Complete Tour'}
        </button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          The tour will highlight each feature on the actual dashboard. 
          You&apos;ll see real performance data from TraceLens monitoring itself.
        </p>
      </div>
    </div>
  );
}
