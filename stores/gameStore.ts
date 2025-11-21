import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameData } from '../types';
import { GardenStateEnum } from '../types';

interface GameState extends GameData {
  // Garden state
  gardenState: GardenStateEnum;
  day: number;
  streak: number;
  stakeLost: number;
  lastCheckInDate: string | null;
  checkedInToday: boolean;
  
  // Actions
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  checkInSuccess: () => void;
  checkInFail: (amount: number) => void;
  resetDailyCheckIn: () => void;
  setGardenState: (state: GardenStateEnum) => void;
  incrementDay: () => void;
  reset: () => void;
}

// XP required per level (exponential growth)
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const calculateLevel = (xp: number): { level: number; xpToNext: number } => {
  let level = 1;
  let totalXP = 0;
  
  while (totalXP + getXPForLevel(level) <= xp) {
    totalXP += getXPForLevel(level);
    level++;
  }
  
  const xpInCurrentLevel = xp - totalXP;
  const xpNeededForNext = getXPForLevel(level);
  
  return {
    level,
    xpToNext: xpNeededForNext - xpInCurrentLevel,
  };
};

const initialState: GameState = {
  level: 1,
  xp: 0,
  coins: 100, // Starting coins
  xpToNextLevel: 100,
  gardenState: GardenStateEnum.Healthy,
  day: 1,
  streak: 0,
  stakeLost: 0,
  lastCheckInDate: null,
  checkedInToday: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addXP: (amount) => {
        const currentXP = get().xp;
        const newXP = currentXP + amount;
        const { level: newLevel, xpToNext } = calculateLevel(newXP);
        const oldLevel = get().level;
        
        set({
          xp: newXP,
          level: newLevel,
          xpToNextLevel: xpToNext,
        });
        
        // Return whether level up occurred
        return newLevel > oldLevel;
      },
      
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      
      checkInSuccess: () => {
        const today = new Date().toISOString().split('T')[0];
        const wasLevelUp = get().addXP(50); // 50 XP for successful check-in
        get().addCoins(10); // 10 coins for successful check-in
        
        set((state) => ({
          gardenState: GardenStateEnum.Healthy,
          streak: state.streak + 1,
          day: state.day + 1,
          lastCheckInDate: today,
          checkedInToday: true,
        }));
        
        return wasLevelUp;
      },
      
      checkInFail: (amount) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          gardenState: GardenStateEnum.Failing,
          streak: 0,
          stakeLost: state.stakeLost + amount,
          day: state.day + 1,
          lastCheckInDate: today,
          checkedInToday: true,
        }));
      },
      
      resetDailyCheckIn: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastCheckIn = get().lastCheckInDate;
        
        if (lastCheckIn !== today) {
          set({ checkedInToday: false });
        }
      },
      
      setGardenState: (state) => set({ gardenState: state }),
      
      incrementDay: () => set((state) => ({ day: state.day + 1 })),
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-game',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

