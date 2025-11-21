import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import type { CheckInResponse } from '../types';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';
import { generateGnomeMessage } from '../utils/ai';

// Step 1: How are you feeling?
const StepFeeling: React.FC<{
  onNext: (feeling: string) => void;
}> = ({ onNext }) => {
  const [feeling, setFeeling] = useState('');
  const [feelingText, setFeelingText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const feelingOptions = [
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😔', label: 'Struggling', value: 'struggling' },
    { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
  ];

  const handleSelect = (value: string, emoji: string) => {
    setFeeling(value);
    setSelectedEmoji(emoji);
  };

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">How are you feeling?</h1>
        <p className="text-gray-400 mb-8">Be honest. Your gnome can handle it.</p>

        <div className="space-y-3">
          {feelingOptions.map((option) => {
            const isSelected = feeling === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value, option.emoji)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.emoji}</span>
                  <div className="font-bold text-lg">{option.label}</div>
                </div>
              </button>
            );
          })}
        </div>

        {feeling && (
          <div className="mt-6">
            <label className="block text-white mb-2">Tell me more (optional)</label>
            <textarea
              value={feelingText}
              onChange={(e) => setFeelingText(e.target.value)}
              placeholder="What's going on?"
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none min-h-[100px]"
            />
          </div>
        )}
      </div>

      <div className="mt-6">
        <Button onClick={() => onNext(feelingText || feeling)} fullWidth disabled={!feeling}>
          Next
        </Button>
      </div>
    </div>
  );
};

// Step 2: Did you do the thing?
const StepDidTheThing: React.FC<{
  onNext: (didTheThing: boolean, context?: string) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const userStore = useUserStore();
  const [didTheThing, setDidTheThing] = useState<boolean | null>(null);
  const [context, setContext] = useState('');

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">Did you do it?</h1>
        <p className="text-gray-400 mb-8">
          Did you {userStore.intention.join(' or ')} today?
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setDidTheThing(false)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              didTheThing === false
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <div className="font-bold text-lg">No, I stayed strong</div>
                <div className="text-sm opacity-90">I avoided it today</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setDidTheThing(true)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              didTheThing === true
                ? 'bg-red-500 border-red-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <div className="font-bold text-lg">Yes, I did it</div>
                <div className="text-sm opacity-90">I slipped up</div>
              </div>
            </div>
          </button>
        </div>

        {didTheThing !== null && (
          <div>
            <label className="block text-white mb-2">
              {didTheThing ? 'What happened?' : 'What helped you stay strong?'} (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell me more..."
              className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none min-h-[100px]"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onBack} className="flex-1 bg-slate-600 hover:bg-slate-700">
          Back
        </Button>
        <Button
          onClick={() => didTheThing !== null && onNext(didTheThing, context)}
          fullWidth
          disabled={didTheThing === null}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// Step 3: Frequency/Understanding
const StepFrequency: React.FC<{
  onNext: (frequency: string) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [frequency, setFrequency] = useState('');

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">Help me understand</h1>
        <p className="text-gray-400 mb-8">
          How often did you think about it today? When did it come up?
        </p>

        <div>
          <textarea
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="For example: 'I thought about it a few times in the afternoon, especially after lunch. It was hardest around 3pm when I usually...'"
            className="w-full p-4 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none min-h-[200px]"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onBack} className="flex-1 bg-slate-600 hover:bg-slate-700">
          Back
        </Button>
        <Button onClick={() => onNext(frequency)} fullWidth disabled={!frequency.trim()}>
          Complete Check-In
        </Button>
      </div>
    </div>
  );
};

// Main Check-In Flow Component
export default function CheckInFlow() {
  const { dispatch } = useAppState();
  const checkInStore = useCheckInStore();
  const userStore = useUserStore();
  const gameStore = useGameStore();
  const [step, setStep] = useState(1);
  const [response, setResponse] = useState<Partial<CheckInResponse>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeelingNext = (feeling: string) => {
    setResponse({ ...response, feeling });
    setStep(2);
  };

  const handleDidTheThingNext = (didTheThing: boolean, context?: string) => {
    setResponse({ ...response, didTheThing, context });
    setStep(3);
  };

  const handleFrequencyNext = async (frequency: string) => {
    const fullResponse: CheckInResponse = {
      feeling: response.feeling || '',
      didTheThing: response.didTheThing ?? false,
      frequency,
      context: response.context,
    };

    setIsSubmitting(true);

    try {
      // Calculate XP reward (honesty valued more than success)
      let xpReward = 30; // Base reward for checking in
      if (!fullResponse.didTheThing) {
        xpReward += 20; // Bonus for staying strong
      }
      // Bonus for honesty (if they did the thing but were honest about it)
      if (fullResponse.didTheThing && fullResponse.context) {
        xpReward += 15; // Honesty bonus
      }
      // Add some variance
      xpReward += Math.floor(Math.random() * 10) - 5; // ±5 variance

      // Generate AI response
      const aiResponse = await generateGnomeMessage({
        tone: userStore.gnomeTone,
        gnomeName: userStore.gnomeName,
        context: fullResponse.didTheThing ? 'checkin_fail' : 'checkin_success',
        userData: {
          streak: gameStore.streak,
          level: gameStore.level,
          day: gameStore.day,
          intention: userStore.intention,
        },
      });

      // Record check-in
      const scheduledTime = checkInStore.getNextScheduledTime();
      const schedule = checkInStore.schedule;
      
      // Use the first scheduled time from today if available, otherwise use current time
      let scheduledTimeStr = new Date().toISOString();
      if (scheduledTime) {
        scheduledTimeStr = scheduledTime.toISOString();
      } else if (schedule && schedule.times && schedule.times.length > 0) {
        // Fallback: use first scheduled time for today
        const today = new Date().toISOString().split('T')[0];
        const [hours, minutes] = schedule.times[0].split(':').map(Number);
        const fallbackTime = new Date(`${today}T${schedule.times[0]}:00`);
        scheduledTimeStr = fallbackTime.toISOString();
      }
      
      checkInStore.addCheckInRecord({
        scheduledTime: scheduledTimeStr,
        completedAt: new Date().toISOString(),
        missed: false,
        response: fullResponse,
        aiResponse,
        xpReward,
      });

      // Award XP
      const wasLevelUp = gameStore.addXP(xpReward);
      gameStore.addCoins(10);

      // Update game state
      if (!fullResponse.didTheThing) {
        gameStore.checkInSuccess();
      } else {
        // Still count as checked in, but mark as failure
        const today = new Date().toISOString().split('T')[0];
        gameStore.checkInFail(0); // No money penalty for now
      }

      // Navigate to response screen
      dispatch({ type: 'NAVIGATE_TO', payload: 'checkin-response' });
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  if (isSubmitting) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Your gnome is processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: '#c5e1f2' }}>
      {/* Progress Bar */}
      <div className="w-full bg-slate-700 h-2.5">
        <div
          className="bg-green-500 h-2.5 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-grow overflow-y-auto hide-scrollbar">
        {step === 1 && <StepFeeling onNext={handleFeelingNext} />}
        {step === 2 && (
          <StepDidTheThing
            onNext={handleDidTheThingNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepFrequency
            onNext={handleFrequencyNext}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}

