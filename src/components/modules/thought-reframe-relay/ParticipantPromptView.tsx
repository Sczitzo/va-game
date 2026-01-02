'use client';

import { useThoughtReframeRelayStore } from '@/stores/thought-reframe-relay-store';

/**
 * ParticipantPromptView - Shows prompt during PROMPT_READING state
 * Mobile-optimized, thumb-friendly
 */
export function ParticipantPromptView() {
  const { currentPrompt } = useThoughtReframeRelayStore();

  if (!currentPrompt) return null;

  return (
    <div className="jackbox-card">
      <div className="text-center mb-6">
        <div className="text-sm font-semibold text-jackbox-purple mb-3 uppercase tracking-wide">
          Stuck Thought
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {currentPrompt.text}
        </h1>
        <p className="text-lg text-gray-600 mt-6">
          Read and reflect...
        </p>
      </div>
    </div>
  );
}

