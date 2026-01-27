import { create } from 'zustand';
import { Socket } from 'socket.io-client';

/**
 * Module-specific state machine for Thought Reframe Relay
 * Server is source of truth - this store syncs via WebSocket
 */
export type ThoughtReframeRelayState =
  | 'LOBBY'
  | 'INTRO'
  | 'PROMPT_READING'
  | 'INPUT'
  | 'MODERATION'
  | 'REVEAL'
  | 'DISCUSSION'
  | 'END';

export type Role = 'participant' | 'facilitator' | 'tv';

export interface ThoughtReframeResponse {
  id: string;
  participantId: string;
  participantNickname?: string; // Only visible to facilitator
  promptId: string;
  reframe: string;
  isPass: boolean; // Never shown in UI or summary, facilitator-only metadata
  submittedAt: Date;
  isSpotlighted: boolean;
  isHidden: boolean;
  isSavedForFollowup: boolean;
}

interface ThoughtReframeRelayStore {
  // Module state
  moduleState: ThoughtReframeRelayState;
  sessionId: string | null;
  role: Role | null;
  
  // Current prompt
  currentPrompt: {
    id: string;
    text: string;
    roundNumber: number;
  } | null;
  
  // Responses (role-dependent visibility)
  allResponses: ThoughtReframeResponse[]; // Facilitator sees all
  spotlightedResponses: Array<{
    id: string;
    reframe: string;
    // NO participant identifiers
  }>; // Public/TV/Participant view
  
  // Anonymous progress indicator (for INPUT state)
  anonymousResponseCount: number; // No names, just count
  
  // Participant draft state
  draftReframe: string;
  hasSubmitted: boolean;
  
  // Spotlight configuration
  maxSpotlighted: number; // Default 3, configurable per session
  
  // WebSocket connection
  socket: Socket | null;
  isConnected: boolean;
  
  // Actions - State Management
  setModuleState: (state: ThoughtReframeRelayState) => void;
  setSessionId: (sessionId: string | null) => void;
  setRole: (role: Role | null) => void;
  setCurrentPrompt: (prompt: ThoughtReframeRelayStore['currentPrompt']) => void;
  
  // Actions - Response Management
  addResponse: (response: ThoughtReframeResponse) => void;
  updateResponse: (responseId: string, updates: Partial<ThoughtReframeResponse>) => void;
  setSpotlightedResponses: (responses: ThoughtReframeRelayStore['spotlightedResponses']) => void;
  setAnonymousResponseCount: (count: number) => void;
  
  // Actions - Participant Draft
  setDraftReframe: (reframe: string) => void;
  setHasSubmitted: (submitted: boolean) => void;
  clearDraft: () => void;
  
  // Actions - Spotlight Management (Facilitator only)
  toggleSpotlight: (responseId: string) => void;
  hideResponse: (responseId: string) => void;
  saveForFollowup: (responseId: string) => void;
  
  // Helper to refresh spotlighted list (internal)
  refreshSpotlightedList: () => void;

  // Actions - Facilitator Controls (Facilitator only)
  openForResponses: () => void;
  closeInput: () => void;
  revealSelected: () => void;
  continueToDiscussion: () => void;
  nextPrompt: () => void;
  pauseSession: () => void;
  redFlagPrompt: () => void;
  
  // Actions - WebSocket
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;
  
  // Server Sync Hooks
  subscribeToSocketEvents: () => void;
  unsubscribeFromSocketEvents: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  moduleState: 'LOBBY' as ThoughtReframeRelayState,
  sessionId: null as string | null,
  role: null as Role | null,
  currentPrompt: null as ThoughtReframeRelayStore['currentPrompt'],
  allResponses: [] as ThoughtReframeResponse[],
  spotlightedResponses: [] as ThoughtReframeRelayStore['spotlightedResponses'],
  anonymousResponseCount: 0,
  draftReframe: '',
  hasSubmitted: false,
  maxSpotlighted: 3,
  socket: null as Socket | null,
  isConnected: false,
};

