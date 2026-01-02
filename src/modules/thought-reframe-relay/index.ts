import { Module, FacilitatorControl, SessionSummaryData } from '@/types/module';
import { Session, Response, Participant } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  thoughtReframePromptSchema,
  thoughtReframeParticipantInputSchema,
  thoughtReframeSummarySchema,
} from './schemas';

export const thoughtReframeRelayModule: Module = {
  id: 'thought_reframe_relay',
  displayName: 'Thought Reframe Relay',
  description: 'Practice reframing "Stuck Thoughts" into balanced alternatives through simultaneous open-response sharing.',
  instructions: `🎯 **How to Play Thought Reframe Relay**

**Goal:** Practice reframing challenging thoughts into balanced, alternative perspectives.

**How it works:**
1. 📖 **Read** the "Stuck Thought" prompt
2. 💭 **Think** of a more balanced way to view it
3. ✍️ **Share** your reframe (or pass - that's okay!)
4. 👀 **See** selected reframes revealed to the group
5. 💬 **Discuss** together with your facilitator

**Remember:**
• There are no right or wrong answers
• Focus on balanced, realistic alternatives
• Passing is always okay - no pressure
• Your responses are anonymous to other participants
• Only responses your facilitator selects will be shown

**Have fun exploring new perspectives!** 🎮`,
  
  promptSchema: thoughtReframePromptSchema,
  participantInputSchema: thoughtReframeParticipantInputSchema,
  summarySchema: thoughtReframeSummarySchema,
  
  facilitatorControls: [
    { id: 'spotlight', label: 'Spotlight', action: 'spotlightResponse' },
    { id: 'hide', label: 'Hide', action: 'hideResponse' },
    { id: 'save', label: 'Save for Follow-up', action: 'saveForFollowup' },
    { id: 'pause', label: 'Pause Session', action: 'pauseSession' },
    { id: 'redFlag', label: 'Red Flag Prompt', action: 'redFlagPrompt' },
  ],
  
  async generateSummary(session, responses, participants): Promise<SessionSummaryData> {
    // Get only saved responses (isPass never appears in summary)
    // Passes are stored with alternativeThought === '__PASS__' marker
    const savedResponses = responses.filter(
      r => r.isSavedForFollowup && r.alternativeThought !== '__PASS__' && r.alternativeThought
    );
    
    // Map to summary format
    const savedResponsesData = savedResponses.map(response => {
      const participant = participants.find(p => p.id === response.participantId);
      return {
        participantId: response.participantId,
        pseudonymId: participant?.pseudonymId || undefined,
        reframe: response.alternativeThought || '', // Using alternativeThought field for reframe
      };
    });
    
    // Generate attendance note (no behavioral metrics)
    const uniqueParticipants = new Set(responses.map(r => r.participantId));
    const attendanceNote = uniqueParticipants.size === participants.length
      ? 'present'
      : `partial (${uniqueParticipants.size} of ${participants.length} participants engaged)`;
    
    return {
      moduleId: 'thought_reframe_relay',
      numRounds: session.numRounds,
      attendanceNote,
      savedResponses: savedResponsesData,
    };
  },
};

