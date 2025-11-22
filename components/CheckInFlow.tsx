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
        <h1 className="text-2xl font-bold text-black mb-2 text-center">How are you feeling?</h1>
        <p className="text-black mb-8 text-center text-sm">Be honest. Your gnome can handle it.</p>

        <div className="space-y-3">
          {feelingOptions.map((option) => {
            const isSelected = feeling === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value, option.emoji)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'bg-white border-slate-300 text-black hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="font-bold text-base">{option.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => onNext(feeling)} fullWidth disabled={!feeling}>
          Next
        </Button>
      </div>
    </div>
  );
};

// Step 2: Answer a question
const StepQuestion: React.FC<{
  onNext: (answer: string) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [answer, setAnswer] = useState('');

  // Random questions for reflection
  const questions = [
    "What's one thing you're grateful for today?",
    "What challenged you today?",
    "What's something you learned today?",
    "What made you smile today?",
    "What would you do differently if you could?",
  ];

  // Use a consistent question based on day to avoid changing on re-render
  const [question] = useState(() => {
    const day = new Date().getDate();
    return questions[day % questions.length];
  });

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-black mb-2 text-center">One more thing</h1>
        <p className="text-black mb-6 text-center text-sm">{question}</p>

        <div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 bg-white text-black rounded-xl border-2 border-slate-300 focus:border-green-600 focus:outline-none min-h-[150px] resize-none"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onBack} className="flex-1 bg-slate-400 hover:bg-slate-500 text-white">
          Back
        </Button>
        <Button onClick={() => onNext(answer)} fullWidth disabled={!answer.trim()}>
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

  const handleQuestionNext = async (answer: string) => {
    const fullResponse: CheckInResponse = {
      feeling: response.feeling || '',
      didTheThing: false, // No longer tracking habits
      frequency: answer, // Use frequency field to store the question answer
      context: undefined,
    };

    setIsSubmitting(true);

    try {
      // Calculate XP reward
      let xpReward = 30; // Base reward for checking in
      // Add some variance
      xpReward += Math.floor(Math.random() * 10) - 5; // ±5 variance

      // Generate AI response
      const aiResponse = await generateGnomeMessage({
        tone: userStore.gnomeTone,
        gnomeName: userStore.gnomeName,
        context: 'checkin_success',
        userData: {
          streak: gameStore.streak,
          level: gameStore.level,
          day: gameStore.day,
          intention: [],
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

      // Update game state - always success for check-in
      gameStore.checkInSuccess();

      // Navigate to response screen
      dispatch({ type: 'NAVIGATE_TO', payload: 'checkin-response' });
    } catch (error) {
      console.error('Error submitting check-in:', error);
      setIsSubmitting(false);
    }
  };

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  if (isSubmitting) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#c5e1f2' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black text-lg font-semibold">Your gnome is processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: '#c5e1f2' }}>
      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2">
        <div
          className="bg-green-500 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-grow overflow-y-auto hide-scrollbar">
        {step === 1 && <StepFeeling onNext={handleFeelingNext} />}
        {step === 2 && (
          <StepQuestion
            onNext={handleQuestionNext}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
