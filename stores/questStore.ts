import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Quest, QuestType } from '../types';

interface QuestState {
  quests: Quest[];
  
  // Actions
  addQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => Quest | null;
  getDailyQuests: () => Quest[];
  getSpecialQuests: () => Quest[];
  generateDailyQuests: () => void;
  generateSpecialQuests: () => void;
  reset: () => void;
}

// Daily quest templates
const dailyQuestTemplates = [
  {
    title: 'Digital Detox',
    description: 'Put your phone away for 30 minutes',
    rewardCoins: 5,
    rewardXP: 25,
    duration: 30, // minutes
  },
  {
    title: 'Stretch Break',
    description: 'Stretch for the next 15 minutes',
    rewardCoins: 5,
    rewardXP: 25,
    duration: 15, // minutes
  },
  {
    title: 'Meditative Moment',
    description: 'Take the next 5 minutes to close your eyes and breathe while limiting any thought.',
    rewardCoins: 5,
    rewardXP: 25,
    duration: 5, // minutes
  },
];

// Special quest templates
const specialQuestTemplates = [
  {
    id: 'daily-warrior',
    title: 'Daily Warrior',
    description: 'Complete daily tasks 3 days in a row',
    explanation: 'Complete your daily check-ins for 3 consecutive days to earn this achievement.',
    rewardCoins: 50,
    rewardXP: 100,
    requiredDays: 3,
  },
  {
    id: 'morning-marvel',
    title: 'Morning Marvel',
    description: 'Complete your morning ritual for 7 days',
    explanation: 'Complete your morning ritual every day for 7 consecutive days to earn this achievement.',
    rewardCoins: 75,
    rewardXP: 150,
    requiredDays: 7,
  },
  {
    id: 'evening-master',
    title: 'Evening Master',
    description: 'Complete your evening ritual for 7 days',
    explanation: 'Complete your evening ritual every day for 7 consecutive days to earn this achievement.',
    rewardCoins: 75,
    rewardXP: 150,
    requiredDays: 7,
  },
];

const initialState: QuestState = {
  quests: [],
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addQuest: (quest) => set((state) => ({
        quests: [...state.quests, quest],
      })),
      
      completeQuest: (questId) => {
        const quest = get().quests.find((q) => q.id === questId);
        if (!quest || quest.completed) return null;
        
        set((state) => ({
          quests: state.quests.map((q) =>
            q.id === questId
              ? { ...q, completed: true, completedAt: new Date().toISOString() }
              : q
          ),
        }));
        
        return quest;
      },
      
      getDailyQuests: () => get().quests.filter((q) => q.type === 'daily'),
      
      getSpecialQuests: () => get().quests.filter((q) => q.type === 'special'),
      
      generateDailyQuests: () => {
        const today = new Date().toISOString().split('T')[0];
        
        // Get existing incomplete daily quests
        const incompleteDailyQuests = get().quests.filter((q) => q.type === 'daily' && !q.completed);
        
        // If there are incomplete quests, replace them with new templates
        if (incompleteDailyQuests.length > 0) {
          // Remove incomplete daily quests (keep completed ones)
          set((state) => ({
            quests: state.quests.filter((q) => !(q.type === 'daily' && !q.completed)),
          }));
        }
        
        // Check if we need to create new quests (if none exist or we just removed incomplete ones)
        const existingIncomplete = get().quests.filter((q) => q.type === 'daily' && !q.completed);
        
        if (existingIncomplete.length === 0) {
          // Generate new quests based on templates
          const newQuests: Quest[] = dailyQuestTemplates.map((template, index) => ({
            id: `daily-${today}-${index}`,
            type: 'daily' as QuestType,
            title: template.title,
            description: template.description,
            rewardCoins: template.rewardCoins,
            rewardXP: template.rewardXP,
            completed: false,
            createdAt: new Date().toISOString(),
            duration: template.duration,
          }));
          
          set((state) => ({
            quests: [...state.quests, ...newQuests],
          }));
        }
      },
      
      generateSpecialQuests: () => {
        // Check if special quests exist, if not create them
        const existingSpecialQuests = get().quests.filter((q) => q.type === 'special');
        
        if (existingSpecialQuests.length === 0) {
          // Generate special quests based on templates
          const newQuests: Quest[] = specialQuestTemplates.map((template) => ({
            id: template.id,
            type: 'special' as QuestType,
            title: template.title,
            description: template.description,
            rewardCoins: template.rewardCoins,
            rewardXP: template.rewardXP,
            completed: false,
            createdAt: new Date().toISOString(),
          }));
          
          set((state) => ({
            quests: [...state.quests, ...newQuests],
          }));
        }
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'gnome-mode-quests',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

