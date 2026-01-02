'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface PromptControlProps {
  sessionId: string;
  promptPackId: string;
  socket: Socket;
}

interface Prompt {
  id: string;
  text: string;
  topicTags: string[];
  intensity: number;
  order: number;
}

export function PromptControl({ sessionId, promptPackId, socket }: PromptControlProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/prompt-packs/${promptPackId}/prompts`)
      .then((res) => res.json())
      .then((data) => {
        setPrompts(data.prompts || []);
        setIsLoading(false);
      });
  }, [promptPackId]);

  const handleNextPrompt = (promptId: string) => {
    socket.emit('facilitator', {
      type: 'nextPrompt',
      payload: { sessionId, promptId },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p>Loading prompts...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Prompts</h2>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handleNextPrompt(prompt.id)}
            className="w-full text-left p-3 border-2 border-gray-300 rounded-lg hover:border-black hover:bg-gray-50 focus-visible-ring"
          >
            <div className="font-medium mb-1">{prompt.text.substring(0, 60)}...</div>
            <div className="text-xs text-gray-600">
              Intensity: {prompt.intensity}/5
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

