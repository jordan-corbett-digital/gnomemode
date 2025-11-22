import React, { useState } from 'react';
import { useAppState } from '../App';
import Button from './common/Button';
import { useRitualStore } from '../stores/ritualStore';
import { useGameStore } from '../stores/gameStore';
import { useGoalStore } from '../stores/goalStore';
import type { RitualItem } from '../types';

// Predefined evening ritual items
const eveningRitualOptions = [
  'Review your day',
  'Write in a journal',
  'Read for 20 minutes',
  'Meditate for 10 minutes',
  'Plan tomorrow',
  'Do gentle stretches',
  'Practice gratitude',
  'Set phone to do not disturb',
  'Take a warm bath',
  'Listen to calming music',
  'Do breathing exercises',
  'Reflect on accomplishments',
];

// Step 1: Select 3 items
const StepSelectItems: React.FC<{
  onNext: (selectedItems: string[]) => void;
}> = ({ onNext }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const handleToggleItem = (item: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item)) {
      newSelected.delete(item);
    } else {
      if (newSelected.size < 3) {
        newSelected.add(item);
      }
    }
    setSelectedItems(newSelected);
    
    // Automatically advance when 3 items are selected
    if (newSelected.size === 3) {
      onNext(Array.from(newSelected));
    }
  };

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
          >
            <source src="/assets/gnome-icon.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-2 whitespace-nowrap text-center">Choose 3 evening activities</h1>
        <p className="text-black mb-4 text-center">Select 3 items to include in your evening ritual.</p>
        <p className="text-black mb-8 text-center text-sm">Selected: {selectedItems.size}/3</p>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {eveningRitualOptions.map((item) => {
            const isSelected = selectedItems.has(item);
            const isDisabled = !isSelected && selectedItems.size >= 3;

            return (
              <button
                key={item}
                onClick={() => handleToggleItem(item)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'bg-green-500 border-green-600 text-white'
                    : isDisabled
                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-black hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold">{item}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Step 2: Review selected items and add custom one
const StepAddCustom: React.FC<{
  selectedItems: string[];
  onFinish: (items: RitualItem[]) => void;
  onBack: () => void;
}> = ({ selectedItems, onFinish, onBack }) => {
  const [customItem, setCustomItem] = useState('');

  const handleFinish = () => {
    const items: RitualItem[] = [
      ...selectedItems.map((text, index) => ({
        id: `selected-${index}`,
        text,
        completed: false,
      })),
    ];

    if (customItem.trim()) {
      items.push({
        id: 'custom-1',
        text: customItem.trim(),
        completed: false,
      });
    }

    onFinish(items);
  };

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
          >
            <source src="/assets/gnome-icon.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <h1 className="text-2xl font-bold text-black mb-2 whitespace-nowrap text-center">Add one more item</h1>
        <p className="text-black mb-8 text-center">Add a custom activity to complete your ritual.</p>

        {/* Selected items (read-only) */}
        <div className="space-y-2 mb-6">
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="w-full p-3 bg-green-100 border-2 border-green-300 rounded-lg text-black"
            >
              <div className="font-semibold">{item}</div>
            </div>
          ))}
        </div>

        {/* Custom item input */}
        <div className="mb-6">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Add your own activity (optional)"
            className="w-full p-3 bg-white text-black rounded-lg border-2 border-slate-300 focus:border-green-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 mb-4 flex gap-3">
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
export default function EveningRitualSetup() {
  const { dispatch } = useAppState();
  const ritualStore = useRitualStore();
  const gameStore = useGameStore();
  const goalStore = useGoalStore();
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectNext = (items: string[]) => {
    setSelectedItems(items);
    setStep(2);
  };

  const handleFinish = (items: RitualItem[]) => {
    const ritual = {
      type: 'evening' as const,
      items,
      setupCompleted: true,
      completedToday: false,
      createdAt: new Date().toISOString(),
    };

    ritualStore.setEveningRitual(ritual);
    goalStore.completeGoal('evening-ritual');
    gameStore.addXP(5);

    dispatch({ type: 'NAVIGATE_TO', payload: 'garden' });
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ backgroundColor: '#c5e1f2' }}>
      <div className="flex-grow overflow-y-auto hide-scrollbar">
        {step === 1 && <StepSelectItems onNext={handleSelectNext} />}
        {step === 2 && (
          <StepAddCustom
            selectedItems={selectedItems}
            onFinish={handleFinish}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
