import React, { useRef, useEffect, useState } from 'react';
import { useAppState } from '../../App';

const DIALOGUE_LINES = [
  "So you're the one. Huh. You're... smellier than I expected.",
  "Name's Slappy. Welcome to what's left of my front lawn.",
  "Enjoy the quiet while it lasts. The new neighbors are bringing bulldozers to the housewarming party.",
  "Now, if you're done sightseeing, we have a problem."
];

export default function OnboardingStepSlappy() {
  const { dispatch } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const textMeasureRef = useRef<HTMLParagraphElement>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [bubbleHeight, setBubbleHeight] = useState<number | null>(null);

  useEffect(() => {
    // Start video playback
    const video = videoRef.current;
    if (video) {
      video.loop = true;
      video.muted = true; // Start muted to bypass autoplay policy
      video.volume = 1.0;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            video.muted = false;
          })
          .catch((error) => {
            console.error('Error playing background video:', error);
          });
      }
    }
  }, []);

  // Measure current text line height to size bubble appropriately
  useEffect(() => {
    if (textMeasureRef.current) {
      const fullText = DIALOGUE_LINES[currentLineIndex];
      if (fullText) {
        // Temporarily set full text to measure height
        textMeasureRef.current.textContent = fullText;
        const height = textMeasureRef.current.offsetHeight;
        setBubbleHeight(height);
        // Clear it after measuring
        textMeasureRef.current.textContent = '';
      }
    }
  }, [currentLineIndex]); // Re-measure when line changes

  // Fade in effect when line changes
  useEffect(() => {
    setIsFadingOut(false);
    // Start with opacity 0, then fade in
    setIsFadingIn(true);
    // After a brief moment, trigger fade in animation
    const fadeInTimer = setTimeout(() => {
      setIsFadingIn(false);
    }, 50); // Small delay to ensure opacity starts at 0
    return () => clearTimeout(fadeInTimer);
  }, [currentLineIndex]);

  const handleClick = () => {
    if (currentLineIndex < DIALOGUE_LINES.length - 1) {
      // Fade out current text, then move to next line
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
      }, 400); // Wait for fade out animation
    } else {
      // After the last line, go to home page
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }
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
        backgroundColor: '#000',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Looping Background Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        loop
        muted
        preload="auto"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0,
          margin: 0,
          padding: 0,
          display: 'block',
          minWidth: '100%',
          minHeight: '100%',
          pointerEvents: 'none'
        }}
        onCanPlay={() => {
          const video = videoRef.current;
          if (video && video.paused) {
            video.play().catch(console.error);
          }
        }}
        onCanPlayThrough={() => {
          const video = videoRef.current;
          if (video) {
            video.volume = 1.0;
            video.muted = false;
            if (video.paused) {
              video.play().catch(console.error);
            }
          }
        }}
        onPlaying={() => {
          const video = videoRef.current;
          if (video) {
            video.muted = false;
            video.volume = 1.0;
          }
        }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/onboarding1-bg-loop.mp4?alt=media&token=eb4684df-b600-47af-9437-30d75df1f539" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>

      {/* Speech Bubble Container - Positioned above where gnome will be */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: '90%',
          maxWidth: '600px'
        }}
      >
        {/* Speech Bubble - Sized to fit current text */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            padding: '20px 24px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(77, 208, 225, 0.25), 0 0 80px rgba(77, 208, 225, 0.15), 0 0 120px rgba(77, 208, 225, 0.1)',
            position: 'relative',
            animation: currentLineIndex === 0 ? 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            minHeight: bubbleHeight ? `${bubbleHeight + 40}px` : 'auto', // Height based on current text + padding
            transition: 'min-height 0.4s ease-in-out' // Smooth resize when text changes
          }}
        >
          {/* Speech bubble tail/pointer (pointing down to where gnome will be) */}
          <div
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderTop: '15px solid rgba(255, 255, 255, 0.97)'
            }}
          />

          {/* Hidden text for measuring full height - matches exact width of visible text */}
          <p
            ref={textMeasureRef}
            style={{
              fontSize: '18px',
              lineHeight: '1.5',
              margin: 0,
              textAlign: 'center',
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 500,
              position: 'absolute',
              visibility: 'hidden',
              whiteSpace: 'pre-wrap',
              width: 'calc(100% - 48px)', // Account for padding (24px left + 24px right)
              padding: '0',
              boxSizing: 'border-box'
            }}
          />

          {/* Dialogue Text with Fade In/Out Effect */}
          <p
            style={{
              fontSize: '18px',
              lineHeight: '1.5',
              color: '#1a1a1a',
              margin: 0,
              textAlign: 'center',
              fontFamily: 'Fredoka, sans-serif',
              fontWeight: 500,
              height: bubbleHeight ? `${bubbleHeight}px` : 'auto', // Height matches current text
              opacity: isFadingOut ? 0 : (isFadingIn ? 0 : 1),
              transition: isFadingIn ? 'opacity 0.4s ease-in' : (isFadingOut ? 'opacity 0.4s ease-out' : 'opacity 0.4s ease-in-out'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {DIALOGUE_LINES[currentLineIndex]}
          </p>

          {/* Continue Icon (pulsing, glowing cyan) - Only show when text is visible */}
          {!isFadingOut && !isFadingIn && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '12px',
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 1,
                transition: 'opacity 0.4s ease-in-out'
              }}
            >
              <span
                style={{
                  fontSize: '24px',
                  color: '#4DD0E1',
                  display: 'inline-block',
                  textShadow: '0 0 10px rgba(77, 208, 225, 0.8), 0 0 20px rgba(77, 208, 225, 0.5), 0 0 30px rgba(77, 208, 225, 0.3)',
                  filter: 'drop-shadow(0 0 8px rgba(77, 208, 225, 0.6))'
                }}
              >
                ▽
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Space reserved for gnome animation at the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          zIndex: 10
          // This space is reserved for the gnome animation to be added later
        }}
      />
    </div>
  );
}

