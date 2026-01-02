import { z } from 'zod';

export const cbtPromptSchema = z.object({
  text: z.string().min(1, 'Prompt text is required'),
  topicTags: z.array(z.string()),
  intensity: z.number().min(1).max(5),
});

export const cbtParticipantInputSchema = z.object({
  alternativeThought: z.string().min(1, 'Alternative thought is required'),
  automaticThought: z.string().optional(),
  emotionPre: z.number().min(0).max(10).optional(),
  emotionPost: z.number().min(0).max(10).optional(),
});

export const cbtSummarySchema = z.object({
  moduleId: z.literal('cbt_reframe_relay'),
  numRounds: z.number(),
  attendanceNote: z.string(),
  savedResponses: z.array(z.object({
    participantId: z.string(),
    pseudonymId: z.string().optional(),
    alternativeThought: z.string(),
    automaticThought: z.string().optional(),
  })),
});

export type CBTPromptData = z.infer<typeof cbtPromptSchema>;
export type CBTParticipantInput = z.infer<typeof cbtParticipantInputSchema>;
export type CBTSummaryData = z.infer<typeof cbtSummarySchema>;

