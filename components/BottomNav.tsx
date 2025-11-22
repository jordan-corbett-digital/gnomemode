
import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../App';
import type { Screen } from '../types';
import { ReportIcon, InventoryIcon } from './icons/Icons';
import { useUserStore } from '../stores/userStore';

const NavItem: React.FC<{
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  isHomeScreen: boolean;
  isCheckInScreen: boolean;
  isQuestsScreen: boolean;
  onClick?: () => void;
  onNavigate?: () => void;
}> = ({ screen, label, icon, isHomeScreen, isCheckInScreen, isQuestsScreen, onClick, onNavigate }) => {
  const { state, dispatch } = useAppState();
  const isActive = state.screen === screen;

  const textColor = (isHomeScreen || isCheckInScreen || isQuestsScreen)
    ? 'text-white' 
    : (isActive ? 'text-green-400' : 'text-gray-400 hover:text-white');

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      if (onNavigate) {
        onNavigate(); // Hide popup when navigating
      }
      dispatch({ type: 'NAVIGATE_TO', payload: screen });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-all duration-200 font-sans ${textColor} relative`}
      style={{ margin: '5px' }}
    >
      {isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10">
        {icon}
        <span className="text-xs mt-1 block">{label}</span>
      </div>
    </button>
  );
};

export default function BottomNav() {
  const { state } = useAppState();
  const { gnomeName } = useUserStore();
  const [showShopPopup, setShowShopPopup] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [navHeight, setNavHeight] = useState(70); // Default fallback

  // Measure nav height to position popup above it
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  // FIX: Consolidate visibility logic to hide nav on 'chooseMushroom' screen as well.
  // Early return AFTER all hooks to maintain hook consistency
  if (state.screen === 'intro' || state.screen === 'onboarding' || state.screen === 'messages') {
    return null;
  }

  const handleShopClick = () => {
    setShowShopPopup(true);
  };

  const handleNavigate = () => {
    setShowShopPopup(false); // Hide popup when any nav item is clicked
  };

  const isHomeScreen = state.screen === 'garden';
  const isCheckInScreen = state.screen === 'checkin' || state.screen === 'checkin-response';
  const isQuestsScreen = state.screen === 'quests';
  
  let navBackground;
  if (isHomeScreen) {
    navBackground = { backgroundColor: 'rgba(120, 88, 67, 0.3)' }; // #785843 with 30% opacity
  } else if (isCheckInScreen) {
    navBackground = { backgroundColor: 'rgba(197, 225, 242, 0.3)' }; // #c5e1f2 with 30% opacity
  } else if (isQuestsScreen) {
    navBackground = { backgroundColor: 'rgba(30, 58, 138, 0.3)' }; // Dark blue with 30% opacity
  } else {
    navBackground = { backgroundColor: 'rgba(15, 23, 42, 0.8)' }; // slate-900 with 80% opacity
  }

  return (
    <>
      {/* Shop Popup - centered in mobile view */}
      {showShopPopup && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100]"
          style={{
            width: 'calc(100% - 64px)',
            maxWidth: '320px', // Slightly less than mobile container for padding
            pointerEvents: 'auto',
          }}
        >
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 text-center">
            <p className="text-white text-lg font-semibold">Shop not available in Demo Mode</p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showShopPopup && (
        <div
          className="fixed inset-0 bg-black/30 z-[99]"
          onClick={() => setShowShopPopup(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      <nav 
        ref={navRef}
        className="w-full backdrop-blur-sm border-t flex justify-around relative z-10"
        style={{
          ...navBackground,
          borderColor: isHomeScreen 
            ? 'rgba(120, 88, 67, 0.2)' 
            : isCheckInScreen 
              ? 'rgba(197, 225, 242, 0.2)' 
              : isQuestsScreen
                ? 'rgba(30, 58, 138, 0.2)'
                : 'rgba(51, 65, 85, 1)',
        }}
      >
        <NavItem screen="garden" label="Home" icon={<img src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home.png?alt=media&token=fe198be7-81f8-4d2b-b7da-85bd41ad5c4f" alt="Home" className="w-[40px] h-[40px]" loading="eager" decoding="async" />} isHomeScreen={isHomeScreen} isCheckInScreen={isCheckInScreen} isQuestsScreen={isQuestsScreen} onNavigate={handleNavigate} />
        <NavItem screen="quests" label="Missions" icon={<div className="flex items-center justify-center"><img src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/missions.png?alt=media&token=e53ddfc0-b29e-4c59-adc1-3f6e8941934a" alt="Missions" className="w-[40px] h-[40px] object-contain" loading="eager" decoding="async" /></div>} isHomeScreen={isHomeScreen} isCheckInScreen={isCheckInScreen} isQuestsScreen={isQuestsScreen} onNavigate={handleNavigate} />
        <NavItem screen="nemesis" label="Nemesis" icon={<div className="flex items-center justify-center"><img src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/nemesis.png?alt=media&token=da2d84f8-e97f-425d-a95a-5de690caeb5c" alt="Nemesis" className="w-[40px] h-[40px] object-contain" loading="eager" decoding="async" /></div>} isHomeScreen={isHomeScreen} isCheckInScreen={isCheckInScreen} isQuestsScreen={isQuestsScreen} onNavigate={handleNavigate} />
        <NavItem screen="shop" label="Shop" icon={<img src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/shop-icon.png?alt=media&token=4edad559-b97d-4329-8a77-542ca67c753c" alt="Shop" className="w-[40px] h-[40px]" loading="eager" decoding="async" />} isHomeScreen={isHomeScreen} isCheckInScreen={isCheckInScreen} isQuestsScreen={isQuestsScreen} onClick={handleShopClick} />
        <NavItem screen="profile" label={gnomeName || "Profile"} icon={<img src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/slappy-profile.png?alt=media&token=4419207e-d610-4162-9db1-802bf6587dfe" alt="Profile" className="w-[40px] h-[40px]" loading="eager" decoding="async" />} isHomeScreen={isHomeScreen} isCheckInScreen={isCheckInScreen} isQuestsScreen={isQuestsScreen} onNavigate={handleNavigate} />
      </nav>
    </>
  );
}
