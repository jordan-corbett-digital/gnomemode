import React from 'react';
import { useAppState } from '../App';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { dispatch } = useAppState();

  if (!isOpen) return null;

  const handleOnboardingClick = () => {
    dispatch({ type: 'START_ONBOARDING' });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{ zIndex: 40 }}
      />
      
      {/* Menu */}
      <div
        className="fixed top-4 left-4 bg-slate-800 rounded-2xl shadow-2xl z-50 p-4 min-w-[200px]"
        style={{ zIndex: 50 }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-white font-bold text-lg mb-2">Settings</h2>
          
          <button
            onClick={handleOnboardingClick}
            className="text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors"
          >
            Access Onboarding Flow
          </button>
          
          <button
            onClick={onClose}
            className="text-left px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-semibold transition-colors mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