export const useThoughtReframeRelayStore = create<ThoughtReframeRelayStore>((set, get) => ({
  ...initialState,
  
  // State Management
  setModuleState: (state) => {
    set({ moduleState: state });
    // Clear draft when moving to new prompt
    if (state === 'PROMPT_READING') {
      get().clearDraft();
    }
  },
  
  setSessionId: (sessionId) => set({ sessionId }),
  
  setRole: (role) => set({ role }),
  
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  
  // Response Management
  addResponse: (response) => {
    const { role, allResponses } = get();
    
    // Only facilitator sees all responses with metadata
    if (role === 'facilitator') {
      set({
        allResponses: [...allResponses, response],
      });
    }
    
    // Update anonymous count for public view
    if (!response.isPass) {
      set((state) => ({
        anonymousResponseCount: state.anonymousResponseCount + 1,
      }));
    }
  },
  
  updateResponse: (responseId, updates) => {
    const { role, allResponses } = get();
    
    if (role === 'facilitator') {
      set({
        allResponses: allResponses.map((r) =>
          r.id === responseId ? { ...r, ...updates } : r
        ),
      });
    }
    
    // Update spotlighted list if response was spotlighted/hidden
    if (updates.isSpotlighted !== undefined || updates.isHidden !== undefined) {
      get().refreshSpotlightedList();
    }
  },
  
  setSpotlightedResponses: (responses) => {
    set({ spotlightedResponses: responses });
  },
  
  setAnonymousResponseCount: (count) => set({ anonymousResponseCount: count }),
  
  // Participant Draft
  setDraftReframe: (reframe) => set({ draftReframe: reframe }),
  
  setHasSubmitted: (submitted) => set({ hasSubmitted: submitted }),
  
  clearDraft: () => set({ draftReframe: '', hasSubmitted: false }),
  
  // Spotlight Management (Facilitator only)
  toggleSpotlight: (responseId) => {
    const { role, socket, sessionId, allResponses, maxSpotlighted } = get();
    
    if (role !== 'facilitator' || !socket || !sessionId) return;
    
    const response = allResponses.find((r) => r.id === responseId);
    if (!response) return;
    
    // Check max spotlighted limit
    const currentSpotlighted = allResponses.filter((r) => r.isSpotlighted && !r.isHidden).length;
    if (!response.isSpotlighted && currentSpotlighted >= maxSpotlighted) {
      // Already at max, cannot spotlight more
      return;
    }
    
    const newSpotlighted = !response.isSpotlighted;
    
    // Update locally
    get().updateResponse(responseId, {
      isSpotlighted: newSpotlighted,
      isHidden: false, // Unhide if spotlighting
    });
    
    // Emit to server
    socket.emit('facilitator', {
      type: newSpotlighted ? 'spotlightResponse' : 'hideResponse',
      sessionId,
      payload: { responseId },
    });
    
    get().refreshSpotlightedList();
  },
  
  hideResponse: (responseId) => {
    const { role, socket, sessionId } = get();
    
    if (role !== 'facilitator' || !socket || !sessionId) return;
    
    get().updateResponse(responseId, {
      isHidden: true,
      isSpotlighted: false,
    });
    
    socket.emit('facilitator', {
      type: 'hideResponse',
      sessionId,
      payload: { responseId },
    });
    
    get().refreshSpotlightedList();
  },
  
  saveForFollowup: (responseId) => {
    const { role, socket, sessionId } = get();
    
    if (role !== 'facilitator' || !socket || !sessionId) return;
    
    get().updateResponse(responseId, {
      isSavedForFollowup: true,
    });
    
    socket.emit('facilitator', {
      type: 'saveForFollowup',
      sessionId,
      payload: { responseId },
    });
  },
  
  // Helper to refresh spotlighted list from allResponses (internal, not exposed)
  refreshSpotlightedList: () => {
    const { allResponses } = get();
    const spotlighted = allResponses
      .filter((r) => r.isSpotlighted && !r.isHidden)
      .map((r) => ({
        id: r.id,
        reframe: r.reframe,
        // NO participant identifiers
      }));
    
    get().setSpotlightedResponses(spotlighted);
  },
  
  // Exposed refresh action (for external use)
  refreshSpotlighted: () => {
    get().refreshSpotlightedList();
  },
  
  // Facilitator Controls
  openForResponses: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'openForResponses',
        moduleId: 'thought_reframe_relay',
      },
    });
  },
  
  closeInput: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'closeInput',
        moduleId: 'thought_reframe_relay',
      },
    });
  },
  
  revealSelected: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'revealSelected',
        moduleId: 'thought_reframe_relay',
      },
    });
  },
  
  continueToDiscussion: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'continueToDiscussion',
        moduleId: 'thought_reframe_relay',
      },
    });
  },
  
  nextPrompt: () => {
    const { socket, sessionId, currentPrompt } = get();
    if (!socket || !sessionId || !currentPrompt) return;
    
    socket.emit('facilitator', {
      type: 'nextPrompt',
      sessionId,
      payload: { promptId: currentPrompt.id },
    });
  },
  
  pauseSession: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'pauseSession',
        moduleId: 'thought_reframe_relay',
      },
    });
  },
  
  redFlagPrompt: () => {
    const { socket, sessionId } = get();
    if (!socket || !sessionId) return;
    
    socket.emit('facilitator', {
      type: 'moduleAction',
      sessionId,
      payload: {
        action: 'redFlagPrompt',
        moduleId: 'thought_reframe_relay',
      },
    });
    
    // Clear current responses locally
    set({ allResponses: [], spotlightedResponses: [], anonymousResponseCount: 0 });
  },
  
  // WebSocket
  setSocket: (socket) => set({ socket }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  // Server Sync Hooks
  subscribeToSocketEvents: () => {
    const { socket } = get();
    if (!socket) return;
    
    const handleModuleState = (data: { state: ThoughtReframeRelayState }) => {
      get().setModuleState(data.state);
    };
    
    const handlePromptUpdate = (data: { prompt: ThoughtReframeRelayStore['currentPrompt'] }) => {
      get().setCurrentPrompt(data.prompt);
      get().clearDraft(); // Clear draft on new prompt
    };
    
    const handleResponseUpdate = (data: { response: ThoughtReframeResponse }) => {
      get().addResponse(data.response);
    };
    
    const handleSpotlightedUpdate = (data: { responses: ThoughtReframeRelayStore['spotlightedResponses'] }) => {
      get().setSpotlightedResponses(data.responses);
    };
    
    const handleAnonymousCount = (data: { count: number }) => {
      get().setAnonymousResponseCount(data.count);
    };
    
    // Subscribe to module-specific events
    socket.on('thoughtReframeRelay:state', handleModuleState);
    socket.on('thoughtReframeRelay:prompt', handlePromptUpdate);
    socket.on('thoughtReframeRelay:response', handleResponseUpdate);
    socket.on('thoughtReframeRelay:spotlighted', handleSpotlightedUpdate);
    socket.on('thoughtReframeRelay:anonymousCount', handleAnonymousCount);
  },
  
  unsubscribeFromSocketEvents: () => {
    const { socket } = get();
    if (!socket) return;
    
    socket.off('thoughtReframeRelay:state');
    socket.off('thoughtReframeRelay:prompt');
    socket.off('thoughtReframeRelay:response');
    socket.off('thoughtReframeRelay:spotlighted');
    socket.off('thoughtReframeRelay:anonymousCount');
  },
  
  // Reset
  reset: () => {
    get().unsubscribeFromSocketEvents();
    set(initialState);
  },
}));

