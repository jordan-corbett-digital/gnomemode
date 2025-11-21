import React, { useEffect } from 'react';
import { useQuestStore } from '../stores/questStore';
import { useGameStore } from '../stores/gameStore';

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

  // Generate daily quests if they don't exist
  useEffect(() => {
    questStore.generateDailyQuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dailyQuests = questStore.getDailyQuests().filter(q => !q.completed);

  const handleQuestClick = (questId: string) => {
    // Handle quest click - could navigate to quest details or complete it
    console.log('Quest clicked:', questId);
  };

  return (
    <div 
      className="h-full w-full flex flex-col text-white relative overflow-y-auto hide-scrollbar"
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
                  onClick={() => handleQuestClick(quest.id)}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

