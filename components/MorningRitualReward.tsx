import React, { useEffect, useState } from 'react';
import { useAppState } from '../App';
import { useGameStore } from '../stores/gameStore';

export default function MorningRitualReward() {
  const { dispatch } = useAppState();
  const gameStore = useGameStore();
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    // Award 5 XP (mushrooms) immediately
    gameStore.addXP(5);
    
    // Show reward immediately
    setShowReward(true);

    // Auto-navigate to home after 3 seconds
    const navigateTimer = setTimeout(() => {
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }, 3000);

    return () => {
      clearTimeout(navigateTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Mushroom Icon Animation */}
      <div className="w-full flex justify-center mb-6" style={{ minHeight: '200px' }}>
        <div
          style={{
            animation: showReward ? 'bounceIn 0.8s ease-out' : 'none',
            transform: showReward ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.5s ease-out'
          }}
        >
          <img
            src="/assets/mushroom-icon.png"
            alt="Mushroom"
            style={{
              width: '150px',
              height: '150px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Reward Text */}
      {showReward && (
        <div className="px-6 text-center" style={{ maxWidth: '400px' }}>
          <h1 className="text-3xl font-bold text-black mb-4">
            +5 Mushrooms
          </h1>
          <p className="text-lg text-black mb-8">
            Morning ritual set up complete!
          </p>
        </div>
      )}
    </div>
  );
}

