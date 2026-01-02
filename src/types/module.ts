import { z } from 'zod';
import { Session, Response, Participant } from '@prisma/client';

/**
 * Base module interface that all modules must implement
 */
export interface Module {
  id: string;
  displayName: string;
  description: string;
  instructions: string; // Game instructions visible to all participants
  
  // Schema definitions
  promptSchema: z.ZodSchema; // Validates prompts in PromptPack
  participantInputSchema: z.ZodSchema; // Validates participant responses
  facilitatorControls: FacilitatorControl[];
  summarySchema: z.ZodSchema; // Validates SessionSummary content
  
  // Module-specific logic
  generateSummary(
    session: Session,
    responses: Response[],
    participants: Participant[]
  ): Promise<SessionSummaryData>;
  
  // Optional hooks
  onSessionStart?(session: Session): Promise<void>;
  onSessionEnd?(session: Session): Promise<void>;
  onPromptChange?(session: Session, promptId: string): Promise<void>;
}

export interface FacilitatorControl {
  id: string;
  label: string;
  action: string; // e.g., "spotlight", "hide", "saveForFollowup"
  icon?: string;
}

export interface SessionSummaryData {
  moduleId: string;
  numRounds: number;
  attendanceNote: string;
  savedResponses: Array<{
    participantId: string;
    pseudonymId?: string;
    alternativeThought?: string; // For CBT module
    automaticThought?: string;
    reframe?: string; // For Thought Reframe Relay module
  }>;
}

