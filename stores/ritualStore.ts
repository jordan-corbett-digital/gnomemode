import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RitualSchedule, RitualType, RitualItem } from '../types';

interface RitualState {
  morningRitual: RitualSchedule | null;
  eveningRitual: RitualSchedule | null;
  
  // Actions
  setMorningRitual: (ritual: RitualSchedule) => void;
  setEveningRitual: (ritual: RitualSchedule) => void;
  toggleRitualItem: (type: RitualType, itemId: string) => boolean;
  resetDailyRituals: () => void;
  isRitualComplete: (type: RitualType) => boolean;
  reset: () => void;
}

const initialState: RitualState = {
  morningRitual: null,
  eveningRitual: null,
};

export const useRitualStore = create<RitualState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setMorningRitual: (ritual) => set({ morningRitual: ritual }),
      
      setEveningRitual: (ritual) => set({ eveningRitual: ritual }),
      
      toggleRitualItem: (type, itemId) => {
        const ritual = type === 'morning' ? get().morningRitual : get().eveningRitual;
        if (!ritual || !ritual.setupCompleted) return;
        
        const updatedItems = ritual.items.map((item) => {
          if (item.id === itemId) {
            const now = new Date().toISOString();
            return {
              ...item,
              completed: !item.completed,
              completedAt: !item.completed ? now : undefined,
            };
          }
          return item;
        });
        
        const allCompleted = updatedItems.every((item) => item.completed);
        const today = new Date().toISOString().split('T')[0];
        const wasCompletedToday = ritual.completedAt?.startsWith(today) || false;
        const isNowCompleted = allCompleted && !wasCompletedToday;
        
        const updatedRitual: RitualSchedule = {
          ...ritual,
          items: updatedItems,
          completedToday: isNowCompleted,
          completedAt: allCompleted ? new Date().toISOString() : ritual.completedAt,
        };
        
        if (type === 'morning') {
          set({ morningRitual: updatedRitual });
        } else {
          set({ eveningRitual: updatedRitual });
        }
        
        // Return whether ritual was just completed (for awarding rewards)
        return isNowCompleted;
      },
      
      resetDailyRituals: () => {
        const today = new Date().toISOString().split('T')[0];
        
        // Reset morning ritual if not completed today
        const morning = get().morningRitual;
        if (morning && morning.setupCompleted) {
          const completedToday = morning.completedAt?.startsWith(today);
          if (!completedToday) {
            set({
              morningRitual: {
                ...morning,
                items: morning.items.map((item) => ({
                  ...item,
                  completed: false,
                  completedAt: undefined,
                })),
                completedToday: false,
                completedAt: undefined,
              },
            });
          }
        }
        
        // Reset evening ritual if not completed today
        const evening = get().eveningRitual;
        if (evening && evening.setupCompleted) {
          const completedToday = evening.completedAt?.startsWith(today);
          if (!completedToday) {
            set({
              eveningRitual: {
                ...evening,
                items: evening.items.map((item) => ({
                  ...item,
                  completed: false,
                  completedAt: undefined,
                })),
                completedToday: false,
                completedAt: undefined,
              },
            });
          }
        }
      },
      
      isRitualComplete: (type) => {
        const ritual = type === 'morning' ? get().morningRitual : get().eveningRitual;
        if (!ritual || !ritual.setupCompleted) return false;
        return ritual.items.every((item) => item.completed);
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-rituals',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

