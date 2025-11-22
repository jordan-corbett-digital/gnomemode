import React, { useEffect } from 'react';
import { useAppState } from '../App';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { dispatch } = useAppState();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOnboardingClick = () => {
    dispatch({ type: 'START_ONBOARDING' });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        style={{ zIndex: 40 }}
      />
      
      {/* Side Menu */}
      <div
        className={`absolute top-0 left-0 h-full bg-slate-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          zIndex: 50,
          width: '280px',
          maxWidth: '80%'
        }}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-xl">Settings</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl font-bold leading-none"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          
          <div className="flex flex-col gap-3 flex-grow">
            <button
              onClick={handleOnboardingClick}
              className="text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
            >
              Access Onboarding Flow
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

