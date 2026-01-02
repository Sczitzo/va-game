'use client';

import { useThoughtReframeRelayStore } from '@/stores/thought-reframe-relay-store';

/**
 * ParticipantRevealView - Shows spotlighted responses during REVEAL and DISCUSSION states
 * Mobile-optimized, warm index card styling
 */
export function ParticipantRevealView() {
  const {
    currentPrompt,
    spotlightedResponses,
    moduleState,
  } = useThoughtReframeRelayStore();

  return (
    <div className="space-y-6">
      {/* Prompt Reminder */}
      {currentPrompt && (
        <div className="jackbox-card text-center">
          <div className="text-sm font-semibold text-jackbox-purple mb-3 uppercase tracking-wide">
            Stuck Thought
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {currentPrompt.text}
          </h2>
        </div>
      )}

      {/* Spotlighted Responses */}
      {spotlightedResponses.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-jackbox-purple text-center mb-4">
            Balanced Thoughts
          </h3>
          {spotlightedResponses.map((response, index) => (
            <div
              key={response.id}
              className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in"
              style={{
                animationDelay: `${index * 0.15}s`,
              }}
            >
              <div className="text-sm font-semibold text-jackbox-purple mb-3 uppercase tracking-wide">
                Balanced Thought
              </div>
              <p className="text-2xl font-medium text-gray-900 leading-relaxed">
                {response.reframe}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="jackbox-card text-center">
          <p className="text-lg text-gray-600">
            No responses to display yet
          </p>
        </div>
      )}

      {/* Discussion State Indicator */}
      {moduleState === 'DISCUSSION' && (
        <div className="jackbox-card text-center bg-gradient-to-br from-jackbox-purple/10 to-jackbox-blue/10">
          <p className="text-lg font-semibold text-gray-700">
            💬 Discussion in progress...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

