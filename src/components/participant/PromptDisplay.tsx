import type { CurrentPromptPayload } from '@/types/websocket';

interface PromptDisplayProps {
  prompt: CurrentPromptPayload;
}

export function PromptDisplay({ prompt }: PromptDisplayProps) {
  return (
    <div className="jackbox-card">
      <div className="mb-4">
        <span className="jackbox-badge-purple mb-2 inline-block">Round {prompt.roundNumber}</span>
        {prompt.topicTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {prompt.topicTags.map((tag) => (
              <span
                key={tag}
                className="jackbox-badge-blue"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">{prompt.text}</h2>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">Intensity:</span>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < prompt.intensity
                  ? 'bg-jackbox-purple'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-700">({prompt.intensity}/5)</span>
      </div>
    </div>
  );
}

