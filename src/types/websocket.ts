import { SessionStatus, MediaType } from '@prisma/client';

// ============================================
// CLIENT → SERVER MESSAGES
// ============================================

// Facilitator Messages
export interface FacilitatorMessage {
  type: FacilitatorMessageType;
  sessionId?: string;
  payload?: any;
}

export type FacilitatorMessageType =
  | 'join'
  | 'createSession'
  | 'startSession'
  | 'nextPrompt'
  | 'spotlightResponse'
  | 'hideResponse'
  | 'saveForFollowup'
  | 'endSession'
  | 'markIntroCompleted'
  | 'moduleAction';

export interface CreateSessionPayload {
  careTeamId: string;
  moduleId: string;
  promptPackId: string;
  numRounds: number;
  sharingDefaults: Record<string, any>;
  introMediaId: string;
}

export interface StartSessionPayload {
  sessionId: string;
}

export interface NextPromptPayload {
  sessionId: string;
  promptId: string;
}

export interface SpotlightResponsePayload {
  sessionId: string;
  responseId: string;
}

export interface HideResponsePayload {
  sessionId: string;
  responseId: string;
}

export interface SaveForFollowupPayload {
  sessionId: string;
  responseId: string;
}

export interface EndSessionPayload {
  sessionId: string;
}

// Participant Messages
export interface ParticipantMessage {
  type: ParticipantMessageType;
  sessionId: string;
  payload?: any;
}

export type ParticipantMessageType =
  | 'join'
  | 'submitResponse'
  | 'skip';

export interface JoinPayload {
  nickname: string;
  pseudonymId?: string;
  roomCode: string;
}

export interface SubmitResponsePayload {
  promptId: string;
  alternativeThought?: string; // For CBT module
  automaticThought?: string;
  emotionPre?: number;
  emotionPost?: number;
  // For Thought Reframe Relay module
  reframe?: string;
  isPass?: boolean;
}

export interface SkipPayload {
  promptId: string;
}

// ============================================
// SERVER → CLIENT MESSAGES
// ============================================

export interface ServerMessage {
  type: ServerMessageType;
  sessionId: string;
  payload: any;
}

export type ServerMessageType =
  | 'sessionState'
  | 'currentPrompt'
  | 'responsesUpdate'
  | 'participantListUpdate'
  | 'error';

export interface SessionStatePayload {
  status: SessionStatus;
  currentRound: number;
  numRounds: number;
  introCompleted: boolean;
  currentPromptId?: string;
  introMedia?: {
    id: string;
    url: string;
    type: MediaType;
  };
}

export interface CurrentPromptPayload {
  promptId: string;
  text: string;
  roundNumber: number;
  topicTags: string[];
  intensity: number;
}

export interface ResponsesUpdatePayload {
  spotlightedResponses: Array<{
    id: string;
    alternativeThought: string;
    automaticThought?: string;
    emotionPre?: number;
    emotionPost?: number;
    // NO participant identifier
  }>;
}

export interface ParticipantListUpdatePayload {
  participants: Array<{
    id: string;
    nickname: string;
    // NO pseudonymId (facilitator-only)
  }>;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

