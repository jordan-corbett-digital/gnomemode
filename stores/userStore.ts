import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { OnboardingData, GnomeTone } from '../types';

interface UserState {
  // User data
  userId: string | null;
  userName: string;
  userImage: string | null;
  
  // Gnome data
  gnomeName: string;
  gnomeColor: string;
  gnomeTone: GnomeTone;
  
  // Goal data
  intention: string[];
  motivation: string[];
  nemesis: string;
  wager: number;
  duration: number;
  notificationTime: string | null;
  
  // Actions
  setUser: (user: { userId: string | null; userName: string; userImage: string | null }) => void;
  setGnome: (gnome: { gnomeName: string; gnomeColor: string; gnomeTone: GnomeTone }) => void;
  setGoal: (goal: { intention: string[]; motivation: string[]; nemesis: string; wager: number; duration: number }) => void;
  setNotificationTime: (time: string | null) => void;
  initializeFromOnboarding: (data: OnboardingData) => void;
  reset: () => void;
}

const initialState = {
  userId: null,
  userName: '',
  userImage: null,
  gnomeName: 'Slappy',
  gnomeColor: 'blue',
  gnomeTone: 'spicy' as GnomeTone,
  intention: [],
  motivation: [],
  nemesis: '',
  wager: 50,
  duration: 14,
  notificationTime: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUser: (user) => set({ ...user }),
      
      setGnome: (gnome) => set({ ...gnome }),
      
      setGoal: (goal) => set({ ...goal }),
      
      setNotificationTime: (time) => set({ notificationTime: time }),
      
      initializeFromOnboarding: (data) => set({
        userName: data.userName,
        userImage: data.userImage,
        gnomeName: data.gnomeName,
        gnomeColor: data.gnomeColor,
        gnomeTone: data.gnomeTone || 'spicy',
        intention: data.intention,
        motivation: data.motivation,
        nemesis: data.nemesis,
        wager: data.wager,
        duration: data.duration,
        notificationTime: data.notificationTime,
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

