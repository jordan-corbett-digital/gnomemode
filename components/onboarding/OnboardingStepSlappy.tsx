import React, { useRef, useEffect, useState } from 'react';
import { useAppState } from '../../App';

// Dialogue lines organized by beat
const BEAT_1_DIALOGUE = [
  "About time. I was starting to think I'd have to save the world by myself. Again.",
  "I'm Slappy and you... you're my new partner. Whether you like it or not.",
  "And our first order of business is dealing with that horrible act you just saw.",
  "Which means we need to talk about that ass hat, Ty Cooner."
];

const BEAT_2_DIALOGUE = [
  "This guy. His only two personality traits are 'the grind' and 'unearned confidence'.",
  "He's stealing the mushrooms that power this valley to use as cheap, organic batteries for his new AI.",
  "His whole 'vision' is just finding things that aren't his and then taking them."
];

const BEAT_3_DIALOGUE = [
  "I can get our stuff back. I'm faster than his drones and smarter than his code.",
  "But the constant threat, the noise, the sheer stupidity of it all... it's a distraction. And a distracted gnome is a dead gnome.",
  "So, we forge a Focus Bond. It's an old piece of gnome magic that links our states of mind.",
  "...I get a moment of perfect clarity. Your focus becomes my focus. Simple as that."
];

type Beat = 1 | 2 | 3;
type VideoState = 'loop1' | 'transition1' | 'loop2' | 'transition2' | 'loop3';

