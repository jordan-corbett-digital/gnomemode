import React, { useState } from 'react';
import { useAppState } from '../App';
import { useGoalStore } from '../stores/goalStore';

export default function MorningRitualOnboarding() {
  const { dispatch } = useAppState();
  const goalStore = useGoalStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      goalStore.setSelectedGoal(null);
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }
  };

  const handleNext = () => {
    // TODO: Implement step logic
    // For now, when they complete the flow, mark the goal as complete
    if (currentStep === 0) {
      // This is a placeholder - you'll need to implement the actual onboarding steps
      goalStore.completeGoal('morning-ritual');
      goalStore.setSelectedGoal(null);
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }
  };

  return (
    <div 
      className="h-full w-full text-white relative overflow-hidden"
      style={{
        minHeight: '100vh',
      }}
    >
      {/* Background Image */}
      <img 
        src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/morning%20ritual%20onboarding%20(1).png?alt=media&token=b7ca5283-17c4-4ed6-8dbe-077438f108e9"
        alt=""
        className="absolute w-full h-full object-cover"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
        loading="eager"
        decoding="async"
      />

      {/* Content */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Morning Ritual Setup</h1>
          <p className="text-gray-200 mb-8">Set up your morning ritual to start your day right!</p>
          
          {/* Placeholder for onboarding steps */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-white">Onboarding flow coming soon...</p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
            >
              {currentStep === 0 ? 'Back' : 'Previous'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
            >
              {currentStep === 0 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






