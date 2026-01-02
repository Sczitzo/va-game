import type { ResponsesUpdatePayload } from '@/types/websocket';

interface SpotlightedResponsesProps {
  responses: ResponsesUpdatePayload['spotlightedResponses'];
}

export function SpotlightedResponses({ responses }: SpotlightedResponsesProps) {
  if (responses.length === 0) {
    return null;
  }

  return (
    <div className="jackbox-card">
      <h2 className="text-xl font-bold mb-4 text-jackbox-purple">⭐ Spotlighted Responses</h2>
      <div className="space-y-4">
        {responses.map((response) => (
          <div key={response.id} className="border-l-4 border-jackbox-purple pl-4 py-3 bg-gradient-to-r from-jackbox-purple/5 to-transparent rounded-r-lg">
            <p className="font-semibold mb-2 text-gray-900 text-lg">{response.alternativeThought}</p>
            {response.automaticThought && (
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold text-jackbox-purple">Automatic thought:</span> {response.automaticThought}
              </p>
            )}
            {(response.emotionPre !== undefined || response.emotionPost !== undefined) && (
              <div className="flex items-center gap-4 text-sm">
                {response.emotionPre !== undefined && (
                  <span className="jackbox-badge-blue">Before: {response.emotionPre}/10</span>
                )}
                {response.emotionPost !== undefined && (
                  <span className="jackbox-badge-green">After: {response.emotionPost}/10</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

