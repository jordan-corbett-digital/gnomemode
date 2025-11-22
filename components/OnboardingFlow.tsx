import React, { useEffect } from 'react';
import { useAppState } from '../App';
import OnboardingDevPanel, { ONBOARDING_STEPS } from './OnboardingDevPanel';
import OnboardingStepDemo from './onboarding/OnboardingStepDemo';
import OnboardingStepIntro from './onboarding/OnboardingStepIntro';
import OnboardingStepSlappy from './onboarding/OnboardingStepSlappy';
import OnboardingStepMorningRitualIntro from './onboarding/OnboardingStepMorningRitualIntro';

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
  // Ensure onboardingStep is always valid (default to 1)
  const onboardingStep = state.onboardingStep || 1;

  // Ensure onboardingStep is valid when component mounts - only run once
  useEffect(() => {
    if (!state.onboardingStep || state.onboardingStep < 1) {
      dispatch({ type: 'SET_ONBOARDING_STEP', payload: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleBack = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'intro' });
  };

  const totalSteps = ONBOARDING_STEPS.length;
  const progress = totalSteps > 0 ? (onboardingStep / totalSteps) * 100 : 0;
  const isFullscreenStep = onboardingStep === 1 || onboardingStep === 2 || onboardingStep === 3 || onboardingStep === 4;

  // Render the appropriate step component
  let stepComponent = null;
  if (onboardingStep === 1) {
    stepComponent = <OnboardingStepDemo key="step-1" />;
  } else if (onboardingStep === 2) {
    stepComponent = <OnboardingStepIntro key="step-2" />;
  } else if (onboardingStep === 3) {
    stepComponent = <OnboardingStepSlappy key="step-3" />;
  } else if (onboardingStep === 4) {
    stepComponent = <OnboardingStepMorningRitualIntro key="step-4" />;
  } else {
    stepComponent = (
      <div key={`step-${onboardingStep}`} className="flex flex-col items-center justify-center h-full p-6">
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

  return (
    <>
      {/* Dev Navigation Panel - Always render in same position */}
      <OnboardingDevPanel />
      
      {/* Steps 1, 2, and 3 (demo video, intro video, and Slappy dialogue) should be fullscreen, no padding/background */}
      {isFullscreenStep ? (
        stepComponent
      ) : (
        <div className="h-full w-full flex flex-col p-6 bg-gradient-to-b from-blue-100 to-white">
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
            <div className="w-full mb-8">
              {progress >= 100 ? (
                <div className="text-center text-slate-600 font-semibold py-2">
                  Battles not available in Demo Mode
                </div>
              ) : (
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Step Content */}
          <div className="flex-grow flex flex-col justify-center">
            {stepComponent}
          </div>
        </div>
      )}
    </>
  );
}
