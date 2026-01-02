import { create } from 'zustand';
import { SessionStatus, MediaType } from '@prisma/client';
import type {
  SessionStatePayload,
  CurrentPromptPayload,
  ResponsesUpdatePayload,
  ParticipantListUpdatePayload,
} from '@/types/websocket';

interface ParticipantState {
  // Session state
  sessionId: string | null;
  participantId: string | null;
  sessionState: SessionStatePayload | null;
  currentPrompt: CurrentPromptPayload | null;
  
  // Spotlighted responses (participants only see these)
  spotlightedResponses: ResponsesUpdatePayload['spotlightedResponses'];
  
  // Participants list (for lobby/waiting room)
  participants: ParticipantListUpdatePayload['participants'];
  
  // WebSocket connection
  isConnected: boolean;
  socket: any | null; // Socket.io client instance
  
  // Actions
  setSessionId: (sessionId: string | null) => void;
  setParticipantId: (participantId: string | null) => void;
  setSessionState: (state: SessionStatePayload) => void;
  setCurrentPrompt: (prompt: CurrentPromptPayload | null) => void;
  setSpotlightedResponses: (responses: ResponsesUpdatePayload['spotlightedResponses']) => void;
  setParticipants: (participants: ParticipantListUpdatePayload['participants']) => void;
  setSocket: (socket: any) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  participantId: null,
  sessionState: null,
  currentPrompt: null,
  spotlightedResponses: [],
  participants: [],
  isConnected: false,
  socket: null,
};

export const useParticipantStore = create<ParticipantState>((set) => ({
  ...initialState,
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  setParticipantId: (participantId) => set({ participantId }),
  
  setSessionState: (state) => set({ sessionState: state }),
  
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  setSpotlightedResponses: (responses) => set({ spotlightedResponses: responses }),
  
  setParticipants: (participants) => set({ participants }),
  
  setSocket: (socket) => set({ socket }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  reset: () => set(initialState),
}));

