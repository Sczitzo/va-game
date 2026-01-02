import { create } from 'zustand';
import { SessionStatus, MediaType } from '@prisma/client';
import type {
  SessionStatePayload,
  CurrentPromptPayload,
  ResponsesUpdatePayload,
  ParticipantListUpdatePayload,
} from '@/types/websocket';

interface FacilitatorState {
  // Session state
  sessionId: string | null;
  sessionState: SessionStatePayload | null;
  currentPrompt: CurrentPromptPayload | null;
  
  // Participants
  participants: ParticipantListUpdatePayload['participants'];
  
  // Responses (facilitator sees all, not just spotlighted)
  allResponses: Array<{
    id: string;
    participantId: string;
    participantNickname: string;
    promptId: string;
    alternativeThought: string;
    automaticThought?: string;
    emotionPre?: number;
    emotionPost?: number;
    submittedAt: Date;
    isSpotlighted: boolean;
    isHidden: boolean;
    isSavedForFollowup: boolean;
  }>;
  
  // WebSocket connection
  isConnected: boolean;
  socket: any | null; // Socket.io client instance
  
  // Actions
  setSessionId: (sessionId: string | null) => void;
  setSessionState: (state: SessionStatePayload) => void;
  setCurrentPrompt: (prompt: CurrentPromptPayload | null) => void;
  setParticipants: (participants: ParticipantListUpdatePayload['participants']) => void;
  addResponse: (response: FacilitatorState['allResponses'][0]) => void;
  updateResponse: (responseId: string, updates: Partial<FacilitatorState['allResponses'][0]>) => void;
  setSocket: (socket: any) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  sessionState: null,
  currentPrompt: null,
  participants: [],
  allResponses: [],
  isConnected: false,
  socket: null,
};

export const useFacilitatorStore = create<FacilitatorState>((set) => ({
  ...initialState,
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  setSessionState: (state) => set({ sessionState: state }),
  
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  setParticipants: (participants) => set({ participants }),
  
  addResponse: (response) =>
    set((state) => ({
      allResponses: [...state.allResponses, response],
    })),
  
  updateResponse: (responseId, updates) =>
    set((state) => ({
      allResponses: state.allResponses.map((r) =>
        r.id === responseId ? { ...r, ...updates } : r
      ),
    })),
  
  setSocket: (socket) => set({ socket }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  reset: () => set(initialState),
}));

