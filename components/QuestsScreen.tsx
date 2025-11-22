import React, { useEffect, useState, useRef } from 'react';
import { useQuestStore } from '../stores/questStore';
import { useGameStore } from '../stores/gameStore';
import type { Quest } from '../types';

// Color palette for quest icons (different colors for each quest)
const questIconColors = [
  '#FFB300', // Yellow
  '#FF6B6B', // Red/Coral
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#F38181', // Pink
  '#AA96DA', // Purple
  '#FCBAD3', // Light Pink
  '#FFD93D', // Bright Yellow
];

export default function QuestsScreen() {
  const questStore = useQuestStore();
  const gameStore = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedSpecialQuest, setSelectedSpecialQuest] = useState<Quest | null>(null);
  const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get icon URL for special quests
  const getSpecialQuestIcon = (questId: string): string => {
    switch (questId) {
      case 'daily-warrior':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/4.png?alt=media&token=abe247c7-34c8-465f-8c14-e4b512b0eb8b'; // daily-goals icon
      case 'morning-marvel':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/2.png?alt=media&token=b29ad6ed-6740-486f-8496-9b9f1ce2fe0b'; // morning-ritual icon
      case 'evening-master':
        return 'https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/3.png?alt=media&token=95ff6fbc-1d56-49e9-8c02-75178d6c0b1d'; // evening-ritual icon
      default:
        return '/assets/mushroom-icon.png';
    }
  };

  // Generate daily and special quests if they don't exist
  useEffect(() => {
    questStore.generateDailyQuests();
    questStore.generateSpecialQuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  const dailyQuests = questStore.getDailyQuests().filter(q => !q.completed);
  const specialQuests = questStore.getSpecialQuests();

  const handleArrowClick = (e: React.MouseEvent, quest: Quest) => {
    e.stopPropagation();
    setSelectedQuest(quest);
    setIsModalOpen(true);
    setTimeRemaining(quest.duration ? quest.duration * 60 : 0);
    setIsTimerRunning(false);
    setShowCompletionModal(false);
  };

  const handleStartMission = () => {
    if (selectedQuest?.duration) {
      setIsTimerRunning(true);
      setTimeRemaining(selectedQuest.duration * 60);
    }
  };

  const handleCompleteMission = (completed: boolean) => {
    if (completed && selectedQuest) {
      questStore.completeQuest(selectedQuest.id);
      const quest = questStore.getDailyQuests().find(q => q.id === selectedQuest.id);
      if (quest) {
        gameStore.addXP(quest.rewardXP);
        gameStore.addCoins(quest.rewardCoins);
      }
    }
    setShowCompletionModal(false);
    setIsModalOpen(false);
    setSelectedQuest(null);
    setIsTimerRunning(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseModal = () => {
    if (!isTimerRunning) {
      setIsModalOpen(false);
      setSelectedQuest(null);
      setTimeRemaining(0);
      setShowCompletionModal(false);
    }
  };

  return (
    <div 
      className="h-full w-full flex flex-col text-white relative overflow-y-auto hide-scrollbar"
      style={{ backgroundColor: '#95c9e7' }}
    >
      {/* Missions Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute w-full object-cover"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <source src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/lights.webm?alt=media&token=0a6e40eb-df96-4d73-8ddd-70a53a702784" type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
      {/* Missions Fighting Animation - Centered */}
      <div 
        className="absolute"
        style={{
          zIndex: 2,
          top: '-70px',
          left: 'calc(50% - 20px)',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '700px',
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
          <source src="https://firebasestorage.googleapis.com/v0/b/spitegarden.firebasestorage.app/o/missions%20fighting.webm?alt=media&token=5d97a1c6-1795-442b-8f5f-1dcecf60a0ab" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col" style={{ paddingTop: '320px', paddingBottom: '100px' }}>
        {/* Daily Missions Title */}
        <div className="px-6 mb-4" style={{ marginTop: '64px' }}>
          <h1 className="text-2xl font-bold text-white">Daily Missions</h1>
        </div>

        {/* Quest List with Dashed Line */}
        <div className="px-6 space-y-3">
          {dailyQuests.map((quest, index) => {
            const iconColor = questIconColors[index % questIconColors.length];
            const isLast = index === dailyQuests.length - 1;

            return (
              <div key={quest.id} className="flex items-center gap-3">
                {/* Left side: Circle and Dashed Line */}
                <div className="flex flex-col items-center flex-shrink-0 relative" style={{ width: '20px' }}>
                  {/* Dashed Line above circle (only if not first item) */}
                  {index > 0 && (
                    <div 
                      className="absolute bottom-full"
                      style={{
                        width: '2px',
                        borderLeft: '2px dashed rgba(255, 255, 255, 0.5)',
                        height: '48px',
                        marginBottom: '4px',
                      }}
                    />
                  )}
                  
                  {/* Circle */}
                  <div 
                    className="rounded-full border-2 border-white flex-shrink-0"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: quest.completed ? '#4CAF50' : 'transparent',
                    }}
                  >
                    {quest.completed && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Dashed Line below circle (only if not last item) */}
                  {!isLast && (
                    <div 
                      className="absolute top-full"
                      style={{
                        width: '2px',
                        borderLeft: '2px dashed rgba(255, 255, 255, 0.5)',
                        marginTop: '4px',
                        height: '48px',
                      }}
                    />
                  )}
                </div>

                {/* Quest Card */}
                <div 
                  className="flex-1 bg-white rounded-xl p-3 shadow-md flex items-center gap-2 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Icon with colored background */}
                  <div 
                    className="flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: iconColor,
                    }}
                  >
                    <img 
                      src="/assets/mushroom-icon.png"
                      alt="Quest"
                      className="w-6 h-6 object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </div>

                  {/* Quest Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-black font-bold text-sm">
                      {quest.title}
                    </h3>
                  </div>

                  {/* Arrow Icon in Gray Box */}
                  <div 
                    className="flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                    style={{
                      width: '32px',
                      height: '32px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                    }}
                    onClick={(e) => handleArrowClick(e, quest)}
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Missions Title */}
        <div className="px-6 mb-4 mt-8">
          <h1 className="text-2xl font-bold text-white">Special Missions</h1>
        </div>

        {/* Special Missions List */}
        <div className="px-6 space-y-3">
          {specialQuests.map((quest) => {
            const iconColor = questIconColors[specialQuests.indexOf(quest) % questIconColors.length];

            return (
              <div key={quest.id} className="flex items-center gap-3">
                {/* Quest Card */}
                <div 
                  className="flex-1 bg-white rounded-xl p-3 shadow-md flex items-center gap-2 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setSelectedSpecialQuest(quest);
                    setIsSpecialModalOpen(true);
                  }}
                >
                  {/* Icon with colored background */}
                  <div 
                    className="flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: iconColor,
                    }}
                  >
                    <img 
                      src={getSpecialQuestIcon(quest.id)}
                      alt="Quest"
                      className="w-6 h-6 object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  </div>

                  {/* Quest Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-black font-bold text-sm">
                      {quest.title}
                    </h3>
                  </div>

                  {/* Checkbox */}
                  <div 
                    className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center"
                    style={{
                      backgroundColor: quest.completed ? '#4CAF50' : 'transparent',
                      borderColor: quest.completed ? '#4CAF50' : '#9CA3AF',
                    }}
                  >
                    {quest.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Mission Modal */}
      {isSpecialModalOpen && selectedSpecialQuest && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[99]"
            onClick={() => {
              setIsSpecialModalOpen(false);
              setSelectedSpecialQuest(null);
            }}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-64px)] max-w-sm">
            <h2 className="text-2xl font-bold text-black mb-2">{selectedSpecialQuest.title}</h2>
            <p className="text-gray-600 mb-4">{selectedSpecialQuest.description}</p>
            
            {/* Explanation based on quest ID */}
            <div className="mb-6">
              {selectedSpecialQuest.id === 'daily-warrior' && (
                <p className="text-gray-700 text-sm">
                  Complete your daily check-ins for 3 consecutive days to earn this achievement. Your current streak: {gameStore.streak} days.
                </p>
              )}
              {selectedSpecialQuest.id === 'morning-marvel' && (
                <p className="text-gray-700 text-sm">
                  Complete your morning ritual every day for 7 consecutive days to earn this achievement. Keep up your morning routine!
                </p>
              )}
              {selectedSpecialQuest.id === 'evening-master' && (
                <p className="text-gray-700 text-sm">
                  Complete your evening ritual every day for 7 consecutive days to earn this achievement. Stay consistent with your evening routine!
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
              <span className="text-gray-600 text-sm">Reward:</span>
              <div className="flex items-center gap-2">
                <span className="text-black font-semibold">{selectedSpecialQuest.rewardXP} XP</span>
                <span className="text-black font-semibold">{selectedSpecialQuest.rewardCoins} Coins</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSpecialModalOpen(false);
                setSelectedSpecialQuest(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </>
      )}

      {/* Mission Modal */}
      {isModalOpen && selectedQuest && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[99]"
            onClick={handleCloseModal}
            style={{ pointerEvents: isTimerRunning ? 'none' : 'auto' }}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-64px)] max-w-sm">
            <h2 className="text-2xl font-bold text-black mb-2">{selectedQuest.title}</h2>
            <p className="text-gray-600 mb-6">{selectedQuest.description}</p>

            {!isTimerRunning ? (
              <>
                <button
                  onClick={handleStartMission}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors mb-3"
                >
                  Start Mission
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-gray-600 mb-4">Timer is running...</p>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimeRemaining(0);
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Stop Timer
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Completion Modal */}
      {showCompletionModal && selectedQuest && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[99]"
            onClick={() => setShowCompletionModal(false)}
          />

          {/* Completion Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-64px)] max-w-sm">
            <h2 className="text-2xl font-bold text-black mb-4">Did you complete the mission?</h2>
            <div className="flex gap-3">
              <button
                onClick={() => handleCompleteMission(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => handleCompleteMission(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
