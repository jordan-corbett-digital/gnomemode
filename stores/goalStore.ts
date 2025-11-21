import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GoalId = 'morning-ritual' | 'evening-ritual' | 'daily-goals';

interface Goal {
  id: GoalId;
  title: string;
  xp: number;
  completed: boolean;
  completedAt?: string;
  order?: number;
}

interface GoalState {
  goals: Goal[];
  selectedGoalId: GoalId | null;
  
  completeGoal: (id: GoalId) => void;
  getIncompleteGoals: () => Goal[];
  reorderGoals: (draggedId: GoalId, targetId: GoalId) => void;
  setSelectedGoal: (id: GoalId | null) => void;
  resetDailyGoals: () => void;
  resetSetupGoals: () => void;
  reset: () => void;
}

const initialGoals: Goal[] = [
  { id: 'morning-ritual', title: 'Set Morning Ritual', xp: 5, completed: false, order: 0 },
  { id: 'evening-ritual', title: 'Set Evening Ritual', xp: 5, completed: false, order: 1 },
  { id: 'daily-goals', title: 'Add Daily Goals', xp: 5, completed: false, order: 2 },
];

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: initialGoals,
      selectedGoalId: null,
      
      setSelectedGoal: (id) => set({ selectedGoalId: id }),
      
      completeGoal: (id) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal || goal.completed) return;
        
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, completed: true, completedAt: new Date().toISOString() }
              : g
          ),
        }));
      },
      
      getIncompleteGoals: () => {
        const incomplete = get().goals.filter((g) => !g.completed && g.id !== 'checkin-schedule');
        // Sort by order if available, otherwise maintain current order
        return incomplete.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      },
      
      reorderGoals: (draggedId, targetId) => {
        const goals = get().goals;
        const draggedIndex = goals.findIndex((g) => g.id === draggedId);
        const targetIndex = goals.findIndex((g) => g.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;
        
        const newGoals = [...goals];
        const [draggedGoal] = newGoals.splice(draggedIndex, 1);
        newGoals.splice(targetIndex, 0, draggedGoal);
        
        // Update order values
        const updatedGoals = newGoals.map((goal, index) => ({
          ...goal,
          order: index,
        }));
        
        set({ goals: updatedGoals });
      },
      
      resetDailyGoals: () => {
        // Reset goals that should reset daily (for now, all goals reset)
        // In the future, we can differentiate between one-time and daily goals
        set({ goals: initialGoals.map((g) => ({ ...g, completed: false, completedAt: undefined })) });
      },
      
      resetSetupGoals: () => {
        // Reset all setup goals to incomplete state and ensure all initial goals exist
        // Also remove any 'checkin-schedule' goals that shouldn't be there
        set((state) => {
          const existingGoals = state.goals;
          const updatedGoals = initialGoals.map((initialGoal) => {
            const existing = existingGoals.find((g) => g.id === initialGoal.id);
            if (existing) {
              // Reset existing goal to incomplete
              return { ...existing, completed: false, completedAt: undefined };
            }
            // Add missing initial goal
            return { ...initialGoal, completed: false };
          });
          
          // Keep any custom goals that aren't in initialGoals, but exclude 'checkin-schedule'
          const customGoals = existingGoals.filter(
            (g) => !initialGoals.some((ig) => ig.id === g.id) && g.id !== 'checkin-schedule'
          );
          
          return { goals: [...updatedGoals, ...customGoals] };
        });
      },
      
      reset: () => set({ goals: initialGoals }),
    }),
    {
      name: 'gnome-mode-goals',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

