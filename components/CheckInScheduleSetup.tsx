import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import type { CheckInFrequency, SeriousnessLevel } from '../types';
import { useCheckInStore } from '../stores/checkInStore';
import { useUserStore } from '../stores/userStore';
import { useGameStore } from '../stores/gameStore';
import { useGoalStore } from '../stores/goalStore';

// Step 1: Frequency Selection
const StepFrequency: React.FC<{
  onNext: (frequency: CheckInFrequency, times: string[]) => void;
}> = ({ onNext }) => {
  const [selectedPeriods, setSelectedPeriods] = useState<Set<CheckInFrequency>>(new Set());
  const [selectedTimes, setSelectedTimes] = useState<Set<string>>(new Set());
  const [showCustom, setShowCustom] = useState(false);
  const [customTimes, setCustomTimes] = useState<string[]>(['09:00']);

  const timeOptions: Record<CheckInFrequency, string[]> = {
    morning: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00'],
    afternoon: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
    evening: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    custom: [],
  };

  // Format time for display: 5 AM, 6 AM, 7 AM, 8 AM, etc.
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const hour = hours;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Always show just the hour with AM/PM (no minutes)
    return `${displayHour} ${ampm}`;
  };

  const periodOptions: {
    value: CheckInFrequency;
    label: string;
    description: string;
  }[] = [
    {
      value: 'morning',
      label: 'Morning',
      description: 'Start your day right',
    },
    {
      value: 'afternoon',
      label: 'Afternoon',
      description: 'Midday check-in',
    },
    {
      value: 'evening',
      label: 'Evening',
      description: 'End of day reflection',
    },
  ];

  const handleTogglePeriod = (period: CheckInFrequency) => {
    const newPeriods = new Set(selectedPeriods);
    if (newPeriods.has(period)) {
      newPeriods.delete(period);
      // Remove times for this period when deselecting
      const timesToRemove = timeOptions[period];
      const newTimes = new Set(selectedTimes);
      timesToRemove.forEach((time) => newTimes.delete(time));
      setSelectedTimes(newTimes);
    } else {
      newPeriods.add(period);
    }
    setSelectedPeriods(newPeriods);
  };

  const handleToggleTime = (time: string) => {
    const newTimes = new Set(selectedTimes);
    if (newTimes.has(time)) {
      newTimes.delete(time);
    } else {
      newTimes.add(time);
    }
    setSelectedTimes(newTimes);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...customTimes];
    newTimes[index] = value;
    setCustomTimes(newTimes);
  };

  const handleAddTime = () => {
    setCustomTimes([...customTimes, '09:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (customTimes.length > 1) {
      setCustomTimes(customTimes.filter((_, i) => i !== index));
    }
  };

  const handleNext = () => {
    const allTimes = Array.from(selectedTimes);
    if (showCustom && customTimes.length > 0) {
      allTimes.push(...customTimes);
    }
    
    if (allTimes.length > 0) {
      // Determine frequency type
      let frequency: CheckInFrequency = 'custom';
      if (selectedPeriods.size === 1 && !showCustom) {
        frequency = Array.from(selectedPeriods)[0];
      } else if (selectedPeriods.size > 1 && !showCustom) {
        frequency = 'custom'; // Multiple periods = custom
      } else if (showCustom) {
        frequency = 'custom';
      }
      
      onNext(frequency, allTimes);
    }
  };

  const   hasSelectedTimes = selectedTimes.size > 0 || (showCustom && customTimes.length > 0);

  return (
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
            onError={(e) => {
              const video = e.currentTarget;
              if (video.error) {
                console.error('Video error details:', {
                  code: video.error.code,
                  message: video.error.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.currentSrc || video.src,
                  canPlayType: video.canPlayType('video/quicktime')
                });
              }
            }}
            onLoadStart={() => console.log('Video load started')}
            onLoadedData={() => console.log('Video data loaded')}
          >
            <source src="/assets/gnome-icon.webm" type="video/webm" />
            Your browser does not support the video tag or MOV format.
          </video>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-2 whitespace-nowrap text-center">When should we check in?</h1>
        <p className="text-black mb-8 text-center">Pick a time (or times) that works for you.</p>

        <div className="space-y-3">
          {periodOptions.map((option) => {
            const isSelected = selectedPeriods.has(option.value);
            const timesForPeriod = timeOptions[option.value];

            return (
              <div key={option.value}>
                <button
                  onClick={() => handleTogglePeriod(option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-white border-green-600 text-black'
                      : 'bg-white border-slate-300 text-black hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-lg">{option.label}</div>
                </button>

                {isSelected && (
                  <div className="mt-3">
                    <div className="grid grid-cols-3 gap-2">
                      {timesForPeriod.map((time) => {
                        const isTimeSelected = selectedTimes.has(time);
                        const displayText = formatTimeDisplay(time);

                        return (
                          <button
                            key={time}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTime(time);
                            }}
                            className={`p-2 rounded-lg border-2 text-sm transition-all ${
                              isTimeSelected
                                ? 'bg-green-500 border-green-600 text-white'
                                : 'bg-white border-slate-300 text-black hover:bg-gray-50'
                            }`}
                          >
                            {displayText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom Option - Smaller */}
          <div>
            <button
              onClick={() => setShowCustom(!showCustom)}
              className={`w-full p-2 rounded-lg border-2 text-left transition-all text-sm ${
                showCustom
                  ? 'bg-white border-green-600 text-black'
                  : 'bg-white border-slate-300 text-black hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold">Custom Times</div>
            </button>

            {showCustom && (
              <div className="mt-3 p-4 bg-white rounded-lg space-y-3">
                {customTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 p-2 bg-white text-black rounded border border-slate-300"
                    />
                    {customTimes.length > 1 && (
                      <button
                        onClick={() => handleRemoveTime(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddTime}
                  className="w-full py-2 bg-white text-black rounded hover:bg-gray-50 border border-slate-300 text-sm"
                >
                  + Add Another Time
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 mb-4">
        <Button onClick={handleNext} fullWidth disabled={!hasSelectedTimes}>
          Next
        </Button>
      </div>
    </div>
  );
};

// Step 2: Seriousness Level
const StepSeriousness: React.FC<{
  onNext: (level: SeriousnessLevel) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [selectedLevel, setSelectedLevel] = useState<SeriousnessLevel | null>(null);

  const seriousnessOptions: {
    value: SeriousnessLevel;
    label: string;
    description: string;
    emoji: string;
  }[] = [
    {
      value: 'casual',
      label: 'Casual',
      description: 'Just trying it out',
      emoji: '😊',
    },
    {
      value: 'moderate',
      label: 'Moderate',
      description: 'Committed but flexible',
      emoji: '💪',
    },
    {
      value: 'serious',
      label: 'Serious',
      description: 'This is important to me',
      emoji: '🔥',
    },
    {
      value: 'extreme',
      label: 'Extreme',
      description: 'All in, no excuses',
      emoji: '⚡',
    },
  ];

  return (
    <div className="flex flex-col h-full justify-between p-6">
      <div className="flex-grow flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">How serious are you?</h1>
        <p className="text-gray-400 mb-8">This affects your check-in options and reminders.</p>

        <div className="space-y-3">
          {seriousnessOptions.map((option) => {
            const isSelected = selectedLevel === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setSelectedLevel(option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{option.emoji}</span>
                  <div>
                    <div className="font-bold text-lg">{option.label}</div>
                    <div className="text-sm opacity-90">{option.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onBack} className="flex-1 bg-slate-600 hover:bg-slate-700">
          Back
        </Button>
        <Button onClick={() => selectedLevel && onNext(selectedLevel)} fullWidth disabled={!selectedLevel}>
          Next
        </Button>
      </div>
    </div>
  );
};

// Step 3: Notifications
const StepNotifications: React.FC<{
  onFinish: (notificationsEnabled: boolean) => void;
  onBack: () => void;
}> = ({ onFinish, onBack }) => {
  const userStore = useUserStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userStore.notificationTime !== null
  );

  const handleFinish = () => {
    onFinish(notificationsEnabled);
  };

  return (
    <div className="flex flex-col h-full justify-between p-6">
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
            onError={(e) => {
              const video = e.currentTarget;
              if (video.error) {
                console.error('Video error details:', {
                  code: video.error.code,
                  message: video.error.message,
                  networkState: video.networkState,
                  readyState: video.readyState,
                  src: video.currentSrc || video.src,
                  canPlayType: video.canPlayType('video/quicktime')
                });
              }
            }}
            onLoadStart={() => console.log('Video load started')}
            onLoadedData={() => console.log('Video data loaded')}
          >
            <source src="/assets/gnome-icon.webm" type="video/webm" />
            Your browser does not support the video tag or MOV format.
          </video>
        </div>
        
        <h1 className="text-3xl font-bold text-black mb-2 text-center">Enable notifications?</h1>
        <p className="text-black mb-8 text-center">
          We'll remind you about check-ins. You can always change this later.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setNotificationsEnabled(true)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              notificationsEnabled
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            }`}
          >
            <div className="font-bold text-lg">Yes, remind me</div>
            <div className="text-sm opacity-90">
              Get notified 10 minutes before your check-in window expires
            </div>
          </button>

          <button
            onClick={() => setNotificationsEnabled(false)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              !notificationsEnabled
                ? 'bg-green-500 border-green-600 text-white'
                : 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600'
            }`}
          >
            <div className="font-bold text-lg">No thanks</div>
            <div className="text-sm opacity-90">I'll remember on my own</div>
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={onBack} className="flex-1 bg-slate-600 hover:bg-slate-700">
          Back
        </Button>
        <Button onClick={handleFinish} fullWidth>
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

// Main Setup Flow Component
export default function CheckInScheduleSetup() {
  const { dispatch } = useAppState();
  const checkInStore = useCheckInStore();
  const gameStore = useGameStore();
  const goalStore = useGoalStore();
  const [step, setStep] = useState(1);
  const [scheduleData, setScheduleData] = useState<{
    frequency?: CheckInFrequency;
    times?: string[];
    seriousnessLevel?: SeriousnessLevel;
  }>({});

  const handleFrequencyNext = (frequency: CheckInFrequency, times: string[]) => {
    setScheduleData({ ...scheduleData, frequency, times });
    setStep(2); // Skip to notifications step
  };

  const handleFinish = (notificationsEnabled: boolean) => {
    if (scheduleData.frequency && scheduleData.times) {
      const schedule = {
        frequency: scheduleData.frequency,
        times: scheduleData.times,
        seriousnessLevel: 'moderate' as SeriousnessLevel, // Default value
        notificationsEnabled,
        gracePeriodMinutes: 60,
        reminderMinutesBefore: 10,
        setupCompleted: true,
      };

      checkInStore.setSchedule(schedule);

      // Award XP for completing setup
      gameStore.addXP(5);

      // Navigate back to home
      dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
    }
  };

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: '#c5e1f2' }}>
      {/* Step Content */}
      <div className="flex-grow overflow-y-auto hide-scrollbar">
        {step === 1 && <StepFrequency onNext={handleFrequencyNext} />}
        {step === 2 && (
          <StepNotifications
            onFinish={handleFinish}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}

