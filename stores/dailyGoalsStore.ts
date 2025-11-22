import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

interface DailyGoalsState {
  goals: DailyGoal[];
  setupCompleted: boolean;
  
  // Actions
  addGoal: (text: string) => void;
  removeGoal: (id: string) => void;
  toggleGoal: (id: string) => boolean; // Returns true if all goals are now completed
  setSetupCompleted: (completed: boolean) => void;
  resetDailyGoals: () => void;
  reset: () => void;
}

const initialState: DailyGoalsState = {
  goals: [],
  setupCompleted: false,
};

export const useDailyGoalsStore = create<DailyGoalsState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addGoal: (text) => {
        if (!text.trim()) return;
        
        const newGoal: DailyGoal = {
          id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          text: text.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },
      
      removeGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },
      
      toggleGoal: (id) => {
        const today = new Date().toISOString().split('T')[0];
        let allCompletedAfterToggle = false;
        
        set((state) => {
          const updatedGoals = state.goals.map((goal) => {
            if (goal.id === id) {
              const wasCompleted = goal.completedAt?.startsWith(today);
              return {
                ...goal,
                completed: !goal.completed,
                completedAt: !goal.completed && !wasCompleted 
                  ? new Date().toISOString() 
                  : undefined,
              };
            }
            return goal;
          });
          
          // Check if all goals are completed after this toggle
          allCompletedAfterToggle = updatedGoals.length > 0 && updatedGoals.every(g => g.completed);
          
          return { goals: updatedGoals };
        });
        
        // Return whether all goals are now completed
        return allCompletedAfterToggle;
      },
      
      setSetupCompleted: (completed) => set({ setupCompleted: completed }),
      
      resetDailyGoals: () => {
        const today = new Date().toISOString().split('T')[0];
        
        set((state) => ({
          goals: state.goals.map((goal) => {
            // Only reset if not completed today
            const completedToday = goal.completedAt?.startsWith(today);
            if (!completedToday) {
              return {
                ...goal,
                completed: false,
                completedAt: undefined,
              };
            }
            return goal;
          }),
        }));
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'gnome-mode-daily-goals',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

