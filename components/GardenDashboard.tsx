import React, { useState, useEffect, useRef } from 'react';
import { GardenStateEnum } from '../types';
import { useGameStore } from '../stores/gameStore';
import { CalendarIcon, PlusIcon, ThreeDotsVerticalIcon, CheckIcon } from './icons/Icons';
import { useQuestStore } from '../stores/questStore';
import { useGoalStore } from '../stores/goalStore';
import { useUserStore } from '../stores/userStore';
import { useMessageStore } from '../stores/messageStore';
import { useCheckInStore } from '../stores/checkInStore';
import { useAppState } from '../App';
import { generateGnomeMessage } from '../utils/ai';
import type { GoalId } from '../stores/goalStore';

export default function GardenDashboard() {
  const { dispatch } = useAppState();
  const gameStore = useGameStore();
  const questStore = useQuestStore();
  const goalStore = useGoalStore();
  const userStore = useUserStore();
  const messageStore = useMessageStore();
  const checkInStore = useCheckInStore();
  
  const isHealthy = gameStore.gardenState === GardenStateEnum.Healthy;
  
  // Get incomplete goals
  const incompleteGoals = goalStore.getIncompleteGoals();
  const goalsLeft = incompleteGoals.length;

  const [draggedGoalId, setDraggedGoalId] = useState<GoalId | null>(null);
  const [dragOverGoalId, setDragOverGoalId] = useState<GoalId | null>(null);
  const [gnomeMessage, setGnomeMessage] = useState<string>('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeUntilNextCheckIn, setTimeUntilNextCheckIn] = useState<string>('');

  // Get icon URL based on goal ID
  const getGoalIcon = (goalId: string): string => {
    switch (goalId) {
      case 'morning-ritual':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/2.png?alt=media&token=b29ad6ed-6740-486f-8496-9b9f1ce2fe0b';
      case 'evening-ritual':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/3.png?alt=media&token=95ff6fbc-1d56-49e9-8c02-75178d6c0b1d';
      case 'daily-goals':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/4.png?alt=media&token=abe247c7-34c8-465f-8c14-e4b512b0eb8b';
      default:
        return '/assets/mushroom-icon.png';
    }
  };

  const handleDragStart = (e: React.DragEvent, goalId: GoalId) => {
    setDraggedGoalId(goalId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', goalId);
  };

  const handleDragOver = (e: React.DragEvent, goalId: GoalId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (goalId !== draggedGoalId) {
      setDragOverGoalId(goalId);
    }
  };

  const handleDragLeave = () => {
    setDragOverGoalId(null);
  };

  const handleDrop = (e: React.DragEvent, targetGoalId: GoalId) => {
    e.preventDefault();
    if (draggedGoalId && draggedGoalId !== targetGoalId) {
      goalStore.reorderGoals(draggedGoalId, targetGoalId);
    }
    setDraggedGoalId(null);
    setDragOverGoalId(null);
  };

  const handleDragEnd = () => {
    setDraggedGoalId(null);
    setDragOverGoalId(null);
  };

  // Generate AI message for the gnome speech bubble
  const generateMessage = async () => {
    // Don't generate if we just generated one recently (within 30 seconds)
    const now = Date.now();
    if (now - lastUpdateRef.current < 30000) {
      return;
    }

    setIsLoadingMessage(true);
    lastUpdateRef.current = now;

    try {
      const message = await generateGnomeMessage({
        tone: userStore.gnomeTone,
        gnomeName: userStore.gnomeName,
        context: 'dashboard',
        userData: {
          streak: gameStore.streak,
          level: gameStore.level,
          xp: gameStore.xp,
          coins: gameStore.coins,
          day: gameStore.day,
          intention: userStore.intention,
          nemesis: userStore.nemesis,
        },
      });
      setGnomeMessage(message);
    } catch (error) {
      console.error('Error generating gnome message:', error);
      setGnomeMessage('Ready for another day of adventure?');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Update timer for next check-in
  useEffect(() => {
    const updateTimer = () => {
      const nextTime = checkInStore.getNextScheduledTime();
      if (!nextTime) {
        setTimeUntilNextCheckIn('');
        return;
      }

      const now = new Date();
      const diff = nextTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilNextCheckIn('Now');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeUntilNextCheckIn(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeUntilNextCheckIn(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilNextCheckIn(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [checkInStore]);

  // Generate message on mount and when key stats change
  useEffect(() => {
    if (!isHealthy) return;

    generateMessage();

    // Update message every 2 minutes
    updateIntervalRef.current = setInterval(() => {
      generateMessage();
    }, 120000); // 2 minutes

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHealthy, gameStore.level, gameStore.streak, gameStore.day]);

  // Also update when goals are completed (but not on initial mount)
  const prevGoalsLeftRef = useRef(goalsLeft);
  useEffect(() => {
    if (isHealthy && prevGoalsLeftRef.current !== goalsLeft && prevGoalsLeftRef.current > 0) {
      // Small delay to let the goal completion animation finish
      const timer = setTimeout(() => {
        generateMessage();
      }, 1000);
      prevGoalsLeftRef.current = goalsLeft;
      return () => clearTimeout(timer);
    }
    prevGoalsLeftRef.current = goalsLeft;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalsLeft, isHealthy]);


  // Determine if it's day or night based on current time
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18; // 6 AM to 6 PM
  const windowDayVideo = 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/clouds-window-day.webm?alt=media&token=ace13dae-be04-4c15-a5ba-87a7ededf071';
  const windowNightImage = 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/window2.png?alt=media&token=7900fbbf-68d8-4cfc-97ce-38b04ae14e20';

  const backgroundClass = isHealthy
    ? ''
    : 'bg-gradient-to-b from-slate-900 to-purple-900';
  
  const backgroundStyle = isHealthy
    ? {
        backgroundImage: 'url(https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home%20background%202.png?alt=media&token=bd1ec79c-cb27-42d5-bd60-ce9e8bf7a19c)',
        backgroundSize: 'contain',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#785843',
        minHeight: '100vh',
      }
    : {};

  // Calculate XP progress for current level
  const getXPForLevel = (level: number): number => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  // Calculate total XP needed to reach current level
  let totalXPForCurrentLevel = 0;
  for (let i = 1; i < gameStore.level; i++) {
    totalXPForCurrentLevel += getXPForLevel(i);
  }

  // XP in current level
  const xpInCurrentLevel = gameStore.xp - totalXPForCurrentLevel;
  const xpNeededForCurrentLevel = getXPForLevel(gameStore.level);
  
  // Progress values for display (0/20 format)
  const currentProgress = Math.max(0, xpInCurrentLevel);
  const totalNeeded = 20;
  
  // Progress percentage for bar
  const progressPercentage = Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));

  return (
    <div 
      className={`w-full flex flex-col items-center text-white transition-all duration-500 relative ${backgroundClass}`}
      style={{
        ...backgroundStyle,
        backgroundColor: isHealthy ? '#785843' : undefined,
        minHeight: '100vh',
      }}
    >
      {/* Window Layer - Above background, below animation */}
      {isHealthy && (
        <>
          {isDaytime ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute"
              style={{
                zIndex: 2,
                top: '35px',
                left: 'calc(50% + 100px)',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                objectPosition: 'top center',
                pointerEvents: 'none',
              }}
            >
              <source src={windowDayVideo} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img 
              src={windowNightImage}
              alt=""
              className="absolute w-full"
              style={{
                zIndex: 2,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                objectFit: 'contain',
                objectPosition: 'top center',
                pointerEvents: 'none',
              }}
              loading="eager"
              decoding="async"
            />
          )}
        </>
      )}
      
      {/* Dartboard - Top Left, Above Fireplace */}
      {isHealthy && (
        <img 
          src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/dart%20side.png?alt=media&token=52f73d19-7c59-4fed-9405-5688c804bb49"
          alt=""
          className="absolute"
          style={{
            zIndex: 6,
            top: '30px',
            left: '25%',
            transform: 'translateX(-50%)',
            width: '140px',
            height: '140px',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
          loading="eager"
          decoding="async"
        />
      )}

      {/* Fireplace Animation - Left of Gnome */}
      {isHealthy && (
        <div 
          className="absolute"
          style={{
            zIndex: 4,
            top: '150px',
            left: 'calc(25% - 30px)',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '180px',
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-contain"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <source src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/fireplace.webm?alt=media&token=317be10b-205f-48f8-b8a2-cd6efc229c72" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* CSS Animation for Speech Bubble Bounce */}
      {isHealthy && gnomeMessage && (
        <style>{`
          @keyframes speechBubbleBounce {
            0% {
              transform: translateY(0);
            }
            52.83% {
              transform: translateY(-5px);
            }
            100% {
              transform: translateY(0);
            }
          }
          .speech-bubble-bounce {
            animation: speechBubbleBounce 2.12s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* Dancing Gnome Video - Top Center */}
      {isHealthy && (
        <>
          <div 
            className="absolute"
            style={{
              zIndex: 5,
              top: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '250px',
              height: '250px',
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full"
              style={{
                objectFit: 'contain',
                objectPosition: 'top center',
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
            >
              <source src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/home-final-bounce.webm?alt=media&token=a071ecb1-805b-42dd-9adb-995c16a16319" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Gnome Speech Bubble */}
          {gnomeMessage && (
            <button
              onClick={() => {
                // Add current message to messages store if it's not already there
                const existingMessages = messageStore.getAllMessages();
                const recentMessage = existingMessages.find(
                  (msg) => msg.content === gnomeMessage && 
                  new Date().getTime() - new Date(msg.createdAt).getTime() < 60000 // Within last minute
                );
                
                if (!recentMessage) {
                  messageStore.addMessage({
                    title: `${userStore.gnomeName} says...`,
                    content: gnomeMessage,
                    read: false,
                    type: 'general',
                  });
                }
                dispatch({ type: 'NAVIGATE_TO', payload: 'messages' });
              }}
              className="absolute cursor-pointer hover:scale-105 transition-transform active:scale-95 speech-bubble-bounce"
              style={{
                zIndex: 30,
                top: '110px',
                left: 'calc(50% + 42px)',
                width: '105px',
                height: '105px',
              }}
            >
              <div 
                className="relative flex items-center justify-center"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Speech bubble image */}
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/bubble%20(1).png?alt=media&token=94383913-2f03-4aab-a0f5-cd967931ec7d"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15))',
                  }}
                  loading="eager"
                  decoding="async"
                />
                
                {/* Message content */}
                <p 
                  className="absolute left-0 right-0 flex items-center justify-center text-black text-xs font-medium text-center leading-tight px-4 z-10 speech-bubble-text"
                  style={{ top: 'calc(50% - 4px)', transform: 'translateY(-50%)' }}
                >
                  {isLoadingMessage ? (
                    <span className="text-gray-500">...</span>
                  ) : (
                    gnomeMessage
                  )}
                </p>
              </div>
            </button>
          )}
        </>
      )}
      
      {/* Content Container - Fixed Position */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center" style={{ paddingTop: '340px' }}>
        {/* Adventure Progress Bar */}
        <div className="w-full px-6" style={{ marginTop: '10px' }}>
        <div 
          className="backdrop-blur-sm rounded-2xl p-2 shadow-lg flex items-center gap-2"
          style={{ backgroundColor: 'rgba(60, 44, 34, 0.6)' }}
        >
          {/* Mushroom Icon */}
          <div className="flex-shrink-0">
                <img 
                  src="/assets/mushroom-icon.png"
                  alt="Mushroom"
                  className="w-8 h-8 object-contain"
                  loading="eager"
                  decoding="async"
                />
          </div>
          
          {/* Text and Progress Bar */}
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="text-white font-semibold text-sm">Next Battle</span>
            
            {/* White Progress Bar */}
            <div className="relative w-full bg-white rounded-full h-5 overflow-hidden flex items-center justify-center">
              {/* Progress Indicator */}
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(to right, #FFB300, #FFD54F)',
                }}
              >
                {/* Inner highlight */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)',
                  }}
                />
              </div>
              
              {/* Progress Text */}
              <span 
                className="relative z-10 font-bold text-sm"
                style={{ 
                  color: currentProgress === 0 
                    ? '#ef4444' // Red when empty
                    : currentProgress === totalNeeded 
                    ? '#22c55e' // Green when full
                    : '#eab308' // Yellow when partially filled
                }}
              >
                {currentProgress} / {totalNeeded}
              </span>
            </div>
          </div>
        </div>
        </div>
        
        {/* Check-In Module */}
        <div className="w-full px-6" style={{ marginTop: '34px' }}>
          {!checkInStore.schedule || !checkInStore.schedule.setupCompleted ? (
            <button
              onClick={() => dispatch({ type: 'NAVIGATE_TO', payload: 'checkin' })}
              className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition-shadow"
            >
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#D4AF37' }}
              >
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/check%20in%20icon.png?alt=media&token=7d0c6b33-af3c-4a3f-acfb-0025dd4dcad7"
                  alt="Check In"
                  className="w-8 h-8 object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-black font-bold text-base">Set Check-In Schedule</h3>
                <p className="text-gray-500 text-sm">Set up your daily check-ins</p>
              </div>
              <div 
                className="flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5} 
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'NAVIGATE_TO', payload: 'checkin' })}
              className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 hover:shadow-lg transition-shadow"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/check%20in%20icon.png?alt=media&token=7d0c6b33-af3c-4a3f-acfb-0025dd4dcad7"
                  alt="Check In"
                  className="w-8 h-8 object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-black font-bold text-base">Check In</h3>
                {timeUntilNextCheckIn && (
                  <p className="text-gray-500 text-sm">Next in {timeUntilNextCheckIn}</p>
                )}
              </div>
              <div 
                className="flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5} 
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-600"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          )}
        </div>
        
        {/* Goals Header */}
        <div className="w-full px-6 mt-6">
        <div className="flex items-center justify-between">
          {/* Calendar Icon */}
          <button className="flex-shrink-0 text-white hover:opacity-80 transition-opacity">
            <CalendarIcon className="w-6 h-6" />
          </button>
          
          {/* Goals Text */}
          <span className="flex-1 text-left text-white font-semibold text-base ml-3">
            {goalsLeft} goal{goalsLeft !== 1 ? 's' : ''} left for today!
          </span>
          
          {/* Plus Icon */}
          <button className="flex-shrink-0 text-white hover:opacity-80 transition-opacity">
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Goal Cards Module */}
      <div className="w-full px-6 mt-3 space-y-3">
        {incompleteGoals.map((goal) => (
          <div 
            key={goal.id} 
            className={`bg-white rounded-2xl p-4 shadow-md flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg ${
              draggedGoalId === goal.id ? 'opacity-50' : ''
            } ${
              dragOverGoalId === goal.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, goal.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, goal.id)}
            onClick={() => {
              goalStore.setSelectedGoal(goal.id);
              dispatch({ type: 'NAVIGATE_TO', payload: 'goals' });
            }}
          >
            {/* Three Dots - Drag Handle */}
            <div 
              className="flex-shrink-0 text-gray-400 -ml-1 cursor-move touch-none"
              draggable
              onDragStart={(e) => handleDragStart(e, goal.id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => e.stopPropagation()}
            >
              <ThreeDotsVerticalIcon className="w-5 h-5" />
            </div>
            
            {/* Rotated Gray Box with Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center -ml-1" style={{ transform: 'rotate(-5deg)' }}>
                  <img 
                    src={getGoalIcon(goal.id)}
                    alt="Icon"
                    className="w-5 h-5 object-contain"
                    loading="eager"
                    decoding="async"
                  />
            </div>
            
            {/* Goal Text */}
            <span className="flex-1 text-black font-bold text-sm">
              {goal.title}
            </span>
            
            {/* XP Reward */}
            <div className="flex items-center gap-1.5">
              <span className="text-black font-semibold text-base">{goal.xp}</span>
                  <img 
                    src="/assets/mushroom-icon.png"
                    alt="Mushroom"
                    className="w-4 h-4 object-contain"
                    loading="eager"
                    decoding="async"
                  />
            </div>
            
            {/* Checkbox - Non-clickable */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            </div>
          </div>
        ))}
        
        {/* Reset Everything Button (Dev Helper) */}
        <button
          onClick={() => {
            goalStore.resetSetupGoals();
            checkInStore.reset();
            gameStore.reset();
            window.location.reload();
          }}
          className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-3 shadow-md font-semibold text-sm transition-colors mb-3"
        >
          Reset Everything
        </button>
        
        {/* Add Goal Module */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-4 shadow-md flex items-center gap-2 border-2 border-dashed border-white/50" style={{ marginBottom: '20px' }}>
          {/* Plus Icon */}
          <div className="flex-shrink-0">
            <PlusIcon className="w-6 h-6 text-white" />
          </div>
          
          {/* Add Goal Text */}
          <span className="flex-1 text-white font-bold text-sm">
            Add a goal
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
