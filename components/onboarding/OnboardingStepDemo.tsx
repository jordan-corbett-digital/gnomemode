import React, { useRef, useEffect } from 'react';
import { useAppState } from '../../App';
import Button from '../common/Button';

export default function OnboardingStepDemo() {
  const { dispatch } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Start video muted (browsers allow this), then unmute once playing
    const video = videoRef.current;
    if (video) {
      video.muted = true; // Start muted to bypass autoplay policy
      video.volume = 0.25; // Set volume to 25%
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Once playing, unmute it
            video.muted = false;
            console.log('Video is playing with audio');
          })
          .catch((error) => {
            console.error('Error playing video:', error);
          });
      }
    }
  }, []);

  const handleStartDemo = () => {
    dispatch({ type: 'SET_ONBOARDING_STEP', payload: 2 });
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
        backgroundColor: '#000'
      }}
    >
      {/* Looping Demo Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={true}
        playsInline
        preload="auto"
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(1.1)',
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
          // Ensure video plays when ready
          const video = videoRef.current;
          if (video && video.paused) {
            video.play().catch(console.error);
          }
        }}
        onCanPlayThrough={() => {
          // Video is ready to play through
          const video = videoRef.current;
          if (video) {
            video.volume = 0.25;
            video.muted = false;
            if (video.paused) {
              video.play().catch(console.error);
            }
          }
        }}
        onPlaying={() => {
          // Unmute once video is actually playing
          const video = videoRef.current;
          if (video) {
            video.muted = false;
            video.volume = 0.25;
          }
        }}
        onEnded={(e) => {
          // Immediately restart for seamless loop
          const video = e.currentTarget;
          video.currentTime = 0;
          video.play().catch(console.error);
        }}
        onTimeUpdate={(e) => {
          // If we're near the end, prepare for seamless loop
          const video = e.currentTarget;
          if (video.duration && video.duration - video.currentTime < 0.1) {
            video.currentTime = 0;
          }
        }}
        onError={(e) => {
          console.error('Video error:', e);
        }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/demo-open.mp4?alt=media&token=9b2aa131-210f-459d-9e48-855aa4ea2c49" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>

      {/* Logo with Bounce Animation */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          animation: 'bounceIn 0.8s ease-out',
          marginTop: '-150px'
        }}
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/Gnome_(1).png?alt=media&token=e12aaef7-8828-49e5-a47b-82b96b804019"
          alt="Gnome Mode Logo"
          width="300"
          height="300"
          style={{
            width: '300px',
            height: '300px',
            minWidth: '300px',
            minHeight: '300px',
            maxWidth: '300px',
            maxHeight: '300px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 30px rgba(173, 216, 230, 0.4))',
            display: 'block'
          }}
        />
      </div>

      {/* Start Demo Button - Under Logo */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-10"
        style={{ 
          marginTop: '-25px'
        }}
      >
        <Button 
          onClick={handleStartDemo}
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
          Start Demo
        </Button>
      </div>
    </div>
  );
}

