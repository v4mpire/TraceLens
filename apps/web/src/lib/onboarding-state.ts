'use client';

import { useState, useEffect } from 'react';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  completedSteps: number[];
  lastVisit: Date | null;
}

const ONBOARDING_STORAGE_KEY = 'tracelens-onboarding-state';

const defaultState: OnboardingState = {
  hasCompletedOnboarding: false,
  currentStep: 0,
  completedSteps: [],
  lastVisit: null
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        setState({
          ...parsedState,
          lastVisit: parsedState.lastVisit ? new Date(parsedState.lastVisit) : null
        });
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  }, [state, isLoaded]);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const completeStep = (stepIndex: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...new Set([...prev.completedSteps, stepIndex])],
      currentStep: Math.max(prev.currentStep, stepIndex + 1)
    }));
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      lastVisit: new Date()
    }));
  };

  const resetOnboarding = () => {
    setState(defaultState);
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset onboarding state:', error);
    }
  };

  const shouldShowOnboarding = isLoaded && !state.hasCompletedOnboarding;

  return {
    state,
    isLoaded,
    shouldShowOnboarding,
    updateState,
    completeStep,
    completeOnboarding,
    resetOnboarding
  };
}
