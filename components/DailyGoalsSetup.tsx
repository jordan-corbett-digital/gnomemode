import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import { useDailyGoalsStore } from '../stores/dailyGoalsStore';
import { useGameStore } from '../stores/gameStore';
import { useGoalStore } from '../stores/goalStore';

export default function DailyGoalsSetup() {
  const { dispatch } = useAppState();
  const dailyGoalsStore = useDailyGoalsStore();
  const gameStore = useGameStore();
  const goalStore = useGoalStore();
  const [newGoalText, setNewGoalText] = useState('');

  const handleAddGoal = () => {
    if (newGoalText.trim()) {
      dailyGoalsStore.addGoal(newGoalText);
      setNewGoalText('');
    }
  };

  const handleRemoveGoal = (id: string) => {
    dailyGoalsStore.removeGoal(id);
  };

  const handleFinish = () => {
    if (dailyGoalsStore.goals.length > 0) {
      if (!dailyGoalsStore.setupCompleted) {
        dailyGoalsStore.setSetupCompleted(true);
        goalStore.completeGoal('daily-goals');
        gameStore.addXP(5);
      }
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }
  };

  const hasGoals = dailyGoalsStore.goals.length > 0;

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: '#c5e1f2' }}>
      <div className="flex-grow overflow-y-auto hide-scrollbar">
        <div className="flex flex-col min-h-full justify-between p-6">
          <div className="flex-grow flex flex-col justify-center">
            {/* Gnome head animation */}
            <div className="w-full flex justify-center" style={{ minHeight: '150px', marginBottom: '6px', marginTop: '-10px' }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="object-contain"
                style={{ 
                  width: '150px',
                  height: '150px',
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  WebkitTransform: 'translateZ(0)',
                  imageRendering: 'auto'
                }}
              >
                <source src="/assets/gnome-icon.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
            
            <h1 className="text-2xl font-bold text-black mb-2 whitespace-nowrap text-center">
              {dailyGoalsStore.setupCompleted ? 'Edit your daily goals' : 'Set up your daily goals'}
            </h1>
            <p className="text-black mb-6 text-center text-sm">Add goals you want to accomplish each day.</p>

            {/* Existing Goals */}
            {dailyGoalsStore.goals.length > 0 && (
              <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                {dailyGoalsStore.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-slate-300"
                  >
                    <span className="flex-1 text-black text-sm">{goal.text}</span>
                    <button
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Goal */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddGoal();
                    }
                  }}
                  placeholder="Enter a goal"
                  className="flex-1 p-3 bg-white text-black rounded-lg border-2 border-slate-300 focus:border-green-600 focus:outline-none"
                />
                <button
                  onClick={handleAddGoal}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 mb-4">
            <Button onClick={handleFinish} fullWidth disabled={!hasGoals}>
              {dailyGoalsStore.setupCompleted ? 'Save Changes' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

