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
  reset: () => void;
}

// Daily quest templates
const dailyQuestTemplates = [
  {
    title: 'Complete a goal',
    description: 'Complete any goal from your daily list',
    rewardCoins: 5,
    rewardXP: 25,
  },
  {
    title: 'Stay Strong',
    description: 'Avoid your habit for the entire day',
    rewardCoins: 10,
    rewardXP: 50,
  },
  {
    title: 'Evening Reflection',
    description: 'Complete your check-in and reflect on the day',
    rewardCoins: 5,
    rewardXP: 25,
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
        
        // Update any existing quests with old title "Morning Check-In" to "Complete a goal"
        set((state) => ({
          quests: state.quests.map((q) =>
            q.title === 'Morning Check-In'
              ? { ...q, title: 'Complete a goal', description: 'Complete any goal from your daily list' }
              : q
          ),
        }));
        
        // Generate new quests if they don't exist for today
        const existingQuests = get().quests.filter(
          (q) => q.type === 'daily' && (q.createdAt.startsWith(today) || q.id.startsWith(`daily-${today}-`))
        );
        
        if (existingQuests.length === 0) {
          const newQuests: Quest[] = dailyQuestTemplates.map((template, index) => ({
            id: `daily-${today}-${index}`,
            type: 'daily' as QuestType,
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

