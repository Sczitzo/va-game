'use client';

import { useThoughtReframeRelayStore } from '@/stores/thought-reframe-relay-store';

/**
 * FacilitatorModerationView - Shows all responses during MODERATION state
 * Facilitator-only view with moderation controls
 */
export function FacilitatorModerationView() {
  const {
    allResponses,
    currentPrompt,
    maxSpotlighted,
    toggleSpotlight,
    hideResponse,
    saveForFollowup,
  } = useThoughtReframeRelayStore();

  // Filter out passes (isPass flag) and hidden responses
  const visibleResponses = allResponses.filter((r) => !r.isHidden && !r.isPass);
  const spotlightedCount = allResponses.filter((r) => r.isSpotlighted && !r.isHidden).length;
  const canSpotlightMore = spotlightedCount < maxSpotlighted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="jackbox-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-jackbox-purple">
            Moderation Queue
          </h2>
          <div className="text-sm text-gray-600">
            {spotlightedCount} / {maxSpotlighted} spotlighted
          </div>
        </div>
        
        {currentPrompt && (
          <div className="bg-gradient-to-br from-jackbox-purple/10 to-jackbox-blue/10 rounded-xl p-4 mb-4">
            <div className="text-xs font-semibold text-jackbox-purple mb-1 uppercase tracking-wide">
              Current Prompt
            </div>
            <p className="text-lg font-medium text-gray-900">
              {currentPrompt.text}
            </p>
          </div>
        )}
      </div>

      {/* Responses Grid */}
      {visibleResponses.length === 0 ? (
        <div className="jackbox-card text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-lg text-gray-600">
            No responses to moderate yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleResponses.map((response) => {
            const isSpotlighted = response.isSpotlighted;
            const canSpotlight = canSpotlightMore || isSpotlighted;

            return (
              <div
                key={response.id}
                className={`jackbox-card ${
                  isSpotlighted ? 'border-4 border-jackbox-purple bg-jackbox-purple/5' : ''
                }`}
              >
                {/* Response Content */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {response.participantNickname || 'Anonymous'}
                    </span>
                    {isSpotlighted && (
                      <span className="jackbox-badge-purple text-xs">
                        Spotlighted
                      </span>
                    )}
                    {response.isSavedForFollowup && (
                      <span className="jackbox-badge-green text-xs">
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-900 leading-relaxed">
                    {response.reframe}
                  </p>
                </div>

                {/* Moderation Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {!isSpotlighted && (
                    <button
                      onClick={() => toggleSpotlight(response.id)}
                      disabled={!canSpotlight}
                      className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-colors focus-visible-ring ${
                        canSpotlight
                          ? 'bg-jackbox-purple text-white hover:bg-jackbox-blue'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      ⭐ Spotlight
                    </button>
                  )}
                  
                  {isSpotlighted && (
                    <button
                      onClick={() => toggleSpotlight(response.id)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-colors focus-visible-ring"
                    >
                      ❌ Unspotlight
                    </button>
                  )}

                  {!response.isHidden && (
                    <button
                      onClick={() => hideResponse(response.id)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold bg-gray-500 text-white hover:bg-gray-600 transition-colors focus-visible-ring"
                    >
                      👁️‍🗨️ Hide
                    </button>
                  )}

                  {!response.isSavedForFollowup && (
                    <button
                      onClick={() => saveForFollowup(response.id)}
                      className="px-3 py-1.5 text-sm rounded-lg font-semibold bg-jackbox-green text-white hover:bg-green-600 transition-colors focus-visible-ring"
                    >
                      💾 Save
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pass Count (Facilitator-only metadata) */}
      {allResponses.filter((r) => r.isPass).length > 0 && (
        <div className="jackbox-card bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Note: {allResponses.filter((r) => r.isPass).length} participant(s) passed on this prompt
          </p>
        </div>
      )}
    </div>
  );
}

