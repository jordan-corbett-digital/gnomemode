import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CheckInSchedule, CheckInRecord, CheckInResponse, SeriousnessLevel, CheckInFrequency } from '../types';

interface CheckInState {
  schedule: CheckInSchedule | null;
  records: CheckInRecord[];
  
  // Actions
  setSchedule: (schedule: CheckInSchedule) => void;
  addCheckInRecord: (record: Omit<CheckInRecord, 'id' | 'createdAt'>) => void;
  getTodayCheckIns: () => CheckInRecord[];
  getMissedCheckIns: () => CheckInRecord[];
  hasCompletedCheckInToday: () => boolean;
  getNextScheduledTime: () => Date | null;
  reset: () => void;
}

const initialState: CheckInState = {
  schedule: null,
  records: [],
};

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setSchedule: (schedule) => set({ schedule }),
      
      addCheckInRecord: (record) => {
        const newRecord: CheckInRecord = {
          ...record,
          id: `checkin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ records: [...state.records, newRecord] }));
      },
      
      getTodayCheckIns: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().records.filter((record) => 
          record.scheduledTime.startsWith(today) || 
          (record.completedAt && record.completedAt.startsWith(today))
        );
      },
      
      getMissedCheckIns: () => {
        return get().records.filter((record) => record.missed && !record.completedAt);
      },
      
      hasCompletedCheckInToday: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().records.some((record) => 
          record.completedAt && record.completedAt.startsWith(today)
        );
      },
      
      getNextScheduledTime: () => {
        const schedule = get().schedule;
        if (!schedule || !schedule.setupCompleted) return null;
        
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Get all scheduled times for today
        const scheduledTimes = schedule.times.map((timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const scheduled = new Date(`${today}T${timeStr}:00`);
          return scheduled;
        }).sort((a, b) => a.getTime() - b.getTime());
        
        // Find next scheduled time that hasn't passed (with grace period)
        const gracePeriodMs = schedule.gracePeriodMinutes * 60 * 1000;
        for (const scheduledTime of scheduledTimes) {
          const deadline = new Date(scheduledTime.getTime() + gracePeriodMs);
          if (deadline > now) {
            return scheduledTime;
          }
        }
        
        // If all today's times passed, return first time tomorrow
        if (scheduledTimes.length > 0) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const [hours, minutes] = schedule.times[0].split(':').map(Number);
          tomorrow.setHours(hours, minutes, 0, 0);
          return tomorrow;
        }
        
        return null;
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-checkin',
      storage: createJSONStorage(() => localStorage),
    }
  )
);









