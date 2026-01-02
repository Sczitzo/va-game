import { Module, FacilitatorControl, SessionSummaryData } from '@/types/module';
import { Session, Response, Participant } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  cbtPromptSchema,
  cbtParticipantInputSchema,
  cbtSummarySchema,
} from './schemas';

export const cbtReframeRelayModule: Module = {
  id: 'cbt_reframe_relay',
  displayName: 'CBT Reframe Relay',
  description: 'Practice identifying alternative, balanced thoughts in a low-pressure, playful way.',
  instructions: `🎯 **How to Play CBT Reframe Relay**

**Goal:** Practice identifying alternative, balanced ways to think about challenging situations.

**How it works:**
1. 📝 Read the prompt - a thought or situation will appear
2. 💭 Think of an alternative, balanced thought
3. ✍️ Submit your alternative thought (required)
4. 🔄 Optional: Share your automatic thought or rate your emotions before/after
5. ⏭️ You can skip any prompt - no pressure!

**Remember:**
• There are no right or wrong answers
• Focus on balanced, realistic alternatives
• Skip anytime - participation is always voluntary
• Your responses are anonymous to other participants
• Only responses the facilitator spotlights will be shown to the group

**Have fun exploring new perspectives!** 🎮`,
  
  promptSchema: cbtPromptSchema,
  participantInputSchema: cbtParticipantInputSchema,
  summarySchema: cbtSummarySchema,
  
  facilitatorControls: [
    { id: 'spotlight', label: 'Spotlight', action: 'spotlightResponse' },
    { id: 'hide', label: 'Hide', action: 'hideResponse' },
    { id: 'save', label: 'Save for Follow-up', action: 'saveForFollowup' },
  ],
  
  async generateSummary(session, responses, participants): Promise<SessionSummaryData> {
    // Get only saved responses
    const savedResponses = responses.filter(r => r.isSavedForFollowup);
    
    // Map to summary format
    const savedResponsesData = savedResponses.map(response => {
      const participant = participants.find(p => p.id === response.participantId);
      return {
        participantId: response.participantId,
        pseudonymId: participant?.pseudonymId || undefined,
        alternativeThought: response.alternativeThought,
        automaticThought: response.automaticThought || undefined,
      };
    });
    
    // Generate attendance note
    const uniqueParticipants = new Set(responses.map(r => r.participantId));
    const attendanceNote = uniqueParticipants.size === participants.length
      ? 'present'
      : `partial (${uniqueParticipants.size} of ${participants.length} participants engaged)`;
    
    return {
      moduleId: 'cbt_reframe_relay',
      numRounds: session.numRounds,
      attendanceNote,
      savedResponses: savedResponsesData,
    };
  },
};

