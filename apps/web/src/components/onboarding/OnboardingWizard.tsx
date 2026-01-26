'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOnboardingState } from '../../lib/onboarding-state';
import WelcomeStep from './WelcomeStep';
import TourStep from './TourStep';
import IntegrationStep from './IntegrationStep';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome to TraceLens', component: WelcomeStep },
  { id: 'tour', title: 'Dashboard Tour', component: TourStep },
  { id: 'integration', title: 'Integration Guide', component: IntegrationStep }
];

export default function OnboardingWizard() {
  const { state, shouldShowOnboarding, completeStep, completeOnboarding } = useOnboardingState();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShowOnboarding) {
      // Small delay to ensure proper mounting
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for when shouldShowOnboarding is false
  }, [shouldShowOnboarding]);

  if (!shouldShowOnboarding || !isVisible) {
    return null;
  }

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  if (!currentStep) {
    return null;
  }
  
  const CurrentStepComponent = currentStep.component;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    completeStep(currentStepIndex);
    
    if (isLastStep) {
      completeOnboarding();
      setIsVisible(false);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 bg-background rounded-lg shadow-2xl border animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Skip onboarding"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          <CurrentStepComponent onNext={handleNext} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
