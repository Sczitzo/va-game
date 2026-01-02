'use client';

import { useThoughtReframeRelayStore, ThoughtReframeRelayState } from '@/stores/thought-reframe-relay-store';

/**
 * ProjectorView - Public display component for Thought Reframe Relay
 * 
 * Shows content appropriate for TV/projector display:
 * - Current prompt (large, readable)
 * - Anonymous progress indicators
 * - Spotlighted responses (anonymized)
 * - Never shows raw responses, nicknames, or facilitator controls
 */
export function ProjectorView() {
  const {
    moduleState,
    currentPrompt,
    spotlightedResponses,
    anonymousResponseCount,
  } = useThoughtReframeRelayStore();

  const renderStateContent = () => {
    switch (moduleState) {
      case 'LOBBY':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-6">🎮</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Waiting for session to begin...
              </h2>
              <p className="text-xl text-gray-600">
                Join with your room code to participate
              </p>
            </div>
          </div>
        );

      case 'INTRO':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-6">📺</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Introduction
              </h2>
              <p className="text-xl text-gray-600">
                Please watch the introduction video
              </p>
            </div>
          </div>
        );

      case 'PROMPT_READING':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-4xl mx-auto text-center">
              {currentPrompt && (
                <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
                  <div className="text-sm font-semibold text-jackbox-purple mb-4 uppercase tracking-wide">
                    Stuck Thought
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    {currentPrompt.text}
                  </h1>
                  <p className="text-xl text-gray-600 mt-8">
                    Read and reflect...
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'INPUT':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-4xl mx-auto text-center">
              {currentPrompt && (
                <>
                  {/* Prompt Card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-10 mb-8">
                    <div className="text-sm font-semibold text-jackbox-purple mb-4 uppercase tracking-wide">
                      Stuck Thought
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      {currentPrompt.text}
                    </h2>
                  </div>
                  
                  {/* Anonymous Progress Indicator */}
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <p className="text-2xl text-gray-700 mb-4">
                      Responses coming in...
                    </p>
                    <div className="flex justify-center items-center gap-3 flex-wrap">
                      {Array.from({ length: Math.min(anonymousResponseCount, 20) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-jackbox-purple rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                      {anonymousResponseCount > 20 && (
                        <span className="text-lg text-gray-600 ml-2">
                          +{anonymousResponseCount - 20}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Share your balanced thought on your device
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 'MODERATION':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-5xl mb-6">⏳</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Preparing for discussion...
              </h2>
              <p className="text-xl text-gray-600">
                Please wait while responses are reviewed
              </p>
            </div>
          </div>
        );

      case 'REVEAL':
        return (
          <div className="min-h-[60vh] py-8">
            <div className="max-w-6xl mx-auto">
              {currentPrompt && (
                <div className="mb-8 text-center">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 inline-block">
                    <div className="text-sm font-semibold text-jackbox-purple mb-3 uppercase tracking-wide">
                      Stuck Thought
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {currentPrompt.text}
                    </h2>
                  </div>
                </div>
              )}
              
              {/* Spotlighted Responses as Index Cards */}
              {spotlightedResponses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spotlightedResponses.map((response, index) => (
                    <div
                      key={response.id}
                      className="bg-white rounded-2xl shadow-xl p-10 animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.2}s`,
                        animation: 'fadeIn 0.5s ease-in forwards',
                      }}
                    >
                      <div className="text-sm font-semibold text-jackbox-purple mb-4 uppercase tracking-wide">
                        Balanced Thought
                      </div>
                      <p className="text-3xl font-medium text-gray-900 leading-relaxed">
                        {response.reframe}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-2xl text-gray-600">
                    No responses to display
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'DISCUSSION':
        return (
          <div className="min-h-[60vh] py-8">
            <div className="max-w-6xl mx-auto">
              {currentPrompt && (
                <div className="mb-8 text-center">
                  <div className="bg-white rounded-3xl shadow-2xl p-8 inline-block">
                    <div className="text-sm font-semibold text-jackbox-purple mb-3 uppercase tracking-wide">
                      Stuck Thought
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {currentPrompt.text}
                    </h2>
                  </div>
                </div>
              )}
              
              {/* Spotlighted Responses remain visible during discussion */}
              {spotlightedResponses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {spotlightedResponses.map((response) => (
                    <div
                      key={response.id}
                      className="bg-white rounded-2xl shadow-xl p-10"
                    >
                      <div className="text-sm font-semibold text-jackbox-purple mb-4 uppercase tracking-wide">
                        Balanced Thought
                      </div>
                      <p className="text-3xl font-medium text-gray-900 leading-relaxed">
                        {response.reframe}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center mt-8">
                <p className="text-2xl text-gray-700 font-medium">
                  Discussion in progress...
                </p>
              </div>
            </div>
          </div>
        );

      case 'END':
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Session Complete
              </h2>
              <p className="text-xl text-gray-600">
                Thank you for participating!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {renderStateContent()}
      </div>
      
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

