
export type Screen = 'demo' | 'intro' | 'onboarding' | 'garden' | 'checkin' | 'checkin-response' | 'goals' | 'report' | 'quests' | 'shop' | 'inventory' | 'profile' | 'messages' | 'nemesis' | 'morning-ritual-reward';

export enum GardenStateEnum {
  Healthy = 'healthy',
  Failing = 'failing',
}

export type GnomeTone = 'soft' | 'spicy' | 'cursed';

// OnboardingData - Simplified for new onboarding flow
// Add fields as needed for your new onboarding process
export interface OnboardingData {
  // TODO: Add your new onboarding data fields here
  [key: string]: any; // Flexible for now
}

export interface GardenData {
  state: GardenStateEnum;
  day: number;
  streak: number;
  stakeLost: number;
  lastCheckInDate: string | null;
  checkedInToday: boolean;
}

// RPG Game Data
export interface GameData {
  level: number;
  xp: number;
  coins: number;
  xpToNextLevel: number;
}

// Quest Types
export type QuestType = 'daily' | 'special';

export interface Quest {
  id: string;
  userId?: string;
  type: QuestType;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXP: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  duration?: number; // Duration in minutes
}

// Inventory Types
export type ItemType = 'cosmetic' | 'powerup';

export interface InventoryItem {
  id: string;
  userId?: string;
  itemId: string;
  name: string;
  type: ItemType;
  quantity: number;
  equipped: boolean;
}

// Shop Item
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: ItemType;
  effect?: string;
  description: string;
}

// Check-In Types
export type CheckInFrequency = 'morning' | 'afternoon' | 'evening' | 'custom';
export type SeriousnessLevel = 'casual' | 'moderate' | 'serious' | 'extreme';

export interface CheckInSchedule {
  frequency: CheckInFrequency;
  times: string[]; // Array of time strings in HH:mm format
  seriousnessLevel: SeriousnessLevel;
  notificationsEnabled: boolean;
  gracePeriodMinutes: number; // Default 60, but can be customized
  reminderMinutesBefore: number; // Default 10
  setupCompleted: boolean;
}

export interface CheckInResponse {
  feeling: string; // How they're feeling
  didTheThing: boolean; // Did they do the thing they're trying to stop
  frequency: string; // Understanding of frequency/context
  context?: string; // Additional context
}

export interface CheckInRecord {
  id: string;
  userId?: string;
  scheduledTime: string; // ISO timestamp
  completedAt?: string; // ISO timestamp if completed
  missed: boolean;
  response?: CheckInResponse;
  aiResponse?: string;
  xpReward?: number;
  xpPenalty?: number; // If missed
  createdAt: string;
}

// Ritual Types
export type RitualType = 'morning' | 'evening';

export interface RitualItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface RitualSchedule {
  type: RitualType;
  items: RitualItem[];
  setupCompleted: boolean;
  completedToday: boolean;
  completedAt?: string;
  createdAt: string;
}

// Message Types
export interface Message {
  id: string;
  userId?: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  type?: 'notification' | 'checkin' | 'level_up' | 'quest' | 'general';
}

export interface AppState {
  screen: Screen;
  onboardingStep: number;
  onboardingData: OnboardingData;
  garden: GardenData;
}

export type Action =
  | { type: 'START_ONBOARDING' }
  | { type: 'NEXT_ONBOARDING_STEP' }
  | { type: 'SET_ONBOARDING_STEP'; payload: number }
  | { type: 'SET_ONBOARDING_DATA'; payload: Partial<OnboardingData> }
  | { type: 'FINISH_ONBOARDING' }
  | { type: 'NAVIGATE_TO'; payload: Screen }
  | { type: 'CHECK_IN_SUCCESS' }
  | { type: 'CHECK_IN_FAIL'; payload: { amount: number } }
  | { type: 'FULFILL_PROMISE' }
  | { type: 'DEV_TOGGLE_GARDEN_STATE' }
  | { type: 'RESET_DAILY_CHECKIN' };