'use client';

import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { useThoughtReframeRelayStore } from '@/stores/thought-reframe-relay-store';

interface ParticipantInputViewProps {
  sessionId: string;
  promptId: string;
  socket: Socket;
}

/**
 * ParticipantInputView - Input form during INPUT state
 * Large, thumb-friendly, reassuring pass option
 */
export function ParticipantInputView({ sessionId, promptId, socket }: ParticipantInputViewProps) {
  const {
    currentPrompt,
    draftReframe,
    hasSubmitted,
    setDraftReframe,
    setHasSubmitted,
  } = useThoughtReframeRelayStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!draftReframe.trim()) {
      return;
    }

    setIsSubmitting(true);

    socket.emit('participant', {
      type: 'submitResponse',
      sessionId,
      payload: {
        promptId,
        reframe: draftReframe.trim(),
        isPass: false,
      },
    });

    setHasSubmitted(true);
    setIsSubmitting(false);
  };

  const handlePass = () => {
    socket.emit('participant', {
      type: 'submitResponse',
      sessionId,
      payload: {
        promptId,
        reframe: '',
        isPass: true,
      },
    });

    setHasSubmitted(true);
  };

  if (hasSubmitted) {
    return (
      <div className="jackbox-card text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thank you – your thought is shared safely
        </h2>
        <p className="text-gray-600">
          Waiting for other responses...
        </p>
      </div>
    );
  }

  return (
    <div className="jackbox-card space-y-6">
      {/* Prompt Reminder */}
      {currentPrompt && (
        <div className="bg-gradient-to-br from-jackbox-purple/10 to-jackbox-blue/10 rounded-xl p-6">
          <div className="text-sm font-semibold text-jackbox-purple mb-2 uppercase tracking-wide">
            Stuck Thought
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {currentPrompt.text}
          </h2>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reframe" className="block text-base font-semibold mb-3 text-gray-900">
            A more balanced thought could be...
          </label>
          <textarea
            id="reframe"
            value={draftReframe}
            onChange={(e) => setDraftReframe(e.target.value)}
            rows={6}
            className="jackbox-input text-base"
            placeholder="Share your balanced perspective..."
            aria-required="false"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={isSubmitting || !draftReframe.trim()}
            className="w-full jackbox-button-primary text-lg py-4 focus-visible-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '⏳ Sharing...' : '💭 Share Thought'}
          </button>

          <button
            type="button"
            onClick={handlePass}
            className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 focus-visible-ring"
          >
            ⏭️ Pass – that&apos;s okay
          </button>
          <p className="text-sm text-center text-gray-500">
            Participation is always voluntary
          </p>
        </div>
      </form>
    </div>
  );
}

