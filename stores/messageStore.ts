import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Message } from '../types';

interface MessageState {
  messages: Message[];
  
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  markAsRead: (messageId: string) => void;
  getUnreadMessages: () => Message[];
  getAllMessages: () => Message[];
  deleteMessage: (messageId: string) => void;
  reset: () => void;
}

const initialState: MessageState = {
  messages: [],
};

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addMessage: (messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ 
          messages: [newMessage, ...state.messages] 
        }));
      },
      
      markAsRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, read: true } : msg
          ),
        }));
      },
      
      getUnreadMessages: () => {
        return get().messages.filter((msg) => !msg.read);
      },
      
      getAllMessages: () => {
        return get().messages;
      },
      
      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== messageId),
        }));
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'spitegarden-messages',
      storage: createJSONStorage(() => localStorage),
    }
  )
);