export default function OnboardingStepSlappy() {
  const { dispatch } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const underscoreRef = useRef<HTMLAudioElement>(null);
  const arrowClickRef = useRef<HTMLAudioElement>(null);
  const transition1SoundRef = useRef<HTMLAudioElement>(null);
  const transition2SoundRef = useRef<HTMLAudioElement>(null);
  const loop1Ref = useRef<HTMLVideoElement>(null);
  const transition1Ref = useRef<HTMLVideoElement>(null);
  const loop2Ref = useRef<HTMLVideoElement>(null);
  const transition2Ref = useRef<HTMLVideoElement>(null);
  const loop3Ref = useRef<HTMLVideoElement>(null);
  const textMeasureRef = useRef<HTMLParagraphElement>(null);
  
  const [currentBeat, setCurrentBeat] = useState<Beat>(1);
  const [videoState, setVideoState] = useState<VideoState>('loop1');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);
  const [bubbleHeight, setBubbleHeight] = useState<number | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current dialogue based on beat
  const getCurrentDialogue = () => {
    switch (currentBeat) {
      case 1:
        return BEAT_1_DIALOGUE;
      case 2:
        return BEAT_2_DIALOGUE;
      case 3:
        return BEAT_3_DIALOGUE;
    }
  };

  const currentDialogue = getCurrentDialogue();

  // Video URLs
  const videoUrls = {
    loop1: "https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/onboarding-loop1.webm?alt=media&token=c875d4a7-bdac-4a21-9732-98abae062c35",
    transition1: "https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/onboard-transition1.webm?alt=media&token=30131634-2b96-45d4-bc3e-b185d623d349",
    loop2: "https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/loop2-onboarding.webm?alt=media&token=4ae1273f-6d3c-4925-be08-3c3f9734d06f",
    transition2: "https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/transition2-onboarding.webm?alt=media&token=911e6f57-f963-466b-aafd-941f41561ef3",
    loop3: "https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/loop3-onboarding.webm?alt=media&token=0fdb0c27-f86d-4e34-9233-f73c345efba2"
  };

  // Get current video ref based on state
  const getCurrentVideoRef = () => {
    switch (videoState) {
      case 'loop1':
        return loop1Ref;
      case 'transition1':
        return transition1Ref;
      case 'loop2':
        return loop2Ref;
      case 'transition2':
        return transition2Ref;
      case 'loop3':
        return loop3Ref;
    }
  };

  // Initialize all videos - preload them all
  useEffect(() => {
    const videoRefs = [
      { ref: loop1Ref, state: 'loop1' as VideoState },
      { ref: transition1Ref, state: 'transition1' as VideoState },
      { ref: loop2Ref, state: 'loop2' as VideoState },
      { ref: transition2Ref, state: 'transition2' as VideoState },
      { ref: loop3Ref, state: 'loop3' as VideoState }
    ];

    videoRefs.forEach(({ ref, state }) => {
      const video = ref.current;
    if (video) {
        video.loop = state.startsWith('loop');
        video.muted = true;
      video.volume = 1.0;
        video.preload = 'auto';
        video.playsInline = true;
        
        // Load the video
        video.load();
      }
    });
  }, []);

  // Handle video state changes - switch between preloaded videos instantly
  useEffect(() => {
    const currentVideoRef = getCurrentVideoRef();
    const currentVideo = currentVideoRef.current;

    if (!currentVideo) return;

    // Play transition 1 sound effect when transition 1 starts
    if (videoState === 'transition1') {
      const transition1Sound = transition1SoundRef.current;
      if (transition1Sound) {
        transition1Sound.currentTime = 0;
        transition1Sound.volume = 1.0;
        transition1Sound.play().catch(console.error);
      }
    }

    // Play transition 2 sound effect when transition 2 starts
    if (videoState === 'transition2') {
      const transition2Sound = transition2SoundRef.current;
      if (transition2Sound) {
        transition2Sound.currentTime = 0;
        transition2Sound.volume = 1.0;
        transition2Sound.play().catch(console.error);
      }
    }

    // Hide all videos first
    [loop1Ref, transition1Ref, loop2Ref, transition2Ref, loop3Ref].forEach(ref => {
      if (ref.current && ref.current !== currentVideo) {
        ref.current.style.opacity = '0';
        ref.current.pause();
      }
    });

    // Show and play current video
    currentVideo.style.opacity = '1';
    currentVideo.currentTime = 0;
    
    // Try to play - if not ready, wait for it
    const tryPlay = () => {
      if (currentVideo.readyState >= 2) {
        const playPromise = currentVideo.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
              console.log(`Video ${videoState} started playing`);
              currentVideo.muted = false;
          })
          .catch((error) => {
              console.error(`Error playing ${videoState}:`, error);
              setTimeout(() => tryPlay(), 100);
            });
        }
      } else {
        // Wait for video to be ready
        const handleCanPlay = () => {
          currentVideo.removeEventListener('canplay', handleCanPlay);
          tryPlay();
        };
        currentVideo.addEventListener('canplay', handleCanPlay);
      }
    };

    tryPlay();
  }, [videoState]);

  // Initialize underscore music - continue playing from previous step
  useEffect(() => {
    const underscore = underscoreRef.current;
    if (underscore) {
      underscore.loop = true;
      underscore.volume = 1.0;
      underscore.preload = 'auto';
      
      // Start playing if not already playing (in case it was started in previous step)
      if (underscore.paused) {
        underscore.play().catch((error) => {
          console.error('Error playing underscore music:', error);
        });
      } else {
        // If already playing from crossfade, ensure volume is at 1.0
        underscore.volume = 1.0;
      }
    }
  }, []);

  // Handle transition video ending
  useEffect(() => {
    if (!videoState.startsWith('transition')) return;

    const transitionRef = videoState === 'transition1' ? transition1Ref : transition2Ref;
    const transitionVideo = transitionRef.current;

    if (!transitionVideo) return;

    const handleEnded = () => {
      console.log(`Transition ${videoState} ended`);
      if (videoState === 'transition1') {
        setVideoState('loop2');
        setCurrentBeat(2);
        setCurrentLineIndex(0);
      } else if (videoState === 'transition2') {
        setVideoState('loop3');
        setCurrentBeat(3);
        setCurrentLineIndex(0);
      }
      setIsTransitioning(false);
    };

    transitionVideo.addEventListener('ended', handleEnded);
    return () => {
      transitionVideo.removeEventListener('ended', handleEnded);
    };
  }, [videoState]);

  // Measure current text line height to size bubble appropriately
  useEffect(() => {
    if (textMeasureRef.current) {
      const fullText = currentDialogue[currentLineIndex];
      if (fullText) {
        textMeasureRef.current.textContent = fullText;
        const height = textMeasureRef.current.offsetHeight;
        setBubbleHeight(height);
        textMeasureRef.current.textContent = '';
      }
    }
  }, [currentLineIndex, currentDialogue]);

  // Fade in effect when line changes
  useEffect(() => {
    setIsFadingOut(false);
    setIsFadingIn(true);
    const fadeInTimer = setTimeout(() => {
      setIsFadingIn(false);
    }, 50);
    return () => clearTimeout(fadeInTimer);
  }, [currentLineIndex]);

  const handleClick = () => {
    // Don't allow clicks during transitions
    if (isTransitioning) {
      console.log('Click blocked - transition in progress');
      return;
    }

    // Play arrow click sound effect
    const arrowClick = arrowClickRef.current;
    if (arrowClick) {
      arrowClick.currentTime = 0;
      arrowClick.volume = 1.0;
      arrowClick.play().catch(console.error);
    }

    const maxIndex = currentDialogue.length - 1;
    console.log(`Click: currentLineIndex=${currentLineIndex}, maxIndex=${maxIndex}, currentBeat=${currentBeat}`);

    if (currentLineIndex < maxIndex) {
      // Move to next dialogue line
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentLineIndex(currentLineIndex + 1);
      }, 400);
    } else {
      // End of current beat - check if we need to transition
      console.log(`End of beat ${currentBeat}, transitioning...`);
      if (currentBeat === 1) {
        // Beat 1 complete - transition to Beat 2
        console.log('Starting transition1');
        setIsTransitioning(true);
        setVideoState('transition1');
      } else if (currentBeat === 2) {
        // Beat 2 complete - transition to Beat 3
        console.log('Starting transition2');
        setIsTransitioning(true);
        setVideoState('transition2');
      } else if (currentBeat === 3) {
        // Beat 3 complete - button will show automatically when last line is displayed
        // No action needed here, button shows when last line is shown
      }
    }
  };

  // Show button automatically when last dialogue line of Beat 3 is displayed
  useEffect(() => {
    if (currentBeat === 3 && currentLineIndex === BEAT_3_DIALOGUE.length - 1 && !isFadingOut) {
      // Small delay to let the text fade in first
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentBeat, currentLineIndex, isFadingOut]);

  const handleForgeBond = () => {
    // Navigate to morning ritual intro step
    dispatch({ type: 'SET_ONBOARDING_STEP', payload: 4 });
  };

  const handleSkip = () => {
    // Skip to show the "Forge the Bond" button
    setCurrentBeat(3);
    setCurrentLineIndex(BEAT_3_DIALOGUE.length - 1);
    setVideoState('loop3');
    setShowButton(true);
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
        cursor: showButton ? 'default' : 'pointer'
      }}
      onClick={!showButton ? handleClick : undefined}
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

      {/* Underscore Music - Continues from previous step */}
      <audio
        ref={underscoreRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/underscore.mp3?alt=media&token=76f6991a-f4b3-46a2-8136-37d4fc976656" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Arrow Click Sound Effect */}
      <audio
        ref={arrowClickRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/arrow%20click.mp3?alt=media&token=d4c12c33-08ca-4172-bdfc-a47bb2e9745a" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Transition 1 Sound Effect */}
      <audio
        ref={transition1SoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/transition1-se.mp3?alt=media&token=07fc97c5-d63d-45d4-b776-0f3dce9e1d19" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Transition 2 Sound Effect */}
      <audio
        ref={transition2SoundRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/transition2-se.mp3?alt=media&token=8877441a-f4ef-4654-abf7-301c05d58d30" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Skip Button - Top Right */}
      {!showButton && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-30 px-6 py-3 text-white font-semibold transition-opacity hover:opacity-80"
          style={{ zIndex: 30 }}
        >
          Skip
        </button>
      )}

      {/* Speech Bubble Container - Positioned above where gnome will be */}
      {!isTransitioning && (
      <div
        style={{
          position: 'absolute',
          top: 'calc(20% - 20px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          width: '90%',
          maxWidth: '600px'
        }}
      >
        {/* Speech Bubble - Sized to fit current text */}
        <div
          key={`${currentBeat}-${currentLineIndex}`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            padding: '20px 24px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(77, 208, 225, 0.25), 0 0 80px rgba(77, 208, 225, 0.15), 0 0 120px rgba(77, 208, 225, 0.1)',
            position: 'relative',
            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            minHeight: bubbleHeight ? `${bubbleHeight + 40}px` : 'auto',
            transition: 'min-height 0.4s ease-in-out'
          }}
        >
            {/* Speech bubble tail/pointer */}
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

            {/* Hidden text for measuring full height */}
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
                width: 'calc(100% - 48px)',
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
                height: bubbleHeight ? `${bubbleHeight}px` : 'auto',
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
              {currentDialogue[currentLineIndex]}
          </p>

            {/* Continue Icon - Only show when text is visible and not at end of beat 3 */}
            {!isFadingOut && !isFadingIn && !(currentBeat === 3 && currentLineIndex === currentDialogue.length - 1) && (
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
      )}

      {/* Gnome Animation Videos - All preloaded, switch visibility for seamless transitions */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '350px',
          width: '350px'
        }}
      >
        {/* Loop 1 Video */}
        <video
          ref={loop1Ref}
          autoPlay
          playsInline
          muted
          loop={true}
          preload="auto"
          width={350}
          height={350}
          style={{
            position: 'absolute',
            height: '350px',
            width: '350px',
            objectFit: 'contain',
            display: 'block',
            opacity: videoState === 'loop1' ? 1 : 0,
            transition: 'opacity 0s',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -25px 40px rgba(77, 208, 225, 0.6)) drop-shadow(0 -15px 25px rgba(77, 208, 225, 0.5)) drop-shadow(0 -8px 15px rgba(77, 208, 225, 0.4)) drop-shadow(0 -4px 8px rgba(77, 208, 225, 0.3)) drop-shadow(0 -2px 4px rgba(77, 208, 225, 0.2))'
          }}
          onPlaying={() => {
            const video = loop1Ref.current;
            if (video) {
              video.muted = false;
              video.volume = 1.0;
            }
          }}
        >
          <source src={videoUrls.loop1} type="video/webm" />
        </video>

        {/* Transition 1 Video */}
        <video
          ref={transition1Ref}
          playsInline
          muted
          loop={false}
          preload="auto"
          width={350}
          height={350}
          style={{
            position: 'absolute',
            height: '350px',
            width: '350px',
            objectFit: 'contain',
            display: 'block',
            opacity: videoState === 'transition1' ? 1 : 0,
            transition: 'opacity 0s',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -25px 40px rgba(77, 208, 225, 0.6)) drop-shadow(0 -15px 25px rgba(77, 208, 225, 0.5)) drop-shadow(0 -8px 15px rgba(77, 208, 225, 0.4)) drop-shadow(0 -4px 8px rgba(77, 208, 225, 0.3)) drop-shadow(0 -2px 4px rgba(77, 208, 225, 0.2))'
          }}
          onPlaying={() => {
            const video = transition1Ref.current;
            if (video) {
              video.muted = false;
              video.volume = 1.0;
            }
          }}
          onEnded={() => {
            console.log('Transition 1 ended');
            setVideoState('loop2');
            setCurrentBeat(2);
            setCurrentLineIndex(0);
            setIsTransitioning(false);
          }}
        >
          <source src={videoUrls.transition1} type="video/webm" />
        </video>

        {/* Loop 2 Video */}
        <video
          ref={loop2Ref}
          playsInline
          muted
          loop={true}
          preload="auto"
          width={350}
          height={350}
          style={{
            position: 'absolute',
            height: '350px',
            width: '350px',
            objectFit: 'contain',
            display: 'block',
            opacity: videoState === 'loop2' ? 1 : 0,
            transition: 'opacity 0s',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -25px 40px rgba(77, 208, 225, 0.6)) drop-shadow(0 -15px 25px rgba(77, 208, 225, 0.5)) drop-shadow(0 -8px 15px rgba(77, 208, 225, 0.4)) drop-shadow(0 -4px 8px rgba(77, 208, 225, 0.3)) drop-shadow(0 -2px 4px rgba(77, 208, 225, 0.2))'
          }}
          onPlaying={() => {
            const video = loop2Ref.current;
            if (video) {
              video.muted = false;
              video.volume = 1.0;
            }
          }}
        >
          <source src={videoUrls.loop2} type="video/webm" />
        </video>

        {/* Transition 2 Video */}
        <video
          ref={transition2Ref}
          playsInline
          muted
          loop={false}
          preload="auto"
          width={350}
          height={350}
          style={{
            position: 'absolute',
            height: '350px',
            width: '350px',
            objectFit: 'contain',
            display: 'block',
            opacity: videoState === 'transition2' ? 1 : 0,
            transition: 'opacity 0s',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -25px 40px rgba(77, 208, 225, 0.6)) drop-shadow(0 -15px 25px rgba(77, 208, 225, 0.5)) drop-shadow(0 -8px 15px rgba(77, 208, 225, 0.4)) drop-shadow(0 -4px 8px rgba(77, 208, 225, 0.3)) drop-shadow(0 -2px 4px rgba(77, 208, 225, 0.2))'
          }}
          onPlaying={() => {
            const video = transition2Ref.current;
            if (video) {
              video.muted = false;
              video.volume = 1.0;
            }
          }}
          onEnded={() => {
            console.log('Transition 2 ended');
            setVideoState('loop3');
            setCurrentBeat(3);
            setCurrentLineIndex(0);
            setIsTransitioning(false);
          }}
        >
          <source src={videoUrls.transition2} type="video/webm" />
        </video>

        {/* Loop 3 Video */}
        <video
          ref={loop3Ref}
          playsInline
          muted
          loop={true}
          preload="auto"
          width={350}
          height={350}
          style={{
            position: 'absolute',
            height: '350px',
            width: '350px',
            objectFit: 'contain',
            display: 'block',
            opacity: videoState === 'loop3' ? 1 : 0,
            transition: 'opacity 0s',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 -25px 40px rgba(77, 208, 225, 0.6)) drop-shadow(0 -15px 25px rgba(77, 208, 225, 0.5)) drop-shadow(0 -8px 15px rgba(77, 208, 225, 0.4)) drop-shadow(0 -4px 8px rgba(77, 208, 225, 0.3)) drop-shadow(0 -2px 4px rgba(77, 208, 225, 0.2))'
          }}
          onPlaying={() => {
            const video = loop3Ref.current;
            if (video) {
              video.muted = false;
              video.volume = 1.0;
            }
          }}
        >
          <source src={videoUrls.loop3} type="video/webm" />
        </video>
      </div>

      {/* Forge the Bond Button - Shows under speech bubble at end of Beat 3 */}
      {showButton && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 z-30"
          style={{ 
            top: 'calc(20% + 170px)', // Positioned under speech bubble (20% + bubble height + spacing)
            animation: 'buttonPop 0.8s ease-out 0.2s both'
          }}
        >
          <button
            onClick={handleForgeBond}
            className="px-8 py-4 text-lg font-bold rounded-lg transition-all"
            style={{
              backgroundColor: '#FFD700',
              color: '#1a1a1a',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFC700';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Forge the Bond
          </button>
        </div>
      )}
    </div>
  );
}
