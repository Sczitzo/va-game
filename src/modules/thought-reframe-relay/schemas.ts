import { z } from 'zod';

/**
 * Schema for prompts in Thought Reframe Relay
 * Prompts are "Stuck Thoughts" that participants will reframe
 */
export const thoughtReframePromptSchema = z.object({
  text: z.string().min(1, 'Prompt text is required'),
  topicTags: z.array(z.string()),
  intensity: z.number().min(1).max(5),
});

/**
 * Schema for participant input in Thought Reframe Relay
 * Participants submit a reframe OR pass (never both)
 */
export const thoughtReframeParticipantInputSchema = z.object({
  reframe: z.string().min(1).optional(), // Required if not passing
  isPass: z.boolean().default(false),
}).refine(
  (data) => data.reframe || data.isPass,
  'Must provide either a reframe or pass'
).refine(
  (data) => !(data.reframe && data.isPass),
  'Cannot both reframe and pass'
);

/**
 * Schema for session summary data
 * Contains only explicitly saved responses, no behavioral metrics
 */
export const thoughtReframeSummarySchema = z.object({
  moduleId: z.literal('thought_reframe_relay'),
  numRounds: z.number(),
  attendanceNote: z.string(),
  savedResponses: z.array(z.object({
    participantId: z.string(),
    pseudonymId: z.string().optional(),
    reframe: z.string(),
    // isPass never appears in summary
  })),
});

export type ThoughtReframePromptData = z.infer<typeof thoughtReframePromptSchema>;
export type ThoughtReframeParticipantInput = z.infer<typeof thoughtReframeParticipantInputSchema>;
export type ThoughtReframeSummaryData = z.infer<typeof thoughtReframeSummarySchema>;

