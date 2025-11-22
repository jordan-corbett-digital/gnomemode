import React from 'react';
import { useAppState } from '../../App';
import { useGoalStore } from '../../stores/goalStore';
import Button from '../common/Button';

export default function OnboardingStepMorningRitualIntro() {
  const { dispatch } = useAppState();
  const goalStore = useGoalStore();

  const handleContinue = () => {
    // Set the selected goal and navigate to morning ritual setup
    goalStore.setSelectedGoal('morning-ritual');
    dispatch({ type: 'NAVIGATE_TO', payload: 'goals' });
  };

  return (
    <div 
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        margin: 0, 
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#c5e1f2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Gnome Animation - same as home page */}
      <div className="w-full flex justify-center mb-6" style={{ minHeight: '200px' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="object-contain"
          style={{ 
            width: '200px',
            height: '200px',
            transform: 'translateZ(0)',
            willChange: 'transform',
            WebkitTransform: 'translateZ(0)',
            imageRendering: 'auto'
          }}
        >
          <source src="/assets/gnome-icon.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Text Content */}
      <div className="px-6 text-center" style={{ maxWidth: '400px' }}>
        <h1 className="text-3xl font-bold text-black mb-4">
          Your First Mission
        </h1>
        <p className="text-lg text-black mb-8 leading-relaxed">
          The first thing we need to do to help you focus is set up your morning ritual. This will be your daily foundation—a set of activities that ground you and prepare you for the day ahead.
        </p>
        <p className="text-base text-gray-700 mb-8">
          Let's get started.
        </p>
      </div>

      {/* Continue Button */}
      <div className="mt-6">
        <Button 
          onClick={handleContinue}
          className="px-8 py-4 text-lg font-bold"
          style={{
            backgroundColor: '#FFD700',
            color: '#1a1a1a',
            border: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFC700';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFD700';
          }}
        >
          Set Up Morning Ritual
        </Button>
      </div>
    </div>
  );
}

