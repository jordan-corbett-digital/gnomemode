import React, { useEffect, useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import Card from './common/Card';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';

export default function CheckInResponseScreen() {
  const { dispatch } = useAppState();
  const checkInStore = useCheckInStore();
  const userStore = useUserStore();
  const gameStore = useGameStore();
  
  // Get the most recent check-in record
  const [latestRecord, setLatestRecord] = useState<any>(null);

  useEffect(() => {
    const records = checkInStore.records;
    if (records.length > 0) {
      // Get the most recent completed check-in
      const completed = records
        .filter((r) => r.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
      
      if (completed.length > 0) {
        setLatestRecord(completed[0]);
      }
    }
  }, [checkInStore.records]);

  const handleGoHome = () => {
    dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
  };

  if (!latestRecord) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-800">
        <p className="text-white">Loading response...</p>
      </div>
    );
  }

  const didTheThing = latestRecord.response?.didTheThing ?? false;
  const xpReward = latestRecord.xpReward || 0;
  const wasLevelUp = gameStore.level > 1 && gameStore.xp > 0; // Simple check

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-800">
      <Card className="w-full max-w-sm text-center">
        {wasLevelUp && (
          <div className="mb-4 p-4 bg-yellow-500/20 rounded-lg border-2 border-yellow-500">
            <h3 className="text-2xl font-bold text-yellow-400">LEVEL UP! 🎉</h3>
            <p className="text-yellow-200">You're now Level {gameStore.level}!</p>
          </div>
        )}

        <div className="mb-6">
          <div className="text-6xl mb-4">
            {didTheThing ? '😔' : '🎉'}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {didTheThing ? 'Your gnome has thoughts...' : 'Nice work!'}
          </h2>
        </div>

        {latestRecord.aiResponse && (
          <div className="mb-6 p-4 bg-slate-900 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {userStore.gnomeName === 'Slappy' ? '🧙' : '🧙'}
              </div>
              <div className="flex-1">
                <p className="text-white text-lg italic">
                  "{latestRecord.aiResponse}"
                </p>
                <p className="text-gray-400 text-sm mt-2">— {userStore.gnomeName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-slate-900 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Rewards:</div>
          <div className="flex justify-center gap-4 text-lg">
            <span className="text-white">+{xpReward} XP</span>
            <span className="text-white">+10 💰</span>
          </div>
        </div>

        <Button onClick={handleGoHome} fullWidth>
          Back to Home
        </Button>
      </Card>
    </div>
  );
}







