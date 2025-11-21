import React from 'react';

const PUFF_COUNT = 24; // Increased for a fuller effect

const AwakeningTransition: React.FC = () => {
  return (
    // Added background gradient to match the transitioning screens
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-100 to-white">
      {Array.from({ length: PUFF_COUNT }).map((_, i) => {
        const side = i % 4;
        const style: React.CSSProperties = {
          // Staggered delay for more organic feel
          animationDelay: `${(i * 0.05) + (Math.random() * 0.1)}s`,
          // Randomized scale for variety
          transform: `scale(${0.7 + Math.random() * 0.6})`,
        };

        switch (side) {
          case 0: // Top
            style.top = `${-15 + Math.random() * 15}%`; // Start slightly off screen
            style.left = `${Math.random() * 90}%`;
            style.animationName = 'smoke-puff-down';
            break;
          case 1: // Right
            style.top = `${Math.random() * 90}%`;
            style.right = `${-15 + Math.random() * 15}%`; // Start slightly off screen
            style.animationName = 'smoke-puff-left';
            break;
          case 2: // Bottom
            style.bottom = `${-15 + Math.random() * 15}%`; // Start slightly off screen
            style.left = `${Math.random() * 90}%`;
            style.animationName = 'smoke-puff-up';
            break;
          case 3: // Left
            style.top = `${Math.random() * 90}%`;
            style.left = `${-15 + Math.random() * 15}%`; // Start slightly off screen
            style.animationName = 'smoke-puff-right';
            break;
        }

        return <div key={i} className="smoke-puff" style={style}></div>;
      })}
    </div>
  );
};

export default AwakeningTransition;