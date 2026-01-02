'use client';

import { Socket } from 'socket.io-client';

interface ResponseModerationProps {
  sessionId: string;
  responses: Array<{
    id: string;
    participantId: string;
    participantNickname: string;
    promptId: string;
    alternativeThought: string;
    automaticThought?: string;
    emotionPre?: number;
    emotionPost?: number;
    submittedAt: Date;
    isSpotlighted: boolean;
    isHidden: boolean;
    isSavedForFollowup: boolean;
  }>;
  socket: Socket;
}

export function ResponseModeration({ sessionId, responses, socket }: ResponseModerationProps) {
  const handleSpotlight = (responseId: string) => {
    socket.emit('facilitator', {
      type: 'spotlightResponse',
      payload: { sessionId, responseId },
    });
  };

  const handleHide = (responseId: string) => {
    socket.emit('facilitator', {
      type: 'hideResponse',
      payload: { sessionId, responseId },
    });
  };

  const handleSaveForFollowup = (responseId: string) => {
    socket.emit('facilitator', {
      type: 'saveForFollowup',
      payload: { sessionId, responseId },
    });
  };

  const visibleResponses = responses.filter((r) => !r.isHidden);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">
        Responses ({visibleResponses.length})
      </h2>

      {visibleResponses.length === 0 ? (
        <p className="text-gray-500">No responses yet</p>
      ) : (
        <div className="space-y-4">
          {visibleResponses.map((response) => (
            <div
              key={response.id}
              className={`p-4 border-2 rounded-lg ${
                response.isSpotlighted ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">{response.participantNickname}</span>
                <div className="flex gap-2">
                  {response.isSpotlighted && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Spotlighted
                    </span>
                  )}
                  {response.isSavedForFollowup && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Saved
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <p className="font-medium mb-1">Alternative Thought:</p>
                <p className="text-gray-700">{response.alternativeThought}</p>
              </div>

              {response.automaticThought && (
                <div className="mb-3">
                  <p className="font-medium mb-1 text-sm">Automatic Thought:</p>
                  <p className="text-gray-600 text-sm">{response.automaticThought}</p>
                </div>
              )}

              {(response.emotionPre !== undefined || response.emotionPost !== undefined) && (
                <div className="mb-3 text-sm text-gray-600">
                  {response.emotionPre !== undefined && (
                    <span>Before: {response.emotionPre}/10</span>
                  )}
                  {response.emotionPre !== undefined && response.emotionPost !== undefined && ' • '}
                  {response.emotionPost !== undefined && (
                    <span>After: {response.emotionPost}/10</span>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {!response.isSpotlighted && (
                  <button
                    onClick={() => handleSpotlight(response.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus-visible-ring"
                  >
                    Spotlight
                  </button>
                )}
                {!response.isHidden && (
                  <button
                    onClick={() => handleHide(response.id)}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 focus-visible-ring"
                  >
                    Hide
                  </button>
                )}
                {!response.isSavedForFollowup && (
                  <button
                    onClick={() => handleSaveForFollowup(response.id)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus-visible-ring"
                  >
                    Save for Follow-up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

