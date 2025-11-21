import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { InventoryItem, ItemType } from '../types';

interface InventoryState {
  items: InventoryItem[];
  
  // Actions
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  equipItem: (itemId: string, type: ItemType) => void;
  unequipItem: (itemId: string) => void;
  getEquippedItems: () => InventoryItem[];
  getItemsByType: (type: ItemType) => InventoryItem[];
  reset: () => void;
}

const initialState: InventoryState = {
  items: [],
};

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.itemId === item.itemId && i.userId === item.userId
        );
        
        if (existingItem) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          const newItem: InventoryItem = {
            ...item,
            id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
          set((state) => ({
            items: [...state.items, newItem],
          }));
        }
      },
      
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      })),
      
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        ),
      })),
      
      equipItem: (itemId, type) => {
        // Unequip other items of the same type first
        set((state) => ({
          items: state.items.map((i) => {
            if (i.type === type && i.id !== itemId) {
              return { ...i, equipped: false };
            }
            if (i.id === itemId) {
              return { ...i, equipped: true };
            }
            return i;
          }),
        }));
      },
      
      unequipItem: (itemId) => set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, equipped: false } : i
        ),
      })),
      
      getEquippedItems: () => get().items.filter((i) => i.equipped),
      
      getItemsByType: (type) => get().items.filter((i) => i.type === type),
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-inventory',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

