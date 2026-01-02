'use client';

import { useThoughtReframeRelayStore } from '@/stores/thought-reframe-relay-store';

/**
 * FacilitatorControls - Module-specific control buttons
 * Shows appropriate controls based on current module state
 */
export function FacilitatorControls() {
  const {
    moduleState,
    openForResponses,
    closeInput,
    revealSelected,
    continueToDiscussion,
    nextPrompt,
    pauseSession,
    redFlagPrompt,
    currentPrompt,
  } = useThoughtReframeRelayStore();

  const renderControls = () => {
    switch (moduleState) {
      case 'PROMPT_READING':
        return (
          <button
            onClick={openForResponses}
            className="w-full jackbox-button-primary text-lg py-4 focus-visible-ring"
          >
            📝 Open for Responses
          </button>
        );

      case 'INPUT':
        return (
          <div className="space-y-3">
            <button
              onClick={closeInput}
              className="w-full jackbox-button-secondary text-lg py-4 focus-visible-ring"
            >
              🔒 Close Input
            </button>
            <button
              onClick={pauseSession}
              className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:shadow-xl bg-yellow-500 text-white hover:bg-yellow-600 focus-visible-ring"
            >
              ⏸️ Pause Session
            </button>
          </div>
        );

      case 'MODERATION':
        return (
          <div className="space-y-3">
            <button
              onClick={revealSelected}
              className="w-full jackbox-button-primary text-lg py-4 focus-visible-ring"
            >
              ✨ Reveal Selected
            </button>
            <button
              onClick={redFlagPrompt}
              className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:shadow-xl bg-red-500 text-white hover:bg-red-600 focus-visible-ring"
            >
              🚩 Red Flag Prompt
            </button>
          </div>
        );

      case 'REVEAL':
        return (
          <button
            onClick={continueToDiscussion}
            className="w-full jackbox-button-primary text-lg py-4 focus-visible-ring"
          >
            💬 Continue to Discussion
          </button>
        );

      case 'DISCUSSION':
        return (
          <div className="space-y-3">
            {currentPrompt && (
              <button
                onClick={nextPrompt}
                className="w-full jackbox-button-primary text-lg py-4 focus-visible-ring"
              >
                ➡️ Next Prompt
              </button>
            )}
            <button
              onClick={pauseSession}
              className="w-full px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:shadow-xl bg-yellow-500 text-white hover:bg-yellow-600 focus-visible-ring"
            >
              ⏸️ Pause Session
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="jackbox-card">
      <h3 className="text-lg font-bold text-jackbox-purple mb-4">
        Module Controls
      </h3>
      {renderControls()}
    </div>
  );
}

