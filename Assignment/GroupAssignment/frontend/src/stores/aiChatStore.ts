import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  restaurantId?: string;
  branchId?: string;
  lastUpdated: Date;
}

interface AIChatStore {
  sessions: Record<string, ChatSession>;
  getSession: (key: string) => ChatSession | undefined;
  updateSession: (key: string, sessionId: string, messages: Message[], restaurantId?: string, branchId?: string) => void;
  clearSession: (key: string) => void;
  clearAllSessions: () => void;
}

const getSessionKey = (restaurantId?: string, branchId?: string) => {
  return branchId ? `branch-${branchId}` : `restaurant-${restaurantId}`;
};

export const useAIChatStore = create<AIChatStore>()(
  persist(
    (set, get) => ({
      sessions: {},
      
      getSession: (key: string) => {
        const session = get().sessions[key];
        if (!session) return undefined;
        
        return {
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
          lastUpdated: new Date(session.lastUpdated),
        };
      },
      
      updateSession: (key: string, sessionId: string, messages: Message[], restaurantId?: string, branchId?: string) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [key]: {
              sessionId,
              messages,
              restaurantId,
              branchId,
              lastUpdated: new Date(),
            },
          },
        }));
      },
      
      clearSession: (key: string) => {
        set((state) => {
          const newSessions = { ...state.sessions };
          delete newSessions[key];
          return { sessions: newSessions };
        });
      },
      
      clearAllSessions: () => {
        set({ sessions: {} });
      },
    }),
    {
      name: 'ai-chat-storage',
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);

export { getSessionKey };
export type { Message, ChatSession };
