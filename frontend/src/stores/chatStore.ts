import { create } from 'zustand';
import { ChatState } from '@/types';

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: '1',
      role: 'ai',
      content: 'Hello! I am Sisyphus, your PM agent. How can I help you build your application today?',
      timestamp: new Date(),
    },
  ],
  isTyping: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setTyping: (typing) => set({ isTyping: typing }),
}));
