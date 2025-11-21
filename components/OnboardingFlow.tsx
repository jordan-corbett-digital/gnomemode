import React from 'react';
import { useAppState } from '../App';
import OnboardingDevPanel, { ONBOARDING_STEPS } from './OnboardingDevPanel';
import OnboardingStepDemo from './onboarding/OnboardingStepDemo';
import OnboardingStepIntro from './onboarding/OnboardingStepIntro';
import OnboardingStepSlappy from './onboarding/OnboardingStepSlappy';

/**
 * Onboarding Flow - Ready for new implementation
 * 
 * This is a clean slate for building your new onboarding flow.
 * Use the dev panel (bottom-right button) to navigate between steps during development.
 * 
 * Steps are configured in OnboardingDevPanel.tsx
 */
export default function OnboardingFlow() {
  const { state, dispatch } = useAppState();
  const { onboardingStep } = state;

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'intro' });
  };

  const renderStep = () => {
    switch (onboardingStep) {
      case 1:
        return <OnboardingStepDemo />;
      case 2:
        return <OnboardingStepIntro />;
      case 3:
        return <OnboardingStepSlappy />;
      default:
        // Placeholder for future steps
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h1 className="text-4xl font-bold mb-4 text-slate-900">Onboarding Step {onboardingStep}</h1>
            <p className="text-lg text-slate-600 text-center max-w-md">
              This is a placeholder. Start building your new onboarding flow here!
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Use the Dev Panel (bottom-right) to navigate between steps.
            </p>
          </div>
        );
    }
  };
  
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = totalSteps > 0 ? (onboardingStep / totalSteps) * 100 : 0;

  // Steps 1, 2, and 3 (demo video, intro video, and Slappy dialogue) should be fullscreen, no padding/background
  if (onboardingStep === 1 || onboardingStep === 2 || onboardingStep === 3) {
    return (
      <>
        <OnboardingDevPanel />
        {renderStep()}
      </>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-6 bg-gradient-to-b from-blue-100 to-white">
      {/* Dev Navigation Panel */}
      <OnboardingDevPanel />
      
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-40 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
        style={{ zIndex: 40 }}
      >
        ← Back
      </button>
      
      {/* Progress Bar */}
      {totalSteps > 0 && (
        <div className="w-full bg-blue-200 rounded-full h-2.5 mb-8">
          <div 
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Step Content */}
        <div className="flex-grow flex flex-col justify-center">
            {renderStep()}
        </div>
    </div>
  );
}
