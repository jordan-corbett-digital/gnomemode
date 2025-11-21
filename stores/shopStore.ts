import { create } from 'zustand';
import type { ShopItem, ItemType } from '../types';

// Static shop items
const shopItems: ShopItem[] = [
  // Cosmetics
  {
    id: 'hat-1',
    name: 'Wizard Hat',
    price: 50,
    type: 'cosmetic',
    description: 'A pointy hat that makes your gnome look smarter',
  },
  {
    id: 'hat-2',
    name: 'Crown',
    price: 100,
    type: 'cosmetic',
    description: 'Fit for a gnome king',
  },
  {
    id: 'beard-1',
    name: 'Epic Beard',
    price: 75,
    type: 'cosmetic',
    description: 'A magnificent beard that commands respect',
  },
  
  // Powerups
  {
    id: 'powerup-skip',
    name: 'Skip Day Pass',
    price: 25,
    type: 'powerup',
    description: 'Skip a day without losing your streak',
    effect: 'skip_day',
  },
  {
    id: 'powerup-xp-boost',
    name: 'XP Boost',
    price: 30,
    type: 'powerup',
    description: 'Double XP for your next check-in',
    effect: 'xp_boost',
  },
  {
    id: 'powerup-coin-bonus',
    name: 'Coin Bonus',
    price: 20,
    type: 'powerup',
    description: 'Get extra coins on your next quest',
    effect: 'coin_bonus',
  },
];

interface ShopState {
  items: ShopItem[];
  
  // Actions
  getItemsByType: (type: ItemType) => ShopItem[];
  getItemById: (id: string) => ShopItem | undefined;
}

export const useShopStore = create<ShopState>()((set, get) => ({
  items: shopItems,
  
  getItemsByType: (type) => get().items.filter((item) => item.type === type),
  
  getItemById: (id) => get().items.find((item) => item.id === id),
}));









