import React, { useRef, useEffect, useState } from 'react';
import { useAppState } from '../../App';

export default function OnboardingStepIntro() {
  const { dispatch } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const underscoreRef = useRef<HTMLAudioElement>(null);
  const soundEffectRef = useRef<HTMLAudioElement>(null);
  const [showButton, setShowButton] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const loopStartTime = videoDuration > 0 ? videoDuration - 5 : 0;
  const buttonRevealTime = videoDuration > 0 ? videoDuration - 8 : 0; // Show logo/button 3 seconds before loop starts
  const videoAudioFadeStartTime = videoDuration > 0 ? videoDuration - 10 : 0; // Start fading video audio 10 seconds before end
  const videoAudioFadeDuration = 7; // Fade out over 7 seconds

  useEffect(() => {
    // Start video muted (browsers allow this), then unmute once playing
    const video = videoRef.current;
    const audio = audioRef.current;
    
    if (video) {
      video.muted = true; // Start muted to bypass autoplay policy
      video.volume = 1.0; // Full volume for intro video
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Once playing, unmute it
            video.muted = false;
            console.log('Intro video is playing with audio');
            
            // Start background music when video starts playing
            if (audio) {
              audio.volume = 1.0;
              const audioPlayPromise = audio.play();
              if (audioPlayPromise !== undefined) {
                audioPlayPromise
                  .then(() => {
                    console.log('Background music is playing');
                  })
                  .catch((error) => {
                    console.error('Error playing background music:', error);
                  });
              }
            }
          })
          .catch((error) => {
            console.error('Error playing intro video:', error);
          });
      }
    }
  }, []);

  const handleJoinFight = () => {
    // Play sound effect
    const soundEffect = soundEffectRef.current;
    if (soundEffect) {
      soundEffect.currentTime = 0;
      soundEffect.volume = 1.0;
      soundEffect.play().catch(console.error);
    }

    // Start crossfade: fade out main theme, fade in underscore
    const video = videoRef.current;
    const audio = audioRef.current;
    const underscore = underscoreRef.current;
    
    if (isCrossfading) return; // Prevent multiple clicks
    setIsCrossfading(true);

    // Start playing underscore at volume 0
    if (underscore) {
      underscore.volume = 0;
      underscore.loop = true;
      underscore.play().catch(console.error);
    }

    // Fade out video's embedded audio smoothly (separate from music crossfade)
    const videoFadeDuration = 2000; // 2 seconds for video audio fade
    const audioFadeDuration = 2000; // 2 seconds for music crossfade
    const startTime = Date.now();
    const startMainVolume = audio ? audio.volume : 1.0;
    const startVideoVolume = video ? video.volume : 1.0;

    const fadeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const audioProgress = Math.min(elapsed / audioFadeDuration, 1);
      const videoProgress = Math.min(elapsed / videoFadeDuration, 1);

      // Fade out video's embedded audio smoothly (ease-out for smooth fade)
      if (video) {
        const videoEasedProgress = 1 - Math.pow(1 - videoProgress, 3); // Ease-out cubic
        video.volume = Math.max(0, startVideoVolume * (1 - videoEasedProgress));
      }

      // Fade out main theme music (crossfade with underscore)
      if (audio) {
        audio.volume = startMainVolume * (1 - audioProgress);
      }

      // Fade in underscore music
      if (underscore) {
        underscore.volume = audioProgress;
      }

      // When fade is complete
      if (videoProgress >= 1 && audioProgress >= 1) {
        clearInterval(fadeInterval);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        if (video) {
          video.volume = 0;
          video.pause();
        }
        // Go to next onboarding step (Slappy dialogue)
        dispatch({ type: 'NEXT_ONBOARDING_STEP' });
      }
    }, 16); // ~60fps update rate
  };

  const handleSkip = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video && videoDuration > 0) {
      // Jump directly to the 5-second loop
      video.currentTime = loopStartTime;
      // Fade out audio when skipping to loop
      video.volume = 0;
      if (audio) {
        audio.volume = 0;
      }
      setShowButton(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || videoDuration === 0) return;

    const currentTime = video.currentTime;
    
    // Show logo/button a few seconds before the loop starts
    if (currentTime >= buttonRevealTime && !showButton) {
      setShowButton(true);
    }

    // Fade out video's embedded audio earlier (before button appears)
    if (videoDuration > 0 && currentTime >= videoAudioFadeStartTime && currentTime < loopStartTime) {
      // Calculate fade progress (0 to 1)
      const fadeProgress = (currentTime - videoAudioFadeStartTime) / videoAudioFadeDuration;
      // Use easing function for smoother fade (ease-out)
      const easedProgress = Math.min(1, 1 - Math.pow(1 - fadeProgress, 3));
      const targetVolume = 1 - easedProgress; // Fade from 1 to 0
      
      // Fade out video's embedded audio
      video.volume = Math.max(0, targetVolume);
    } else if (videoDuration > 0 && currentTime < videoAudioFadeStartTime) {
      // Keep video at full volume before fade starts
      video.volume = 1.0;
    }

    // Fade out background music separately (closer to the end)
    const musicFadeDuration = 3;
    const musicFadeStartTime = videoDuration - musicFadeDuration;
    if (currentTime >= musicFadeStartTime && currentTime < loopStartTime) {
      const musicFadeProgress = (currentTime - musicFadeStartTime) / musicFadeDuration;
      const musicEasedProgress = 1 - Math.pow(1 - musicFadeProgress, 3);
      const musicTargetVolume = 1 - musicEasedProgress;
      
      // Fade out background music
      if (audio) {
        audio.volume = Math.max(0, musicTargetVolume);
      }
    } else if (currentTime < musicFadeStartTime) {
      // Reset music to full volume if we're before the fade
      if (audio) {
        audio.volume = 1.0;
      }
    }

    // Loop the last 5 seconds
    if (currentTime >= videoDuration) {
      video.currentTime = loopStartTime;
      // Reset volume when looping (the loop phase should be silent or very quiet)
      video.volume = 0;
      if (audio) {
        audio.volume = 0;
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setVideoDuration(video.duration);
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
        backgroundColor: '#000'
      }}
    >
      {/* Intro Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        preload="auto"
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
            video.volume = 1.0;
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
            video.volume = 1.0;
          }
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={(e) => {
          console.error('Video error:', e);
        }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/final-intro-video.mp4?alt=media&token=a1011d0e-6617-43bb-be03-cc2a7c96b13b" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>

      {/* Background Music - Main Theme */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
        onCanPlay={() => {
          // Ensure audio plays when ready
          const audio = audioRef.current;
          const video = videoRef.current;
          if (audio && video && !video.paused && audio.paused) {
            audio.volume = 1.0;
            audio.play().catch((error) => {
              console.error('Error playing background music:', error);
            });
          }
        }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/intro-song.mp3?alt=media&token=33fbc6d1-d787-4946-bc9f-04e22dcd86ac" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Underscore Music - Crossfades in when Join the Fight is clicked */}
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

      {/* Join the Fight Sound Effect */}
      <audio
        ref={soundEffectRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/jointhefightsoundeffect.mp3?alt=media&token=0b50bd94-7daf-4383-8101-4099e144771d" 
          type="audio/mpeg" 
        />
        Your browser does not support the audio tag.
      </audio>

      {/* Skip Button - Top Right (hidden once logo/button appear) */}
      {!showButton && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-30 px-6 py-3 text-white font-semibold transition-opacity hover:opacity-80"
          style={{ zIndex: 30 }}
        >
          Skip
        </button>
      )}

      {/* Logo with Bounce Animation - Only shown during loop phase */}
      {showButton && (
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
      )}

      {/* Join the Fight Button - Only shown during loop phase, positioned same as Start Demo button */}
      {showButton && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-10"
          style={{ 
            marginTop: '-25px',
            animation: 'buttonPop 0.8s ease-out 0.2s both'
          }}
        >
          <button
            onClick={handleJoinFight}
            className="px-8 py-4 text-lg font-bold rounded-lg transition-all"
            style={{
              backgroundColor: '#FFD700',
              color: '#1a1a1a',
              border: 'none',
              zIndex: 30
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFC700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFD700';
            }}
          >
            Join the Fight
          </button>
        </div>
      )}
    </div>
  );
}

