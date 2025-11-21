import React from 'react';
import { useAppState } from '../App';
import Button from './common/Button';

export default function DemoScreen() {
  const { dispatch } = useAppState();

  const handleStartDemo = () => {
    dispatch({ type: 'START_ONBOARDING' });
  };

  return (
    <div className="h-full w-full relative overflow-hidden bg-black">
      {/* Looping Demo Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/demo1.mp4?alt=media&token=5af254ce-21fc-4ae3-ac68-d45af10c35f6" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>

      {/* Start Demo Button Overlay */}
      <div 
        className="absolute inset-0 flex items-end justify-center pb-12 z-10"
        style={{ 
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
        }}
      >
        <Button 
          onClick={handleStartDemo}
          className="px-8 py-4 text-lg font-bold"
        >
          Start Demo
        </Button>
      </div>
    </div>
  );
}

