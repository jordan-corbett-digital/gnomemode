import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';

export default function IntroScreen() {
  const { dispatch } = useAppState();

  const handleAwaken = () => {
    dispatch({ type: 'START_ONBOARDING' });
  };


  return (
    <div className={`h-full w-full flex flex-col p-8 text-center bg-gradient-to-b from-blue-100 to-white`} style={{ minHeight: '100%' }}>
      <div className="flex-grow flex flex-col items-center justify-center">
        <span className="text-8xl mb-4" role="img" aria-label="App Mascot" style={{ display: 'block' }}>🍄</span>
        <h1 className="text-5xl font-bold text-slate-900" style={{ color: '#0f172a' }}>SpiteGarden</h1>
        <p className="text-xl text-gray-600 mt-2" style={{ color: '#475569' }}>Grow from your grudges.</p>
      </div>
      
      <div className="w-full pb-4">
        <div>
            <Button onClick={handleAwaken} fullWidth>
              Awaken Your Gnome
            </Button>
            <p className="text-xs text-gray-500 mt-2">Summon responsibly.</p>
        </div>
        
        <button className="text-gray-500 font-semibold mt-6 hover:text-gray-800 transition-colors disabled:opacity-50" disabled>
          Login
        </button>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-800" onClick={(e) => e.preventDefault()}>Terms of Service</a> and{' '}
            <a href="#" className="underline hover:text-gray-800" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}