import React, { useState, useEffect } from 'react';
import { useAppState } from '../App';

/**
 * Step configuration - Add your new onboarding steps here
 * 
 * This makes it easy to manage steps and navigate during development.
 * Each step should have a number, name, and component reference.
 */
export const ONBOARDING_STEPS: Array<{ number: number; name: string; component?: string }> = [
  { number: 1, name: 'Demo Video', component: 'OnboardingStepDemo' },
  { number: 2, name: 'Intro Video', component: 'OnboardingStepIntro' },
  { number: 3, name: 'Slappy Dialogue', component: 'OnboardingStepSlappy' },
  // TODO: Add more onboarding steps here
];

export default function OnboardingDevPanel() {
  const { state, dispatch } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const { onboardingStep } = state;

  // Keyboard shortcuts for dev navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only work if dev panel is open or if holding Shift
      if (e.shiftKey) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (e.key === 'ArrowLeft' && onboardingStep > 1) {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: onboardingStep - 1 });
          } else if (e.key === 'ArrowRight' && onboardingStep < Math.max(ONBOARDING_STEPS.length, 1)) {
            dispatch({ type: 'SET_ONBOARDING_STEP', payload: onboardingStep + 1 });
          }
        }
        // Shift + D to toggle dev panel
        if (e.key === 'D' || e.key === 'd') {
          e.preventDefault();
          setIsOpen(!isOpen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onboardingStep, isOpen, dispatch]);

  const maxSteps = Math.max(ONBOARDING_STEPS.length, 1);

  return (
    <>
      {/* Toggle Button - Always visible in dev */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm transition-colors"
        style={{ zIndex: 9999 }}
      >
        {isOpen ? 'Hide' : 'Dev'} Panel
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-4 rounded-lg shadow-2xl max-w-sm"
          style={{ zIndex: 9999, maxHeight: '70vh', overflowY: 'auto' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Dev Navigation</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 text-xs text-gray-400">
            <p>Current Step: {onboardingStep} / {maxSteps}</p>
            <p className="mt-1">Shortcuts: Shift + ←/→ to navigate, Shift + D to toggle</p>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (onboardingStep > 1) {
                    dispatch({ type: 'SET_ONBOARDING_STEP', payload: onboardingStep - 1 });
                  }
                }}
                disabled={onboardingStep === 1}
                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  if (onboardingStep < maxSteps) {
                    dispatch({ type: 'SET_ONBOARDING_STEP', payload: onboardingStep + 1 });
                  }
                }}
                disabled={onboardingStep >= maxSteps}
                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next →
              </button>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
              }}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
            >
              🏠 Go to Home
            </button>
          </div>

          {ONBOARDING_STEPS.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 mb-2">Jump to Step:</p>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {ONBOARDING_STEPS.map((step) => (
                  <button
                    key={step.number}
                    onClick={() => dispatch({ type: 'SET_ONBOARDING_STEP', payload: step.number })}
                    className={`px-3 py-2 rounded text-sm text-left transition-colors ${
                      onboardingStep === step.number
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                    }`}
                  >
                    <span className="font-mono text-xs">{step.number}.</span> {step.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 p-3 bg-slate-800 rounded">
              <p className="font-semibold mb-1">No steps configured yet</p>
              <p>Add steps to <code className="text-purple-400">ONBOARDING_STEPS</code> in this file to enable navigation.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
